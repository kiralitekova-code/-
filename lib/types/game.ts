export type UnitType = 'Infantry' | 'Tank' | 'Helicopter' | 'Battleship' | 'Fighter';

export type ResourceType = 'money' | 'steel' | 'oil' | 'electronics' | 'manpower';

export interface Resources {
  money: number;
  steel: number;
  oil: number;
  electronics: number;
  manpower: number;
}

export interface Base {
  id: string;
  playerId: string;
  name: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  level: number;
  createdAt: Date;
}

export interface Unit {
  id: string;
  playerId: string;
  baseId?: string;
  type: UnitType;
  quantity: number;
  health: number;
  level: number;
}

export interface Player {
  id: string;
  userId: string;
  username: string;
  level: number;
  experience: number;
  totalKills: number;
  totalLosses: number;
  bases: Base[];
  units: Unit[];
  resources: Resources;
  alliance?: {
    id: string;
    name: string;
  };
}

export interface GameState {
  players: Map<string, Player>;
  currentTurn: number;
}

export interface Battle {
  id: string;
  attackerId: string;
  defenderId: string;
  attackerBaseId?: string;
  defenderBaseId?: string;
  attackerLosses: number;
  defenderLosses: number;
  outcome: 'win' | 'loss' | 'draw';
  timestamp: number;
}

export interface TechTree {
  [key: string]: {
    name: string;
    level: number;
    maxLevel: number;
    cost: Partial<Resources>;
    researchTime: number;
    effects: {
      [key: string]: number;
    };
  };
}
