import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { action, username, email } = await req.json();

    if (!action || !username || !email) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = getDb();

    if (action === 'register') {
      // Check if user already exists
      const existingResult = await db.query(
        'SELECT id FROM players WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingResult.rows.length > 0) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
      }

      // Create new player
      const playerId = crypto.randomUUID();
      const result = await db.query(
        'INSERT INTO players (id, username, email, level, experience, total_kills, total_losses) VALUES ($1, $2, $3, 1, 0, 0, 0) RETURNING *',
        [playerId, username, email]
      );

      // Initialize resources
      await db.query(
        'INSERT INTO resources (player_id, money, steel, oil, electronics, manpower) VALUES ($1, 5000, 1000, 500, 200, 100)',
        [playerId]
      );

      // Create first base
      await db.query(
        'INSERT INTO bases (player_id, name, x_coord, y_coord, health, level) VALUES ($1, $2, $3, $4, 1000, 1)',
        [playerId, 'Capital', 0, 0]
      );

      return NextResponse.json({
        success: true,
        player: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          level: result.rows[0].level,
        },
      });
    } else if (action === 'login') {
      // Simple login - just check if user exists
      const result = await db.query(
        'SELECT id, username, level FROM players WHERE username = $1 OR email = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        player: result.rows[0],
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const playerId = req.nextUrl.searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json({ error: 'Missing playerId' }, { status: 400 });
    }

    const db = getDb();

    // Get player info
    const playerResult = await db.query('SELECT * FROM players WHERE id = $1', [playerId]);

    if (playerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const player = playerResult.rows[0];

    // Get resources
    const resourcesResult = await db.query('SELECT * FROM resources WHERE player_id = $1', [
      playerId,
    ]);

    // Get bases
    const basesResult = await db.query('SELECT * FROM bases WHERE player_id = $1', [playerId]);

    // Get units
    const unitsResult = await db.query('SELECT * FROM units WHERE player_id = $1', [playerId]);

    return NextResponse.json({
      id: player.id,
      username: player.username,
      level: player.level,
      experience: player.experience,
      totalKills: player.total_kills,
      totalLosses: player.total_losses,
      resources: resourcesResult.rows[0] || {
        money: 5000,
        steel: 1000,
        oil: 500,
        electronics: 200,
        manpower: 100,
      },
      bases: basesResult.rows.map((b: any) => ({
        id: b.id,
        playerId: b.player_id,
        name: b.name,
        x: b.x_coord,
        y: b.y_coord,
        health: b.health,
        maxHealth: 1000,
        level: b.level,
      })),
      units: unitsResult.rows.map((u: any) => ({
        id: u.id,
        playerId: u.player_id,
        baseId: u.base_id,
        type: u.unit_type,
        quantity: u.quantity,
        health: u.health,
        level: u.level,
      })),
    });
  } catch (error) {
    console.error('Auth fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
