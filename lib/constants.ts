export const GAME_CONFIG = {
  GRID_SIZE: 20,
  MAX_BASES_PER_PLAYER: 5,
  STARTING_RESOURCES: {
    money: 10000,
    steel: 5000,
    oil: 5000,
    electronics: 2000,
    manpower: 1000,
  },
  BASE_MAX_HEALTH: 1000,
  RESOURCE_GENERATION_INTERVAL: 5000, // ms
  COMBAT_RESOLUTION_TIME: 2000, // ms
};

export const UNIT_STATS = {
  Infantry: {
    cost: { money: 100, manpower: 50 },
    attack: 10,
    defense: 5,
    health: 20,
  },
  Tank: {
    cost: { money: 500, steel: 100, oil: 50 },
    attack: 30,
    defense: 20,
    health: 60,
  },
  Helicopter: {
    cost: { money: 1000, electronics: 100, oil: 100 },
    attack: 25,
    defense: 10,
    health: 40,
  },
  Battleship: {
    cost: { money: 2000, steel: 300, oil: 200 },
    attack: 40,
    defense: 30,
    health: 100,
  },
  Fighter: {
    cost: { money: 800, electronics: 150, oil: 75 },
    attack: 20,
    defense: 8,
    health: 30,
  },
};

export const TECH_TREE = {
  infantry_training: {
    name: 'Infantry Training',
    maxLevel: 3,
    cost: { money: 500, manpower: 100 },
    researchTime: 60000,
    bonuses: { infantry_damage: 0.1 },
  },
  armor_plating: {
    name: 'Armor Plating',
    maxLevel: 5,
    cost: { money: 1000, steel: 200 },
    researchTime: 90000,
    bonuses: { vehicle_defense: 0.15 },
  },
  advanced_electronics: {
    name: 'Advanced Electronics',
    maxLevel: 3,
    cost: { money: 2000, electronics: 300 },
    researchTime: 120000,
    bonuses: { air_unit_attack: 0.2 },
  },
};
