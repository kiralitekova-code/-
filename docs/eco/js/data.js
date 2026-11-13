// Данные игры: ресурсы, культуры, постройки, заказы, события.
// Все пути ассетов — в assetmap.js (точные копии файлов из архива).

export const SEASONS = ['Весна', 'Лето', 'Осень', 'Зима'];
export const DAYS_IN_SEASON = 30;

export const RES = {
  grain:    { name: 'Зерно',            icon: 'iGrain',   cat: 'food', perish: false, price: 2 },
  carrot:   { name: 'Морковь',          icon: 'iCarrot',  cat: 'food', perish: true,  price: 3 },
  cabbage:  { name: 'Капуста',          icon: 'iCabbage', cat: 'food', perish: true,  price: 3 },
  pumpkin:  { name: 'Тыква',            icon: 'iPumpkin', cat: 'food', perish: true,  price: 4 },
  bread:    { name: 'Хлеб',             icon: 'iBread',   cat: 'food', perish: false, price: 7 },
  cheese:   { name: 'Сыр',              icon: 'iCheese',  cat: 'food', perish: false, price: 12 },
  milk:     { name: 'Молоко',           icon: 'iMilk',    cat: 'food', perish: true,  price: 5 },
  eggs:     { name: 'Яйца',             icon: 'iEggs',    cat: 'food', perish: true,  price: 3 },
  meat:     { name: 'Мясо',             icon: 'iMeat',    cat: 'food', perish: true,  price: 7 },
  honey:    { name: 'Мёд',              icon: 'iHoney',   cat: 'food', perish: false, price: 9 },
  oil:      { name: 'Масло',            icon: 'iOil',     cat: 'food', perish: false, price: 9 },
  herbs:    { name: 'Травы',            icon: 'iHerbs',   cat: 'food', perish: true,  price: 5 },
  wool:     { name: 'Шерсть',           icon: 'iWool',    cat: 'ind',  perish: false, price: 5 },
  leather:  { name: 'Кожа',             icon: 'iLeather', cat: 'ind',  perish: false, price: 6 },
  leatherT: { name: 'Выделанная кожа',  icon: 'iLeatherT',cat: 'ind',  perish: false, price: 10 },
  bones:    { name: 'Кости',            icon: 'iBones',   cat: 'ind',  perish: false, price: 3 },
  fat:      { name: 'Жир',              icon: 'iFat',     cat: 'ind',  perish: false, price: 4 },
  feathers: { name: 'Перья',            icon: 'iFeathers',cat: 'ind',  perish: false, price: 3 },
  wood:     { name: 'Древесина',        icon: 'iWood',    cat: 'ind',  perish: false, price: 3 },
  resin:    { name: 'Смола',            icon: 'iResin',   cat: 'ind',  perish: false, price: 6 },
  wax:      { name: 'Воск',             icon: 'iWax',     cat: 'ind',  perish: false, price: 7 },
  straw:    { name: 'Солома',           icon: 'iStraw',   cat: 'ind',  perish: false, price: 1 },
  clay:     { name: 'Глина',            icon: 'iClay',    cat: 'ind',  perish: false, price: 2 },
  ore:      { name: 'Руда',             icon: 'iOre',     cat: 'ind',  perish: false, price: 7 },
  coal:     { name: 'Уголь',            icon: 'iCoal',    cat: 'ind',  perish: false, price: 6 },
  iron:     { name: 'Железо',           icon: 'iIron',    cat: 'ind',  perish: false, price: 14 },
  salt:     { name: 'Соль',             icon: 'iSalt',    cat: 'ind',  perish: false, price: 8 },
  gems:     { name: 'Самоцветы',        icon: 'iGems',    cat: 'lux',  perish: false, price: 30 },
  alcohol:  { name: 'Спирт',            icon: 'iAlcohol', cat: 'ind',  perish: false, price: 10 },
  cloth:    { name: 'Ткань',            icon: 'iCloth',   cat: 'ind',  perish: false, price: 12 },
  tools:    { name: 'Инструменты',      icon: 'iTools',   cat: 'ind',  perish: false, price: 20 },
  candles:  { name: 'Свечи',            icon: 'iCandles', cat: 'lux',  perish: false, price: 8 },
  luxury:   { name: 'Товары роскоши',   icon: 'iLuxury',  cat: 'lux',  perish: false, price: 40 },
};

export const CROPS = {
  wheat:   { name: 'Пшеница', res: 'grain',   days: 4, yield: 10, seed: 5,  icon: 'fieldWheat' },
  carrot:  { name: 'Морковь', res: 'carrot',  days: 3, yield: 8,  seed: 4,  icon: 'fieldCarrot' },
  cabbage: { name: 'Капуста', res: 'cabbage', days: 5, yield: 12, seed: 6,  icon: 'fieldCabbage' },
  pumpkin: { name: 'Тыква',   res: 'pumpkin', days: 6, yield: 16, seed: 8,  icon: 'fieldPumpkin' },
};

export const PENS = {
  chickens: { name: 'Курятник', animal: 'animalChicken', headCost: 20,  max: 10, feed: 1, out: { eggs: 2, feathers: 0.5 } },
  sheep:    { name: 'Овчарня',  animal: 'animalSheep',   headCost: 45,  max: 10, feed: 2, out: { wool: 1 } },
  cows:     { name: 'Коровник', animal: 'animalCow',     headCost: 90,  max: 10, feed: 3, out: { milk: 2, leather: 0.4, bones: 0.4, fat: 0.4 } },
  horses:   { name: 'Конюшня',  animal: 'animalHorse',   headCost: 130, max: 6,  feed: 3, out: {} },
};

export const WORKSHOPS = {
  bakery:   { name: 'Пекарня',    building: 'bBakery',    cost: 150, wood: 20, worker: 1, in: { grain: 3 },  out: { bread: 2 },   desc: '3 зерна → 2 хлеба' },
  dairy:    { name: 'Сыроварня',  building: 'bDairy',     cost: 200, wood: 20, worker: 1, in: { milk: 3 },   out: { cheese: 1 },  desc: '3 молока → 1 сыр' },
  spinning: { name: 'Прядильня',  building: 'bSpinning',  cost: 180, wood: 30, worker: 1, in: { wool: 2 },   out: { cloth: 1 },   desc: '2 шерсти → 1 ткань' },
  tannery:  { name: 'Кожевня',    building: 'bTannery',   cost: 220, wood: 25, worker: 1, in: { leather: 2 }, out: { leatherT: 1 }, desc: '2 кожи → 1 выделанная кожа' },
  oilery:   { name: 'Маслобойня', building: 'bDome',      cost: 160, wood: 15, worker: 1, in: { pumpkin: 3 }, out: { oil: 1 },     desc: '3 тыквы → 1 масло' },
  brewery:  { name: 'Пивоварня',  building: 'bStoneHouse',cost: 250, wood: 30, worker: 1, in: { grain: 4 },  out: { alcohol: 1 }, desc: '4 зерна → 1 спирт' },
  apiary:   { name: 'Пасека',     building: 'bRuin',      cost: 120, wood: 10, worker: 1, in: {},            out: { honey: 0.5, wax: 0.3 }, seasonOnly: [1, 2], desc: 'Мёд и воск (лето-осень)' },
};

export const SQUADS = {
  militia: { name: 'Ополчение', icon: 'chGuard',  cost: 200, need: { cloth: 5, wood: 5 },          power: 1 },
  archers: { name: 'Лучники',   icon: 'chArcher', cost: 350, need: { cloth: 8, wood: 5, feathers: 3 }, power: 2 },
  knights: { name: 'Рыцари',    icon: 'chKnight', cost: 700, need: { leatherT: 5, iron: 5, cloth: 5 }, power: 3 },
};

export const ORDER_POOL = [
  { res: 'wool',     qty: 20,  reward: 180, days: 6 },
  { res: 'cloth',    qty: 10,  reward: 220, days: 7 },
  { res: 'leather',  qty: 15,  reward: 200, days: 7 },
  { res: 'leatherT', qty: 8,   reward: 260, days: 8 },
  { res: 'grain',    qty: 40,  reward: 160, days: 5 },
  { res: 'bread',    qty: 15,  reward: 210, days: 6 },
  { res: 'wood',     qty: 30,  reward: 170, days: 5 },
  { res: 'ore',      qty: 25,  reward: 240, days: 6 },
  { res: 'coal',     qty: 20,  reward: 220, days: 6 },
  { res: 'iron',     qty: 10,  reward: 280, days: 8 },
  { res: 'milk',     qty: 25,  reward: 190, days: 5 },
  { res: 'cheese',   qty: 10,  reward: 250, days: 7 },
  { res: 'eggs',     qty: 30,  reward: 170, days: 5 },
  { res: 'honey',    qty: 12,  reward: 230, days: 7 },
  { res: 'alcohol',  qty: 8,   reward: 240, days: 7 },
  { res: 'oil',      qty: 10,  reward: 220, days: 7 },
  { res: 'feathers', qty: 15,  reward: 150, days: 5 },
  { res: 'bones',    qty: 15,  reward: 150, days: 5 },
  { res: 'fat',      qty: 12,  reward: 160, days: 5 },
  { res: 'gems',     qty: 4,   reward: 320, days: 9 },
  { res: 'salt',     qty: 10,  reward: 240, days: 7 },
  { res: 'wax',      qty: 8,   reward: 200, days: 7 },
  { res: 'straw',    qty: 30,  reward: 120, days: 4 },
  { res: 'resin',    qty: 10,  reward: 190, days: 6 },
];

export const EVENTS = [
  { id: 'inspector', name: 'Инспектор Громова', text: 'Инспектор требует «пошлину»: заплатить 80 монет или потерять треть овощей.', choices: [
      { label: 'Заплатить 80', can: s => s.money >= 80, apply: s => { s.money -= 80; } },
      { label: 'Отказать', apply: s => { for (const r of ['carrot', 'cabbage', 'pumpkin']) s.res[r] = Math.floor(s.res[r] * 0.66); } },
    ] },
  { id: 'fire', name: 'Пожар!', text: 'Молния подожгла поле! Отряд мог бы спасти посевы.', choices: [
      { label: 'Понести убыток', apply: s => { const f = s.fields.find(f => f.crop); if (f) { f.crop = null; f.stage = 0; } } },
    ], guardedSave: true },
  { id: 'epidemic', name: 'Эпидемия скота', text: 'Скот болеет! 5 трав спасут животных.', choices: [
      { label: 'Лечить (5 трав)', can: s => s.res.herbs >= 5, apply: s => { s.res.herbs -= 5; } },
      { label: 'Потерять скот', apply: s => { for (const p in s.pens) s.pens[p] = Math.max(0, s.pens[p] - 2); } },
    ] },
  { id: 'vagabonds', name: 'Бродяги', text: 'Бродяги просят еды: 10 единиц еды или 30 монет.', choices: [
      { label: 'Дать еду', can: s => foodTotal(s) >= 10, apply: s => { takeFood(s, 10); } },
      { label: 'Дать 30 монет', can: s => s.money >= 30, apply: s => { s.money -= 30; } },
      { label: 'Прогнать', apply: s => { s.morale = Math.max(0, s.morale - 5); } },
    ] },
  { id: 'fair', name: 'Ярмарка!', text: 'В деревне ярмарка — цены на рынке удвоены на 3 дня!', choices: [
      { label: 'Отлично!', apply: () => {} },
    ], effect: s => { s.fairDays = 3; } },
  { id: 'harvest', name: 'Хорошие вести', text: 'Дожди прошли — урожай созреет быстрее!', choices: [
      { label: 'Победа!', apply: s => { for (const f of s.fields) if (f.crop) f.progress += 1; } },
    ] },
];

export const TUTORIAL = [
  { text: 'Кликни по свободному полю и посади пшеницу', check: s => s.fields.some(f => f.crop) },
  { text: 'Жми «Новый день», пока пшеница не созреет, затем собери урожай', check: s => s.res.grain >= 5 },
  { text: 'Построй пасеку или пекарню (клик по плацу зданий внизу фермы)', check: s => Object.values(s.workshops).some(Boolean) },
  { text: 'Купи кур или овец (клик по загону)', check: s => Object.values(s.pens).some(v => v > 0) },
  { text: 'Заведи шахту: отправь рабочего добывать руду', check: s => s.workers.mine > 0 },
  { text: 'Возьми заказ на Заводе и отправь караван', check: s => s.stats.delivered > 0 },
  { text: 'Ты освоился! Развивай экосистему до конца года.', check: () => false },
];

export function foodTotal(s) {
  let t = 0;
  for (const id in RES) if (RES[id].cat === 'food') t += s.res[id] || 0;
  return t;
}
export function takeFood(s, n) {
  let left = n;
  for (const id in RES) {
    if (RES[id].cat !== 'food') continue;
    const take = Math.min(s.res[id] || 0, left);
    s.res[id] -= take; left -= take;
    if (left <= 0) break;
  }
}
export function indTotal(s) {
  let t = 0;
  for (const id in RES) if (RES[id].cat !== 'food') t += s.res[id] || 0;
  return t;
}
