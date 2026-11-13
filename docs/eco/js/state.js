import { RES, CROPS, PENS, WORKSHOPS, SQUADS, ORDER_POOL, EVENTS, TUTORIAL, DAYS_IN_SEASON, foodTotal, indTotal, takeFood } from './data.js';

const SAVE_KEY = 'ray-eco-save-v1';
const YEAR_DAYS = DAYS_IN_SEASON * 4;
const FOOD_CAP = 500, IND_CAP = 300;

export function newState() {
  const res = {};
  for (const id in RES) res[id] = 0;
  Object.assign(res, { grain: 15, wood: 25, herbs: 3, wool: 4, leather: 2 });
  return {
    screen: 'menu',
    day: 1, money: 350,
    res,
    fields: Array.from({ length: 6 }, () => ({ crop: null, progress: 0 })),
    pens: { chickens: 0, sheep: 0, cows: 0, horses: 0 },
    workshops: { bakery: false, dairy: false, spinning: false, tannery: false, oilery: false, brewery: false, apiary: false },
    workers: { total: 6, assign: { fields: 2, forest: 1, mine: 0 }, usedByWorkshops: 0 },
    squads: { militia: 0, archers: 0, knights: 0 },
    guardSquad: null,
    caravan: null,
    orders: [],
    mineDepth: 1, smelt: true,
    storeLvl: 1,
    sliders: { grainSell: 0, woolSell: 0, leatherSell: 0 },
    stats: { delivered: 0, failed: 0, hungerDays: 0, produced: 0, robbed: 0 },
    morale: 70, fairDays: 0,
    log: [], tutorialStep: 0,
    pendingEvent: null,
    gameOver: false, ending: null,
    chopToday: 0, oddToday: 0,
  };
}

export function seasonOf(s) { return Math.min(3, Math.floor((s.day - 1) / DAYS_IN_SEASON)); }
export function dayOfSeason(s) { return ((s.day - 1) % DAYS_IN_SEASON) + 1; }

export function caps(s) {
  return { food: FOOD_CAP + (s.storeLvl - 1) * 250, ind: IND_CAP + (s.storeLvl - 1) * 250 };
}

export function addRes(s, id, n) {
  const c = caps(s);
  const cap = RES[id].cat === 'food' ? c.food : c.ind;
  const cur = s.res[id] || 0;
  const add = Math.max(0, Math.min(n, cap - Math.floor(cur)));
  if (add < n) pushLog(s, 'Склад переполнен — излишки потеряны!');
  s.res[id] = Math.min(cap, cur + n);
  return add;
}

export function pushLog(s, text) {
  s.log.push({ day: s.day, text });
  if (s.log.length > 40) s.log.shift();
}

export function hasRes(s, need) {
  for (const id in need) if ((s.res[id] || 0) < need[id]) return false;
  return true;
}
export function takeRes(s, need) {
  for (const id in need) s.res[id] -= need[id];
}

export function workersIdle(s) {
  const a = s.workers.assign;
  return s.workers.total - s.workers.usedByWorkshops - a.fields - a.forest - a.mine;
}

export function toolBonus(s) {
  return 1 + Math.min(3, Math.floor((s.res.tools || 0) / 5)) * 0.15;
}

export function seasonGrowMult(season) { return [1, 1.15, 1.3, 0][season]; }
export function seasonWoodMult(season) { return [0.8, 1, 1.3, 0.4][season]; }
export function seasonPriceMult(s) { const base = [1, 1, 0.9, 1.6][seasonOf(s)]; return s.fairDays > 0 ? base * 2 : base; }

function genOrder(s) {
  const avail = ORDER_POOL.filter(o => !s.orders.some(a => a.res === o.res));
  const o = avail[Math.floor(Math.random() * avail.length)];
  if (!o) return null;
  return { res: o.res, qty: o.qty, reward: o.reward, deadline: s.day + o.days, total: o.qty };
}

function ensureOrders(s) {
  while (s.orders.length < 2) {
    const o = genOrder(s);
    if (!o) break;
    s.orders.push(o);
    pushLog(s, 'Новый заказ завода: ' + RES[o.res].name + ' ×' + o.qty);
  }
}

function feedAnimals(s) {
  const need = {};
  for (const p in s.pens) {
    const heads = s.pens[p];
    if (heads > 0) need[PENS[p].feed] = (need[PENS[p].feed] || 0) + heads;
  }
  let fedFull = true;
  for (const id in need) {
    if ((s.res[id] || 0) >= need[id]) s.res[id] -= need[id];
    else { s.res[id] = 0; fedFull = false; }
  }
  return fedFull;
}

function runWorkshops(s) {
  let used = 0;
  const prod = {};
  for (const id in s.workshops) {
    if (!s.workshops[id]) continue;
    const w = WORKSHOPS[id];
    if (w.seasonOnly && !w.seasonOnly.includes(seasonOf(s))) continue;
    if (used + w.worker > s.workers.total) continue;
    if (!hasRes(s, w.in)) continue;
    takeRes(s, w.in);
    for (const o in w.out) prod[o] = (prod[o] || 0) + w.out[o];
    used += w.worker;
  }
  s.workers.usedByWorkshops = used;
  for (const id in prod) addRes(s, id, Math.round(prod[id] * 10) / 10);
  return prod;
}

function mineProduce(s) {
  const n = s.workers.assign.mine;
  if (n <= 0) return;
  const tb = toolBonus(s);
  let ore = 1.2 * n * tb;
  let coal = s.mineDepth >= 2 ? 0.8 * n * tb : 0;
  addRes(s, 'ore', Math.round(ore));
  if (coal) addRes(s, 'coal', Math.round(coal));
  if (s.mineDepth >= 3 && Math.random() < 0.25 * n) addRes(s, 'gems', 1);
  if (s.mineDepth >= 4 && Math.random() < 0.3 * n) addRes(s, 'salt', 2);
  if (s.mineDepth >= 5 && Math.random() < 0.12 * n) addRes(s, 'goldIngot' in RES ? 'goldIngot' : 'gems', 1);
}

function spoil(s) {
  for (const id in RES) {
    if (RES[id].perish && s.res[id] > 0) {
      const loss = s.res[id] * 0.02;
      s.res[id] -= loss;
      if (s.res[id] < 0.05) s.res[id] = 0;
      else s.res[id] = Math.floor(s.res[id]);
    }
  }
}

function autoSell(s) {
  const price = seasonPriceMult(s);
  const sell = (id, pct) => {
    if (pct <= 0) return;
    const n = Math.floor((s.res[id] || 0) * pct / 100);
    if (n > 0) { s.res[id] -= n; s.money += Math.round(n * RES[id].price * price * 0.8); }
  };
  sell('grain', s.sliders.grainSell);
  sell('wool', s.sliders.woolSell);
  sell('leather', s.sliders.leatherSell);
}

function eat(s) {
  const need = s.workers.total;
  if (foodTotal(s) >= need) { takeFood(s, need); s.morale = Math.min(100, s.morale + 1); }
  else { takeFood(s, foodTotal(s)); s.stats.hungerDays++; s.morale = Math.max(0, s.morale - 3); pushLog(s, 'Голод! Рабочим не хватает еды.'); }
  if (s.money >= s.workers.total) s.money -= s.workers.total;
  else { s.money = 0; s.morale = Math.max(0, s.morale - 2); }
}

function advanceCaravan(s) {
  if (!s.caravan) return;
  s.caravan.daysLeft--;
  if (s.caravan.daysLeft > 0) return;
  const c = s.caravan;
  s.caravan = null;
  if (c.robbed) {
    s.stats.robbed++;
    pushLog(s, 'Караван ограблен! ' + RES[c.res].name + ' ×' + c.qty + ' потеряны.');
    return;
  }
  const order = s.orders.find(o => o.res === c.res);
  if (order) {
    order.qty -= c.qty;
    if (order.qty <= 0) {
      s.orders.splice(s.orders.indexOf(order), 1);
      s.money += order.reward;
      s.stats.delivered++;
      s.morale = Math.min(100, s.morale + 3);
      pushLog(s, 'Заказ выполнен! +' + order.reward + ' монет.');
    } else {
      pushLog(s, 'Караван доставил ' + RES[c.res].name + ' ×' + c.qty + ' (осталось ' + order.qty + ')');
    }
  } else {
    addRes(s, c.res, Math.floor(c.qty * 0.5));
    pushLog(s, 'Караван вернулся: продано ' + RES[c.res].name + ' ×' + c.qty + ' на заводе.');
    s.money += Math.round(c.qty * RES[c.res].price * 0.9);
  }
}

function checkOrders(s) {
  for (const o of [...s.orders]) {
    if (s.day > o.deadline) {
      s.orders.splice(s.orders.indexOf(o), 1);
      s.stats.failed++;
      s.morale = Math.max(0, s.morale - 5);
      s.money = Math.max(0, s.money - 50);
      pushLog(s, 'Заказ сорван (штраф 50 монет)!');
    }
  }
}

function maybeEvent(s) {
  if (s.day < 5 || s.pendingEvent) return;
  if (Math.random() < 0.18) {
    const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    if (ev.id === 'fair' && seasonOf(s) !== 2) return;
    s.pendingEvent = ev;
    s.eventPortrait = 1 + Math.floor(Math.random() * 5);
  }
}

export function resolveEvent(s, choice) {
  const ev = s.pendingEvent;
  if (!ev || !ev.choices.includes(choice)) return;
  if (choice.can && !choice.can(s)) return;
  choice.apply(s);
  s.pendingEvent = null;
  pushLog(s, 'Событие: ' + ev.name);
  save(s);
}

function checkTutorial(s) {
  const step = TUTORIAL[s.tutorialStep];
  if (step && step.check(s)) s.tutorialStep++;
}

export function computeEnding(s) {
  const st = s.stats;
  if (st.hungerDays === 0 && st.failed === 0 && s.money >= 2000 && totalSquads(s) >= 3) return 'rebirth';
  if (st.hungerDays > 15) return 'exploiter';
  if (st.failed > 5) return 'parasite';
  if (s.money >= 800 && st.failed <= 2 && st.hungerDays <= 5) return 'symbiosis';
  return st.hungerDays > 8 ? 'exploiter' : 'symbiosis';
}

export function totalSquads(s) { return s.squads.militia + s.squads.archers + s.squads.knights; }

export function nextDay(s) {
  if (s.gameOver || s.pendingEvent) return;
  s.chopToday = 0;
  s.oddToday = 0;
  s.day++;
  if (dayOfSeason(s) === 1 && s.day > 1) {
    const names = ['Весна', 'Лето', 'Осень', 'Зима'];
    pushLog(s, 'Наступила ' + names[seasonOf(s)].toLowerCase() + '.');
    if (seasonOf(s) === 3) pushLog(s, 'Зима близко: поля не растут, запаситесь едой!');
  }
  if (s.fairDays > 0) s.fairDays--;
  const fed = feedAnimals(s);
  if (!fed) pushLog(s, 'Скоту не хватает корма — продуктивность упала.');
  const prod = runWorkshops(s);
  for (const id in prod) s.stats.produced += prod[id];
  mineProduce(s);
  if (s.smelt) {
    let n = 0;
    while (s.res.ore >= 2 && s.res.coal >= 1 && n < 5) { s.res.ore -= 2; s.res.coal -= 1; s.res.iron += 1; n++; }
  }
  for (const f of s.fields) if (f.crop) f.progress += seasonGrowMult(seasonOf(s)) * toolBonus(s);
  spoil(s);
  autoSell(s);
  eat(s);
  advanceCaravan(s);
  checkOrders(s);
  ensureOrders(s);
  maybeEvent(s);
  checkTutorial(s);
  if (s.day > YEAR_DAYS) {
    s.gameOver = true;
    s.ending = computeEnding(s);
  }
  save(s);
}

export function oddJobs(s) {
  if (workersIdle(s) <= 0 || (s.oddToday || 0) >= 1) return false;
  s.oddToday = (s.oddToday || 0) + 1;
  s.money += 25;
  pushLog(s, 'Подработка в деревне: +25 монет.');
  save(s);
  return true;
}

export function chopWood(s) {
  if (workersIdle(s) <= 0 || s.chopToday >= 2) return false;
  const season = seasonOf(s);
  const n = Math.round(6 * seasonWoodMult(season) * toolBonus(s));
  addRes(s, 'wood', n);
  if (Math.random() < 0.3) addRes(s, 'resin', 1);
  if (Math.random() < 0.4) addRes(s, 'straw', 1);
  s.chopToday++;
  pushLog(s, 'Рубка леса: +' + n + ' древесины.');
  return true;
}

export function harvestField(s, i) {
  const f = s.fields[i];
  if (!f.crop || f.progress < CROPS[f.crop].days) return false;
  const c = CROPS[f.crop];
  const boost = 1 + 0.1 * s.workers.assign.fields;
  const mult = seasonOf(s) === 2 ? 1.3 : 1;
  const n = Math.round(c.yield * boost * mult * toolBonus(s));
  addRes(s, c.res, n);
  addRes(s, 'straw', 2);
  s.stats.produced += n;
  f.crop = null; f.progress = 0;
  pushLog(s, 'Собрано: ' + RES[c.res].name + ' ×' + n + ', солома ×2.');
  save(s);
  return true;
}

export function plantField(s, i, crop) {
  const f = s.fields[i];
  if (f.crop) return false;
  const c = CROPS[crop];
  if (s.money < c.seed) return false;
  if (seasonOf(s) === 3) { pushLog(s, 'Зимой ничего не растёт!'); return false; }
  s.money -= c.seed;
  f.crop = crop; f.progress = 0;
  save(s);
  return true;
}

export function buyAnimal(s, pen, n = 1) {
  const P = PENS[pen];
  const heads = s.pens[pen];
  const cost = P.headCost * n;
  if (heads + n > P.max || s.money < cost) return false;
  s.money -= cost;
  s.pens[pen] += n;
  save(s);
  return true;
}

export function buildWorkshop(s, id) {
  const w = WORKSHOPS[id];
  if (s.workshops[id] || s.money < w.cost || s.res.wood < w.wood) return false;
  s.money -= w.cost; s.res.wood -= w.wood;
  s.workshops[id] = true;
  pushLog(s, 'Построено: ' + w.name + '!');
  save(s);
  return true;
}

export function hireWorker(s) {
  const cost = 100 + s.workers.total * 25;
  if (s.money < cost) return false;
  s.money -= cost;
  s.workers.total++;
  pushLog(s, 'Нанят рабочий (зарплата 2 монеты/день).');
  save(s);
  return true;
}

export function hireCost(s) { return 100 + s.workers.total * 25; }

export function upgradeStore(s) {
  const cost = 300 + s.storeLvl * 150;
  if (s.money < cost) return false;
  s.money -= cost;
  s.storeLvl++;
  pushLog(s, 'Склад расширен! Лимиты: ' + caps(s).food + ' еды / ' + caps(s).ind + ' сырья.');
  save(s);
  return true;
}

export function storeCost(s) { return 300 + s.storeLvl * 150; }

export function hireSquad(s, id) {
  const q = SQUADS[id];
  if (s.money < q.cost || !hasRes(s, q.need)) return false;
  s.money -= q.cost; takeRes(s, q.need);
  s.squads[id]++;
  pushLog(s, 'Нанят отряд: ' + q.name + '!');
  save(s);
  return true;
}

export function sendCaravan(s, order, guarded) {
  if (s.caravan) return false;
  if ((s.res[order.res] || 0) < order.qty) return false;
  let qty = Math.min(order.qty, 50);
  if (qty < order.qty) { pushLog(s, 'Караван берёт максимум 50 единиц за рейс.'); }
  s.res[order.res] -= qty;
  const horses = s.pens.horses > 0;
  let days = horses ? 1 : 2;
  const squadAvail = s.guardSquad && s.squads[s.guardSquad] > 0;
  const robChance = guarded && squadAvail ? 0.05 : 0.15;
  const robbed = Math.random() < robChance;
  s.caravan = { res: order.res, qty, daysLeft: days, robbed, guarded: guarded && squadAvail };
  if (guarded && squadAvail) s.squads[s.guardSquad]--;
  pushLog(s, 'Караван отправлен: ' + RES[order.res].name + ' ×' + qty + (s.caravan.guarded ? ' (с охраной)' : '') + '.');
  save(s);
  return true;
}

export function sellResource(s, id, n) {
  n = Math.min(n, Math.floor(s.res[id] || 0));
  if (n <= 0) return 0;
  const gain = Math.round(n * RES[id].price * seasonPriceMult(s) * 0.8);
  s.res[id] -= n;
  s.money += gain;
  save(s);
  return gain;
}

export function buyResource(s, id, n) {
  const cost = Math.round(n * RES[id].price * seasonPriceMult(s) * 1.5);
  if (s.money < cost) return false;
  s.money -= cost;
  addRes(s, id, n);
  save(s);
  return true;
}
export function buyPrice(s, id, n) { return Math.round(n * RES[id].price * seasonPriceMult(s) * 1.5); }
export function sellPrice(s, id, n) { return Math.round(n * RES[id].price * seasonPriceMult(s) * 0.8); }

export function digDeeper(s) {
  const next = s.mineDepth + 1;
  const need = { 2: 1, 3: 1, 4: 2, 5: 3 }[next];
  const cost = 200 * next;
  if (!need || s.money < cost || totalSquads(s) < need) return false;
  s.money -= cost;
  s.mineDepth = next;
  pushLog(s, 'Шахта углублена до уровня ' + next + '!');
  save(s);
  return true;
}
export function digNeed(next) { return { 2: 1, 3: 1, 4: 2, 5: 3 }[next]; }
export function digCost(next) { return 200 * next; }

export function save(s) {
  try {
    const copy = { ...s, screen: 'menu', pendingEvent: null };
    localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
  } catch (e) { /* noop */ }
}
export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    s.screen = 'menu';
    s.pendingEvent = null;
    return s;
  } catch (e) { return null; }
}
export function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}
export function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* noop */ }
}
