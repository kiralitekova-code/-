import * as THREE from 'three';
import { createScene, createRenderer, applySeason, applyTimeOfDay } from './world.js';
import { createPlayer, createHumanoid, PlayerController } from './player.js';
import { createNPCs, createAnimals, updateAnimals } from './npc.js';
import { UI } from './ui.js';
import {
  newState, saveGame, loadGame, hasSave, seasonOf, dayOfSeason,
  rollDailyQuests, itemIcon, isSeedItem, SEED_ITEM_PREFIX, seedItemId,
} from './state.js';
import { CROPS, ANIMALS, ORE, SEASONS, DAYS_PER_SEASON, STORY_QUESTS, DAILY_QUESTS, NPCS } from './data.js';

export class Game {
  constructor() {
    this.state = newState();
    this.paused = true;
    this.interactables = [];
    this.animalList = [];
    this.plotPlants = this.state.plots.map(() => null);
    this.clock = new THREE.Clock();
    this.lastInterstitialDay = -1;

    const { renderer, camera } = createRenderer();
    this.renderer = renderer;
    this.camera = camera;
    this.scene3d = createScene();
    this.scene = this.scene3d.scene;

    this.player = createPlayer();
    this.scene.add(this.player);
    this.controller = new PlayerController(this.player, this.camera);
    this.controller.onAction = () => this.tryInteract();
    this.controller.onSeedCycle = () => this.cycleSeed();

    this.npcs = createNPCs(this.scene);
    this.animalFactory = createAnimals(this.scene);
    this.ui = new UI(this);

    this.setupJoystick();
    this.setupMenu();
    this.animate();
    window.game = this;
  }

  setupJoystick() {
    const zone = document.getElementById('joystick-zone');
    const base = document.getElementById('joystick-base');
    const stick = document.getElementById('joystick-stick');
    let active = false, centerX = 0, centerY = 0;
    const R = 40;
    const start = e => {
      const rect = base.getBoundingClientRect();
      // База следует за пальцем в пределах зоны
      centerX = e.clientX; centerY = e.clientY;
      base.style.left = (centerX - rect.width / 2) + 'px';
      base.style.top = (centerY - rect.height / 2) + 'px';
      base.style.bottom = 'auto';
      active = true;
      move(e);
    };
    const move = e => {
      if (!active) return;
      let dx = e.clientX - centerX, dy = e.clientY - centerY;
      const len = Math.hypot(dx, dy);
      if (len > R) { dx = dx / len * R; dy = dy / len * R; }
      stick.style.left = (30 + dx) + 'px';
      stick.style.top = (30 + dy) + 'px';
      this.controller.setJoystick(dx / R, dy / R);
    };
    const end = () => {
      active = false;
      stick.style.left = '30px'; stick.style.top = '30px';
      base.style.left = ''; base.style.top = ''; base.style.bottom = '30px';
      this.controller.setJoystick(0, 0);
    };
    zone.addEventListener('pointerdown', e => { start(e); zone.setPointerCapture(e.pointerId); });
    zone.addEventListener('pointermove', move);
    zone.addEventListener('pointerup', end);
    zone.addEventListener('pointercancel', end);
    const act = document.getElementById('mbtn-action');
    act.addEventListener('pointerdown', e => { e.preventDefault(); this.tryInteract(); });
  }

  setupMenu() {
    const menu = document.getElementById('main-menu');
    menu.classList.add('visible');
    const closeMenu = () => { menu.classList.remove('visible'); menu.classList.add('hidden'); };
    document.getElementById('btn-new-game').onclick = () => { closeMenu(); this.startGame(false); };
    const cont = document.getElementById('btn-continue');
    if (hasSave()) {
      cont.disabled = false;
      cont.onclick = () => { closeMenu(); this.startGame(true); };
    }
  }

  startGame(fromSave) {
    if (fromSave) {
      const s = loadGame();
      if (s) this.state = s;
    }
    this.plotPlants = this.state.plots.map(() => null);
    this.syncAnimalMeshes();
    this.state.plots.forEach((p, i) => {
      if (p.state === 'tilled' || p.state === 'planted') this.scene3d.plotMeshes[i].soil.visible = true;
      if (p.state === 'planted') this.plantVisual(i, p.crop);
    });
    applySeason(this.scene3d, seasonOf(this.state.day));
    document.getElementById('hud').classList.remove('hidden');
    if ('ontouchstart' in window) document.getElementById('mobile-controls').classList.remove('hidden');
    this.paused = false;
    this.ui.updateHUD(this.state);
    this.updateQuestUI();
    this.ui.toast('🌾 Добро пожаловать в Берёзовку!');
    if (!fromSave) {
      setTimeout(() => this.storyIntro(), 600);
    }
  }

  storyIntro() {
    this.ui.showDialog('Нотариус (письмо)', 'Уважаемый Максим!\nВаш дед, Иван Петрович, оставил вам ферму в деревне Берёзовка.\nУсловие завещания: восстановите хозяйство за 4 сезона — иначе земли выкупит «АгроХолдинг» Виктора Громова.', null, () => {
      this.ui.showDialog('Дед Иван (сон)', 'Внук... Не бойся земли. Она кормит того, кто заботится о ней.\nНачни с грядок у дома. Мотыга в сарае. И заходи к людям — в одиночку не спасти ферму.', null, () => {
        this.ui.toast('📜 Новый квест: «Уборка фермы»');
      });
    });
  }

  // ================== Взаимодействие ==================
  findNearestInteractable() {
    const p = this.player.position;
    let best = null, bestDist = 3.2;
    const consider = (x, z, obj) => {
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < bestDist) { bestDist = d; best = obj; }
    };
    // Грядки
    this.scene3d.plotMeshes.forEach((pm, i) => consider(pm.x, pm.z, { type: 'plot', index: i }));
    // NPC
    for (const n of this.npcs) consider(n.mesh.position.x, n.mesh.position.z, { type: 'npc', npc: n });
    // Животные
    for (const a of this.animalList) consider(a.mesh.position.x, a.mesh.position.z, { type: 'animal', animal: a });
    // Дом (сон)
    consider(-16, -6.5, { type: 'bed' });
    // Амбар
    consider(16, -8, { type: 'barn' });
    // Магазин
    consider(-8, 29.5, { type: 'shop' });
    // Камни
    for (const r of this.scene3d.rocks) if (r.alive) consider(r.mesh.position.x, r.mesh.position.z, { type: 'rock', rock: r });
    // Сундук
    if (this.scene3d.chest.visible) consider(-45, -70, { type: 'chest' });
    // Рыбалка
    consider(60, 11, { type: 'fish' });
    return best;
  }

  tryInteract() {
    if (this.paused) return;
    const it = this.findNearestInteractable();
    if (!it) return;
    switch (it.type) {
      case 'plot': return this.interactPlot(it.index);
      case 'npc': return this.talkTo(it.npc);
      case 'animal': return this.collectAnimal(it.animal);
      case 'bed': return this.sleep();
      case 'shop': return this.ui.togglePanel('shop');
      case 'rock': return this.mineRock(it.rock);
      case 'chest': return this.openChest();
      case 'fish': return this.fishing();
      case 'barn': return this.ui.toast('🚜 Трактор деда Ивана. Сеня обещал его починить... как-нибудь.');
    }
  }

  spendEnergy(n) {
    if (this.state.energy < n) {
      this.ui.toast('😴 Слишком устал! Пора спать в доме.');
      return false;
    }
    this.state.energy -= n;
    return true;
  }

  interactPlot(i) {
    const plot = this.state.plots[i];
    const pm = this.scene3d.plotMeshes[i];
    const season = seasonOf(this.state.day);
    if (plot.state === 'grass') {
      if (!this.spendEnergy(5)) return;
      plot.state = 'tilled';
      pm.soil.visible = true;
      this.state.stats.tilled++;
      this.ui.toast('⛏️ Грядка вспахана');
    } else if (plot.state === 'tilled') {
      const seedId = SEED_ITEM_PREFIX + this.state.selectedSeed;
      if (!this.state.inventory[seedId]) { this.ui.toast('🌱 Нет семян! Купи в магазине или выбери другие (Q)'); return; }
      const crop = CROPS[this.state.selectedSeed];
      if (crop.season !== season && crop.season !== undefined) {
        this.ui.toast(`🌡️ ${crop.name} — не для этого сезона! (${SEASONS[crop.season].name})`);
        return;
      }
      this.state.inventory[seedId]--;
      plot.state = 'planted';
      plot.crop = this.state.selectedSeed;
      plot.growth = 0;
      plot.watered = false;
      this.plantVisual(i, plot.crop);
      this.ui.updateHUD(this.state);
      this.ui.toast(`${crop.icon} Посажено: ${crop.name}`);
    } else if (plot.state === 'planted') {
      if (!plot.watered) {
        if (!this.spendEnergy(3)) return;
        plot.watered = true;
        this.state.stats.wateredToday++;
        this.state.stats.fireExtinguished = this.state.stats.fireEvent && this.allPlantedWatered();
        this.ui.toast('💧 Полито');
      } else if (plot.growth >= CROPS[plot.crop].days) {
        const crop = CROPS[plot.crop];
        const cropId = plot.crop;
        this.addItem(cropId, 1);
        plot.state = 'tilled'; plot.crop = null; plot.growth = 0; plot.watered = false;
        this.clearPlotVisual(i);
        this.state.stats.harvested++;
        this.state.stats.harvestedToday++;
        this.ui.toast(`${crop.icon} Урожай собран: ${crop.name}`);
        // Rewarded: ×2 урожай
        if (this.state.adsWatchedToday < 5 && Math.random() < 0.35) {
          this.ui.showRewarded(() => {
            this.addItem(cropId, 1);
            this.state.adsWatchedToday++;
            this.ui.toast('🎬 Награда: ещё 1 урожай!');
          });
        }
      } else {
        this.ui.toast(`🌿 ${CROPS[plot.crop].name}: растёт (${plot.growth}/${CROPS[plot.crop].days} дн.)${plot.watered ? ' 💧' : ' — нужно полить'}`);
      }
    }
    this.updateQuestUI();
  }

  allPlantedWatered() {
    return this.state.plots.every(p => p.state !== 'planted' || p.watered);
  }

  plantVisual(i, cropId) {
    const pm = this.scene3d.plotMeshes[i];
    const group = new THREE.Group();
    const color = { turnip: 0x9fd4e8, potato: 0x8fae4e, strawberry: 0xe05a7a, wheat: 0xd9c44a, corn: 0xE8C84A, pumpkin: 0xE88A2A, cabbage: 0x7ab06b, carrot: 0xE87A2A }[cropId] || 0x5a9e3e;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const sprout = new THREE.Mesh(
          new THREE.ConeGeometry(0.16, 0.5, 5),
          new THREE.MeshLambertMaterial({ color })
        );
        sprout.position.set(-1.5 + c * 1, 0.25, -1 + r * 1);
        group.add(sprout);
      }
    }
    group.visible = false;
    pm.plant.add(group);
    this.plotPlants[i] = group;
  }

  clearPlotVisual(i) {
    const pm = this.scene3d.plotMeshes[i];
    if (this.plotPlants[i]) {
      pm.plant.remove(this.plotPlants[i]);
      this.plotPlants[i] = null;
    }
  }

  updatePlotVisuals() {
    this.state.plots.forEach((plot, i) => {
      const group = this.plotPlants[i];
      if (!group) return;
      const crop = CROPS[plot.crop];
      const ripe = plot.growth >= crop.days;
      const scale = 0.4 + (plot.growth / crop.days) * 0.8;
      group.visible = true;
      group.scale.setScalar(scale);
      group.children.forEach(ch => { ch.material.color.setHex(ripe ? crop.ripeColor || 0xE8C84A : 0x5a9e3e); });
    });
  }

  // ================== Инвентарь / деньги ==================
  addItem(id, n) {
    this.state.inventory[id] = (this.state.inventory[id] || 0) + n;
  }

  sellValue(id) {
    if (CROPS[id]) return CROPS[id].sell;
    const prod = { egg: 20, milk: 55, wool: 45, honey: 65, fish: 30, fish_rare: 90 };
    if (prod[id]) return prod[id];
    if (ORE[id]) return ORE[id].sell;
    return 5;
  }

  sellItem(id) {
    if (!this.state.inventory[id]) return;
    this.state.inventory[id]--;
    const v = this.sellValue(id);
    this.state.money += v;
    this.state.stats.earned += v;
    this.state.stats.soldToday++;
    this.ui.toast(`💰 Продано: +${v}💰`);
    this.ui.renderShop('sell');
    this.ui.updateHUD(this.state);
    this.updateQuestUI();
  }

  buySeeds(cropId, n) {
    const crop = CROPS[cropId];
    const cost = crop.seedCost * n;
    if (this.state.money < cost) { this.ui.toast('💸 Не хватает денег!'); return; }
    this.state.money -= cost;
    this.addItem(seedItemId(cropId), n);
    this.ui.toast(`🌱 Куплено: ${crop.name} ×${n}`);
    this.ui.updateHUD(this.state);
  }

  buyAnimal(type) {
    const a = ANIMALS[type];
    if (this.state.money < a.cost) { this.ui.toast('💸 Не хватает денег!'); return; }
    this.state.money -= a.cost;
    this.state.animals[type] = (this.state.animals[type] || 0) + 1;
    this.spawnAnimalMesh(type);
    this.ui.toast(`${a.icon} Куплено: ${a.name}!`);
    this.ui.updateHUD(this.state);
    this.updateQuestUI();
  }

  spawnAnimalMesh(type) {
    const spots = {
      chicken: [-14 + Math.random() * 4, 6 + Math.random() * 3],
      cow: [10 + Math.random() * 6, -2 + Math.random() * 4],
      sheep: [12 + Math.random() * 4, 2 + Math.random() * 3],
      bee: [10 + Math.random() * 5, 4 + Math.random() * 2],
    };
    const [x, z] = spots[type] || [0, 0];
    this.animalList.push(this.animalFactory.spawn(type, x, z));
  }

  syncAnimalMeshes() {
    for (const a of this.animalList) this.scene.remove(a.mesh);
    this.animalList = [];
    for (const [type, n] of Object.entries(this.state.animals)) {
      for (let i = 0; i < n; i++) this.spawnAnimalMesh(type);
    }
  }

  collectAnimal(a) {
    const def = ANIMALS[a.type];
    if (!a.produceReady) { this.ui.toast(`${def.icon} ${def.name}: продукция будет завтра`); return; }
    if (!this.spendEnergy(2)) return;
    a.produceReady = false;
    const prodId = { chicken: 'egg', cow: 'milk', sheep: 'wool', bee: 'honey' }[a.type];
    this.addItem(prodId, 1);
    this.state.stats.collectedToday++;
    this.ui.toast(`${def.productIcon} Получено: ${def.product}`);
    this.updateQuestUI();
  }

  mineRock(rock) {
    if (!this.spendEnergy(8)) return;
    rock.hp--;
    rock.mesh.scale.setScalar(0.6 + rock.hp * 0.15);
    if (rock.hp <= 0) {
      rock.alive = false;
      rock.mesh.visible = false;
      const drop = rock.type;
      this.addItem(drop, drop === 'stone' ? 2 : 1);
      this.state.stats.oreMined += drop === 'ore' ? 1 : 0;
      this.state.stats.minedToday++;
      this.ui.toast(`⛏️ Добыто: ${ORE[drop].name}`);
      setTimeout(() => { rock.alive = true; rock.hp = 3; rock.mesh.visible = true; rock.mesh.scale.setScalar(1); }, 60000);
    }
    this.updateQuestUI();
  }

  fishing() {
    if (!this.spendEnergy(5)) return;
    this.ui.toast('🎣 Забросили удочку...');
    setTimeout(() => {
      const roll = Math.random();
      if (roll < 0.15) {
        this.ui.toast('🐟 Сходила рыба! Попробуй ещё раз.');
        if (this.state.adsWatchedToday < 5) {
          this.ui.showRewarded(() => {
            this.state.adsWatchedToday++;
            this.addItem('fish_rare', 1);
            this.ui.toast('🎬 Второй шанс: редкая рыба поймана!');
          });
        }
      } else if (roll < 0.75) {
        this.addItem('fish', 1);
        this.ui.toast('🐟 Поймана рыба!');
      } else {
        this.addItem('fish_rare', 1);
        this.ui.toast('🐠 Редкая рыба!');
      }
    }, 1500);
  }

  openChest() {
    if (this.state.stats.chestFound) return;
    this.state.stats.chestFound = true;
    this.scene3d.chest.visible = false;
    this.ui.showDialog('Сундук деда Ивана', 'В сундуке — золотые монеты и письмо:\n\n«Внуку. Если читаешь это — ты прошёл путь фермера до конца. Это золото — на выкуп всей деревни. Береги Берёзовку. — Дед Иван»\n\n💰 +50 000 монет!', null, () => {
      this.state.money += 50000;
      this.ui.toast('💰💰💰 Найдено золото деда!');
      this.ui.updateHUD(this.state);
      if (this.state.stats.farmSaved || this.state.questIndex >= STORY_QUESTS.length - 1) {
        this.endGame(true, true);
      }
    });
  }

  // ================== NPC и квесты ==================
  talkTo(npc) {
    const def = npc.def;
    const s = this.state;
    if (!s.stats.metNpcs.includes(def.id)) s.stats.metNpcs.push(def.id);

    const dialogs = [...def.dialogs];
    let text = dialogs[Math.floor(Math.random() * dialogs.length)];

    // События сюжета
    const qi = s.questIndex;
    if (def.id === 'gromov' && qi <= STORY_QUESTS.length - 1) {
      text = 'Громов: «Ха! Фермер-неудачник. Мой инспектор уже готовит бумаги. Продавай, пока платят!»';
      if (qi >= 8 && !s.stats.convincedGromov) {
        // осень: сцена скупки земли
      }
    }
    if (def.id === 'nyura' && qi === 0) text = 'Баба Нюра: «Вспаши грядки, милок. Мотыгой, вот так... Полей хорошенько — и через пару дней будет урожай!»';
    if (def.id === 'senya' && qi === 3) text = 'Сеня: «Слышал, собаки ночью к курятнику подбираются? Заведи кур да держи забор крепким!»';
    if (def.id === 'vika' && qi >= 4 && qi <= 6) {
      text = 'Вика: «Максим, фестиваль на носу! И... Громов поджёг пшеницу. Полей всё поле водой — только так и потушим!»';
      if (qi === 6) s.stats.fireEvent = true;
    }
    if (def.id === 'senya' && qi === 7) {
      text = 'Сеня: «Фил рассказал мне про старую шахту деда в лесу! Камни там особенные — в них руда и самоцветы. Бей их киркой!»';
    }
    if (qi === 8 && def.id !== 'gromov' && !s.stats['convinced_' + def.id]) {
      text += '\n\n«Продавать землю Громову? Никогда! ...Хотя, если ты восстановишь ферму — я подумаю».';
      s.stats['convinced_' + def.id] = true;
      s.stats.convinced++;
      this.ui.toast('🤝 Житель убеждён не продавать землю!');
    }

    const choices = [];
    if (['nyura', 'senya', 'vika', 'ashot'].includes(def.id)) {
      choices.push({ label: '🎁 Сделать подарок', action: () => this.giveGift(def) });
    }
    if (def.id === 'ashot') choices.push({ label: '🏪 Открыть магазин', action: () => this.ui.togglePanel('shop') });
    if (def.id === 'gromov' && qi >= 11) {
      choices.push({ label: '💰 Заплатить 8000💰 за ферму на аукционе', action: () => this.payAuction() });
    }

    this.ui.showDialog(def.name, text, choices.length ? choices : null, () => {
      this.updateQuestUI();
      saveGame(this.state);
    });
  }

  giveGift(def) {
    const gifts = Object.entries(this.state.inventory).filter(([id, n]) => n > 0 && !isSeedItem(id));
    if (!gifts.length) { this.ui.toast('🎒 Нечего подарить — в инвентаре пусто'); return; }
    const [id] = gifts[0];
    this.state.inventory[id]--;
    this.state.stats.giftsGiven[def.id] = (this.state.stats.giftsGiven[def.id] || 0) + 1;
    this.ui.toast(`🎁 ${def.name} в восторге от подарка! Отношения улучшены.`);
    if (def.id === 'ashot' && Math.random() < 0.3) {
      this.addItem(seedItemId('pumpkin'), 1);
      this.ui.toast('🌟 Ашот дал редкие семена тыквы за подарок!');
    }
    this.ui.updateHUD(this.state);
  }

  payAuction() {
    if (this.state.money < 8000) { this.ui.toast('💸 Нужно 8000💰! Зарабатывай на ярмарке!'); return; }
    this.state.money -= 8000;
    this.state.stats.farmSaved = true;
    this.updateQuestUI();
    this.endGame(true, false);
  }

  cycleSeed() {
    const owned = Object.entries(this.state.inventory)
      .filter(([id, n]) => isSeedItem(id) && n > 0)
      .map(([id]) => id.slice(SEED_ITEM_PREFIX.length));
    if (!owned.length) { this.ui.toast('🌱 Нет семян — купи у Ашота!'); return; }
    const idx = owned.indexOf(this.state.selectedSeed);
    this.state.selectedSeed = owned[(idx + 1) % owned.length];
    this.ui.toast(`🌱 Выбрано: ${CROPS[this.state.selectedSeed].name}`);
    this.ui.updateSeedLabel();
  }

  currentQuest() {
    return STORY_QUESTS[this.state.questIndex] || null;
  }

  updateQuestUI() {
    const q = this.currentQuest();
    if (!q) { this.ui.setQuest(null); return; }
    const cur = q.goal(this.state);
    this.ui.setQuest(q, `${Math.min(cur, q.target)} / ${q.target}`);
    // Ежедневные квесты — проверка
    for (const dq of DAILY_QUESTS) {
      if (this.state.dailyQuests.includes(dq.id) && !this.state.dailyDone.includes(dq.id) && dq.check(this.state)) {
        this.state.dailyDone.push(dq.id);
        this.state.money += dq.reward;
        this.ui.toast(`✅ Ежедневное задание: ${dq.text} (+${dq.reward}💰)`);
      }
    }
  }

  checkStoryQuest() {
    const q = this.currentQuest();
    if (!q) return;
    if (q.goal(this.state) >= q.target) {
      for (const [k, v] of Object.entries(q.reward)) {
        if (k === 'money') this.state.money += v;
        else if (k === 'seeds') for (const [c, n] of Object.entries(v)) this.addItem(seedItemId(c), n);
      }
      this.ui.toast(`🏆 Квест выполнен: «${q.title}» · Награда: ${q.rewardText}`);
      this.state.questIndex++;
      const nextQ = this.currentQuest();
      if (nextQ && nextQ.id === 'q_neighbors') {
        this.scene3d.chest.visible = true;
        this.ui.toast('💡 Ходят слухи: в глубине леса дед что-то прятал...');
      }
      const season = seasonOf(this.state.day);
      if (nextQ && nextQ.chapter > season) {
        // Квест следующей главы недоступен до нового сезона — ждём
      }
      if (!nextQ) {
        if (this.state.stats.chestFound) this.endGame(true, true);
        else this.ui.toast('📜 Сюжетные квесты пройдены! Заплати Громову 8000💰 (поговори с ним)');
      }
      saveGame(this.state);
    }
  }

  // ================== Время, день, сезон ==================
  sleep() {
    const s = this.state;
    this.ui.showDialog('Дом', 'Наступает вечер. Лечь спать и перейти к новому дню?', [
      { label: '🛏️ Спать', action: () => this.nextDay() },
      { label: 'Ещё не время', action: () => {} },
    ]);
  }

  nextDay() {
    const s = this.state;
    this.lastInterstitialDay = s.day;
    const showAd = s.day - (this._adDay || -10) >= 2;
    const doAdvance = () => {
      s.day++;
      s.energy = 100;
      s.timeOfDay = 0.30;
      s.stats.wateredToday = 0; s.stats.harvestedToday = 0; s.stats.collectedToday = 0; s.stats.minedToday = 0; s.stats.soldToday = 0;
      s.adsWatchedToday = 0;
      // Рост растений
      for (const plot of s.plots) {
        if (plot.state === 'planted' && plot.watered) {
          plot.growth++;
          plot.watered = false;
        }
        if (plot.state === 'planted' && !plot.watered) {
          plot.watered = false;
        }
      }
      // Продукция животных
      for (const a of this.animalList) a.produceReady = true;
      // Ежедневные квесты
      rollDailyQuests(s);
      // Смена сезона
      const newSeason = seasonOf(s.day);
      if (newSeason !== seasonOf(s.day - 1)) {
        applySeason(this.scene3d, newSeason);
        this.ui.toast(`${SEASONS[newSeason].icon} Наступил(а) ${SEASONS[newSeason].name}! ${SEASONS[newSeason].chapter}`);
        // События Громова
        if (newSeason === 1) setTimeout(() => this.gromovFireEvent(), 2000);
        if (newSeason === 0) {} // весна — инспектор
        if (newSeason === 2) setTimeout(() => this.ui.showDialog('Лесник Фил', 'Максим! Нашёл в лесу старую шахту твоего деда. Камни вокруг — прямо сокровище! Ищи их на севере, за лесом.', null, null), 3000);
        if (newSeason === 3) setTimeout(() => this.ui.showDialog('Мэр', 'Зима! Суд с Громовым на носу. Нам нужны доказательства: деньги, урожай, восстановленная ферма. И готовь 8000💰 для аукциона!', null, null), 3000);
      }
      // Инспектор Громова (весна, глава 1)
      if (seasonOf(s.day) === 0 && dayOfSeason(s.day) === 6 && !s._inspectorVisited) {
        s._inspectorVisited = true;
        this.gromovInspectorEvent();
      }
      this.ui.updateHUD(s);
      this.updateQuestUI();
      saveGame(s);
    };
    if (showAd) {
      this._adDay = s.day;
      this.ui.showInterstitial(doAdvance);
    } else {
      doAdvance();
    }
    // Rewarded: бесплатный бонус +50💰 раз в день
    if (s.adsWatchedToday < 5) {
      setTimeout(() => {
        this.ui.showRewarded(() => {
          s.adsWatchedToday++;
          s.money += 50;
          this.ui.toast('💰 +50 монет за просмотр!');
          this.ui.updateHUD(s);
        });
      }, 4000);
    }
  }

  gromovInspectorEvent() {
    this.ui.showDialog('Инспектор АгроХолдинга', '«Проверка! Ваша ферма не соответствует нормам... Какая досада — я случайно потоптал ваши грядки.»\n\nПоловина грядок повреждена!', null, () => {
      let damaged = 0;
      this.state.plots.forEach((p, i) => {
        if (p.state === 'planted' && damaged < 3) {
          p.state = 'tilled'; p.crop = null; p.growth = 0;
          this.clearPlotVisual(i);
          this.scene3d.plotMeshes[i].soil.visible = true;
          damaged++;
        }
      });
      this.ui.toast('😠 Инспектор испортил грядки! Восстанови посадки.');
    });
  }

  gromovFireEvent() {
    this.state.stats.fireEvent = true;
    this.ui.showDialog('🔥 ПОЖАР!', 'Громов поджёг поле пшеницы! Огонь расползается!\n\nПолей ВСЕ посаженные грядки, чтобы потушить пожар!', null, () => {
      this.ui.toast('💧 Скорее полей все грядки!');
    });
  }

  endGame(good, secret) {
    this.paused = true;
    this.state.ended = true;
    saveGame(this.state);
    if (secret && good) {
      this.ui.showEnding('🌟 Секретная концовка: «Золото деда»',
        `Сундук деда Ивана спас деревню! На найденное золото выкуплен не только долг фермы, но и все участки Берёзовки.<br><br>` +
        `«АгроХолдинг» Громова ушёл ни с чем. Максим и Вика сыграли свадьбу на ферме, а Сеня наконец починил трактор.<br><br>` +
        `📊 Итоги: ${this.state.stats.harvested} урожаев · ${Math.floor(this.state.stats.earned).toLocaleString('ru-RU')}💰 заработано · ${this.state.day} дней`);
    } else if (good) {
      this.ui.showEnding('🏆 Концовка А: «Ферма спасена»',
        `Суд выигран! Документы о восстановлении фермы убедили судью, а на аукционе вы перебили ставку Громова.<br><br>` +
        `Берёзовка спасена. Максим и Вика сыграли свадьбу, а ферма деда Ивана процветает.<br><br>` +
        `💡 Подсказка: в лесу спрятан сундук деда — секретная концовка ждёт!<br>` +
        `📊 Итоги: ${this.state.stats.harvested} урожаев · ${Math.floor(this.state.stats.earned).toLocaleString('ru-RU')}💰 заработано · ${this.state.day} дней`);
    } else {
      this.ui.showEnding('💀 Поражение',
        '«АгроХолдинг» выкупил земли Берёзовки... Но фермеры не сдаются — попробуй снова!');
    }
  }

  // ================== Главный цикл ==================
  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.1);
    if (!this.paused && !this.state.ended) {
      // Время суток: полный день = 4 минуты
      this.state.timeOfDay += dt / 240;
      if (this.state.timeOfDay >= 1) {
        this.state.timeOfDay = 0.99;
        this.ui.toast('🌙 Поздняя ночь... Пора спать в доме!');
      }
      applyTimeOfDay(this.scene3d, this.state.timeOfDay);
      this.controller.update(dt, this.isUIOpen());
      updateAnimals(this.animalList, dt);
      this.updatePlotVisuals();
      this.checkStoryQuest();

      // Подсказка взаимодействия
      const it = this.findNearestInteractable();
      const hints = {
        plot: { grass: '⛏️ [E] Вспахать', tilled: '🌱 [E] Посадить', planted: '💧 [E] Полить/Собрать' },
        npc: '💬 [E] Поговорить',
        animal: '🥚 [E] Собрать продукцию',
        bed: '🛏️ [E] Спать',
        shop: '🏪 [E] Магазин',
        rock: '⛏️ [E] Добыть',
        chest: '🎁 [E] Открыть сундук',
        fish: '🎣 [E] Рыбалка',
        barn: '🚜 [E] Осмотреть',
      };
      if (it) {
        const h = hints[it.type];
        this.ui.setInteractHint(typeof h === 'object' ? h[this.state.plots[it.index].state] : h);
      } else this.ui.setInteractHint(null);

      this.ui.updateHUD(this.state);
    }
    this.renderer.render(this.scene, this.camera);
  }

  isUIOpen() {
    return ['dialog', 'inventory', 'shop', 'ad-overlay', 'interstitial', 'ending'].some(
      id => !document.getElementById(id).classList.contains('hidden')
    );
  }
}
