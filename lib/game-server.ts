import { Player, Base, Unit, Resources, Battle } from './types/game';
import { GAME_CONFIG, UNIT_STATS } from './constants';
import { getDB } from './db';

export class GameServer {
  private players: Map<string, Player> = new Map();
  private battles: Battle[] = [];

  async loadPlayerState(playerId: string): Promise<Player | null> {
    const db = getDB();

    try {
      const playerResult = await db`
        SELECT p.id, p.user_id, p.level, p.experience, p.total_kills, p.total_losses
        FROM players p
        WHERE p.id = ${playerId}
      `;

      if (playerResult.length === 0) return null;

      const player = playerResult[0];
      
      // Load resources
      const resourcesResult = await db`
        SELECT money, steel, oil, electronics, manpower
        FROM resources
        WHERE player_id = ${playerId}
      `;

      const resources = resourcesResult[0] || GAME_CONFIG.STARTING_RESOURCES;

      // Load bases
      const basesResult = await db`
        SELECT id, player_id, name, x_coord, y_coord, health, level
        FROM bases
        WHERE player_id = ${playerId}
      `;

      // Load units
      const unitsResult = await db`
        SELECT id, player_id, base_id, unit_type, quantity, health, level
        FROM units
        WHERE player_id = ${playerId}
      `;

      const gamePlayer: Player = {
        id: player.id,
        userId: player.user_id,
        username: `Player_${player.id.substring(0, 8)}`,
        level: player.level,
        experience: player.experience,
        totalKills: player.total_kills,
        totalLosses: player.total_losses,
        bases: basesResult.map((b: any) => ({
          id: b.id,
          playerId: b.player_id,
          name: b.name,
          x: b.x_coord,
          y: b.y_coord,
          health: b.health,
          maxHealth: 1000,
          level: b.level,
          createdAt: new Date(),
        })),
        units: unitsResult.map((u: any) => ({
          id: u.id,
          playerId: u.player_id,
          baseId: u.base_id,
          type: u.unit_type,
          quantity: u.quantity,
          health: u.health,
          level: u.level,
        })),
        resources: resources as Resources,
      };

      this.players.set(playerId, gamePlayer);
      return gamePlayer;
    } catch (error) {
      console.error('[v0] Error loading player state:', error);
      return null;
    }
  }

  async createBase(playerId: string, name: string, x: number, y: number): Promise<Base | null> {
    const db = getDB();

    try {
      const result = await db`
        INSERT INTO bases (player_id, name, x_coord, y_coord, health, level)
        VALUES (${playerId}, ${name}, ${x}, ${y}, 1000, 1)
        RETURNING id, player_id, name, x_coord, y_coord, health, level
      `;

      if (result.length === 0) return null;

      const base = result[0];
      return {
        id: base.id,
        playerId: base.player_id,
        name: base.name,
        x: base.x_coord,
        y: base.y_coord,
        health: base.health,
        maxHealth: 1000,
        level: base.level,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('[v0] Error creating base:', error);
      return null;
    }
  }

  async createUnit(
    playerId: string,
    baseId: string,
    unitType: string,
    quantity: number
  ): Promise<Unit | null> {
    const db = getDB();

    try {
      const result = await db`
        INSERT INTO units (player_id, base_id, unit_type, quantity, health, level)
        VALUES (${playerId}, ${baseId}, ${unitType}, ${quantity}, 100, 1)
        RETURNING id, player_id, base_id, unit_type, quantity, health, level
      `;

      if (result.length === 0) return null;

      const unit = result[0];
      return {
        id: unit.id,
        playerId: unit.player_id,
        baseId: unit.base_id,
        type: unit.unit_type,
        quantity: unit.quantity,
        health: unit.health,
        level: unit.level,
      };
    } catch (error) {
      console.error('[v0] Error creating unit:', error);
      return null;
    }
  }

  async updateResources(playerId: string, resources: Partial<Resources>): Promise<boolean> {
    const db = getDB();

    try {
      const updateSet: string[] = [];
      const values: any[] = [playerId];
      let valueIndex = 2;

      if (resources.money !== undefined) {
        updateSet.push(`money = $${valueIndex}`);
        values.push(resources.money);
        valueIndex++;
      }
      if (resources.steel !== undefined) {
        updateSet.push(`steel = $${valueIndex}`);
        values.push(resources.steel);
        valueIndex++;
      }
      if (resources.oil !== undefined) {
        updateSet.push(`oil = $${valueIndex}`);
        values.push(resources.oil);
        valueIndex++;
      }
      if (resources.electronics !== undefined) {
        updateSet.push(`electronics = $${valueIndex}`);
        values.push(resources.electronics);
        valueIndex++;
      }
      if (resources.manpower !== undefined) {
        updateSet.push(`manpower = $${valueIndex}`);
        values.push(resources.manpower);
        valueIndex++;
      }

      if (updateSet.length === 0) return true;

      const query = `UPDATE resources SET ${updateSet.join(', ')} WHERE player_id = $1`;
      await db.unsafe(query, values);
      return true;
    } catch (error) {
      console.error('[v0] Error updating resources:', error);
      return false;
    }
  }

  resolveBattle(attackerUnits: Unit[], defenderUnits: Unit[]): Battle {
    // Simplified combat calculation
    const attackerStrength = attackerUnits.reduce(
      (sum, u) => sum + (UNIT_STATS[u.type as keyof typeof UNIT_STATS]?.attack || 0) * u.quantity,
      0
    );

    const defenderStrength = defenderUnits.reduce(
      (sum, u) => sum + (UNIT_STATS[u.type as keyof typeof UNIT_STATS]?.defense || 0) * u.quantity,
      0
    );

    const attackerLosses = Math.max(1, Math.floor(attackerStrength * 0.1));
    const defenderLosses = Math.max(1, Math.floor(defenderStrength * 0.15));

    let outcome: 'win' | 'loss' | 'draw' = 'draw';
    if (attackerStrength > defenderStrength) outcome = 'win';
    else if (defenderStrength > attackerStrength) outcome = 'loss';

    return {
      id: crypto.getRandomValues(new Uint8Array(16)).toString(),
      attackerId: attackerUnits[0].playerId,
      defenderId: defenderUnits[0].playerId,
      attackerLosses,
      defenderLosses,
      outcome,
      timestamp: Date.now(),
    };
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }
}

export const gameServer = new GameServer();
