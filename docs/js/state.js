import { SEASONS, DAYS_PER_SEASON, DAILY_QUESTS } from './data.js';

export function newState() {
  return {
    money: 300,
    energy: 100,
    day: 1,
    timeOfDay: 0.30, // 0..1 (0.30 = утро)
    inventory: { [SEED_ITEM_PREFIX + 'turnip']: 4, [SEED_ITEM_PREFIX + 'potato']: 2 },
    selectedSeed: 'turnip',
    animals: {},
    plots: Array.from({ length: 12 }, () => ({ state: 'grass', crop: null, watered: false, growth: 0, age: 0 })),
    questIndex: 0,
    questClaimed: [],
    dailyQuests: [],
    dailyDone: [],
    stats: {
      tilled: 0, harvested: 0, earned: 0, oreMined: 0, convinced: 0,
      wateredToday: 0, harvestedToday: 0, collectedToday: 0, minedToday: 0, soldToday: 0,
      metNpcs: [], talkedTo: [], fireExtinguished: false, farmSaved: false, chestFound: false,
      giftsGiven: {},
    },
    adsWatchedToday: 0,
    lastAdBonus: 0,
    ended: false,
  };
}

export const SEED_ITEM_PREFIX = '_seeds_';
export const seedItemId = crop => SEED_ITEM_PREFIX + crop;
export const isSeedItem = id => id.startsWith(SEED_ITEM_PREFIX);

export function seasonOf(day) {
  return Math.min(Math.floor((day - 1) / DAYS_PER_SEASON), SEASONS.length - 1);
}
export function dayOfSeason(day) {
  return ((day - 1) % DAYS_PER_SEASON) + 1;
}

export function rollDailyQuests(state) {
  const pool = [...DAILY_QUESTS].sort(() => Math.random() - 0.5);
  state.dailyQuests = pool.slice(0, 3).map(q => q.id);
  state.dailyDone = [];
}

export function itemIcon(id) {
  if (isSeedItem(id)) return '🌱';
  const icons = { egg: '🥚', milk: '🥛', wool: '🧶', honey: '🍯', stone: '🪨', ore: '⛏️', gem: '💎', weed: '🌿', fish: '🐟', fish_rare: '🐠' };
  return icons[id] || '📦';
}

export function itemName(id, CROPS, ORE) {
  if (isSeedItem(id)) return 'Семена: ' + (CROPS[id.slice(SEED_ITEM_PREFIX.length)]?.name || '?');
  const names = { egg: 'Яйцо', milk: 'Молоко', wool: 'Шерсть', honey: 'Мёд', stone: 'Камень', ore: 'Руда', gem: 'Самоцвет', weed: 'Сорняк', fish: 'Рыба', fish_rare: 'Редкая рыба' };
  return names[id] || ORE[id]?.name || id;
}

const SAVE_KEY = 'derevenskiy-ray-save-v1';

export function saveGame(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}
export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s.day !== 'number') return null;
    return s;
  } catch (e) { return null; }
}
export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}
