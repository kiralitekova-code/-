import { SEASONS, seasonOf, dayOfSeason, itemIcon, itemName, isSeedItem, SEED_ITEM_PREFIX, CROPS, ANIMALS, ORE } from './data.js';

const $ = id => document.getElementById(id);

export class UI {
  constructor(game) {
    this.game = game;
    this.toastCount = 0;
    document.getElementById('btn-inv').onclick = () => this.togglePanel('inventory');
    document.getElementById('btn-shop-hint').onclick = () => this.toast('🏪 Магазин находится в деревне (жёлтая будка у дороги)');
    document.getElementById('mbtn-inv').onclick = () => this.togglePanel('inventory');
    document.getElementById('mbtn-seed').onclick = () => game.cycleSeed();
    document.getElementById('btn-seed').onclick = () => game.cycleSeed();
    document.querySelectorAll('[data-close]').forEach(b => {
      b.onclick = () => this.hidePanel(b.dataset.close);
    });
    document.querySelectorAll('#shop-tabs button').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('#shop-tabs button').forEach(x => x.classList.remove('tab-active'));
        b.classList.add('tab-active');
        this.renderShop(b.dataset.tab);
      };
    });
    $('seed-select').onchange = e => { game.state.selectedSeed = e.target.value; this.updateSeedLabel(); };
    $('btn-ending-restart').onclick = () => location.reload();
  }

  show(id) { $(id).classList.remove('hidden'); $(id).classList.add('visible'); }
  hide(id) { $(id).classList.add('hidden'); $(id).classList.remove('visible'); }
  togglePanel(id) {
    const el = $(id);
    if (el.classList.contains('hidden')) {
      if (id === 'inventory') this.renderInventory();
      if (id === 'shop') this.renderShop('seeds');
      this.show(id);
    } else this.hidePanel(id);
  }
  hidePanel(id) { this.hide(id); }

  toast(msg) {
    const c = $('toast-container');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  updateHUD(state) {
    $('hud-money').textContent = Math.floor(state.money).toLocaleString('ru-RU');
    $('hud-energy').textContent = Math.floor(state.energy);
    let invCount = 0;
    for (const [id, n] of Object.entries(state.inventory)) if (!isSeedItem(id)) invCount += n;
    $('hud-inv-count').textContent = invCount;
    const season = seasonOf(state.day);
    $('hud-season').textContent = `${SEASONS[season].icon} ${SEASONS[season].name} · ${SEASONS[season].chapter}`;
    const hours = Math.floor(state.timeOfDay * 24);
    const mins = Math.floor((state.timeOfDay * 24 - hours) * 60);
    $('hud-day').textContent = `День ${dayOfSeason(state.day)} · ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    $('hud-clockfill').style.width = (state.timeOfDay * 100) + '%';
    this.updateSeedLabel();
  }

  updateSeedLabel() {
    const s = this.game.state;
    const crop = CROPS[s.selectedSeed];
    const count = s.inventory[SEED_ITEM_PREFIX + s.selectedSeed] || 0;
    $('seed-label').textContent = crop ? crop.icon + count : '';
  }

  setQuest(quest, progressText) {
    if (!quest) {
      $('quest-title').textContent = 'Все квесты выполнены!';
      $('quest-desc').textContent = '';
      $('quest-progress').textContent = '';
      return;
    }
    $('quest-title').textContent = quest.title;
    $('quest-desc').textContent = quest.desc;
    $('quest-progress').textContent = progressText;
  }

  setInteractHint(text) {
    const el = $('interact-hint');
    if (text) { el.textContent = text; el.classList.remove('hidden'); }
    else el.classList.add('hidden');
  }

  renderInventory() {
    const s = this.game.state;
    const grid = $('inv-grid');
    grid.innerHTML = '';
    const entries = Object.entries(s.inventory).filter(([, n]) => n > 0);
    if (!entries.length) grid.innerHTML = '<div class="inv-item">Пусто 📦</div>';
    for (const [id, n] of entries) {
      const div = document.createElement('div');
      div.className = 'inv-item';
      div.innerHTML = `<b>${itemIcon(id)}</b>${itemName(id, CROPS, ORE)}<br>×${n}`;
      grid.appendChild(div);
    }
    // Селектор семян
    const sel = $('seed-select');
    sel.innerHTML = '';
    for (const [id, n] of entries) {
      if (!isSeedItem(id) || n <= 0) continue;
      const cropId = id.slice(SEED_ITEM_PREFIX.length);
      const crop = CROPS[cropId];
      if (!crop) continue;
      const opt = document.createElement('option');
      opt.value = cropId;
      opt.textContent = `${crop.icon} ${crop.name} (×${n})`;
      if (s.selectedSeed === cropId) opt.selected = true;
      sel.appendChild(opt);
    }
  }

  renderShop(tab) {
    const s = this.game.state;
    const box = $('shop-items');
    box.innerHTML = '';
    const addItem = (icon, name, desc, price, onBuy) => {
      const div = document.createElement('div');
      div.className = 'shop-item';
      div.innerHTML = `<div><span style="font-size:22px">${icon}</span> <span class="si-name">${name}</span><div class="si-desc">${desc}</div></div>`;
      const right = document.createElement('div');
      if (price != null) {
        const p = document.createElement('span');
        p.className = 'si-price';
        p.textContent = price + '💰';
        right.appendChild(p);
      }
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary btn-small';
      btn.textContent = tab === 'sell' ? 'Продать' : 'Купить';
      btn.onclick = onBuy;
      right.appendChild(btn);
      div.appendChild(right);
      box.appendChild(div);
    };
    if (tab === 'seeds') {
      for (const [id, c] of Object.entries(CROPS)) {
        addItem(c.icon, `${c.name} (семена ×3)`, `Растёт ${c.days} дн. · Продажа ${c.sell}💰`, c.seedCost * 3,
          () => this.game.buySeeds(id, 3));
      }
    } else if (tab === 'animals') {
      for (const [id, a] of Object.entries(ANIMALS)) {
        addItem(a.icon, a.name, `Даёт: ${a.product} (${a.productValue}💰) каждый день`, a.cost,
          () => this.game.buyAnimal(id));
      }
    } else if (tab === 'sell') {
      const sellables = Object.entries(s.inventory).filter(([id, n]) => n > 0 && !isSeedItem(id));
      if (!sellables.length) box.innerHTML = '<div class="si-desc" style="text-align:center;padding:16px">Нечего продавать — собери урожай или продукцию животных!</div>';
      for (const [id, n] of sellables) {
        const value = this.game.sellValue(id);
        addItem(itemIcon(id), itemName(id, CROPS, ORE), `В наличии: ×${n}`, value,
          () => this.game.sellItem(id));
      }
    }
  }

  // ===== Диалоги =====
  showDialog(name, text, choices, onNext) {
    $('dialog-name').textContent = name;
    $('dialog-text').textContent = text;
    const ch = $('dialog-choices');
    ch.innerHTML = '';
    const next = $('dialog-next');
    if (choices && choices.length) {
      next.style.display = 'none';
      for (const c of choices) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.style.textAlign = 'left';
        btn.textContent = c.label;
        btn.onclick = () => { this.hideDialog(); c.action && c.action(); };
        ch.appendChild(btn);
      }
    } else {
      next.style.display = '';
      next.onclick = () => { this.hideDialog(); onNext && onNext(); };
    }
    this.show('dialog');
  }
  hideDialog() { this.hide('dialog'); }

  // ===== Реклама (симуляция SDK) =====
  showRewarded(onReward) {
    $('ad-reward-btn').disabled = true;
    let t = 5;
    $('ad-timer').textContent = t;
    this.show('ad-overlay');
    const iv = setInterval(() => {
      t--;
      $('ad-timer').textContent = Math.max(0, t);
      if (t <= 0) {
        clearInterval(iv);
        $('ad-reward-btn').disabled = false;
        $('ad-reward-btn').onclick = () => { this.hide('ad-overlay'); onReward(); };
      }
    }, 1000);
  }

  showInterstitial(onDone) {
    let t = 3;
    $('inter-timer').textContent = t;
    $('interstitial-close').disabled = true;
    this.show('interstitial');
    const iv = setInterval(() => {
      t--;
      $('inter-timer').textContent = Math.max(0, t);
      if (t <= 0) {
        clearInterval(iv);
        $('interstitial-close').disabled = false;
        $('interstitial-close').onclick = () => { this.hide('interstitial'); onDone && onDone(); };
      }
    }, 1000);
  }

  showEnding(title, text) {
    $('ending-title').textContent = title;
    $('ending-text').innerHTML = text;
    this.show('ending');
  }
}
