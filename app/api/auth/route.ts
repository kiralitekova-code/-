import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import crypto from 'node:crypto';

export async function POST(req: NextRequest) {
  try {
    const { action, username, email } = await req.json();

    if (!action || !username || !email) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const sql = getDB();

    if (action === 'register') {
      // Check if user already exists
      const existing = await sql`
        SELECT id FROM players WHERE username = ${username} OR email = ${email}
      `;

      if (existing.length > 0) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
      }

      // Create new player
      const playerId = crypto.randomUUID();
      const result = await sql`
        INSERT INTO players (id, username, email, level, experience, total_kills, total_losses) 
        VALUES (${playerId}, ${username}, ${email}, 1, 0, 0, 0) 
        RETURNING *
      `;

      // Initialize resources
      await sql`
        INSERT INTO resources (player_id, money, steel, oil, electronics, manpower) 
        VALUES (${playerId}, 5000, 1000, 500, 200, 100)
      `;

      // Create first base
      await sql`
        INSERT INTO bases (player_id, name, x_coord, y_coord, health, level) 
        VALUES (${playerId}, 'Capital', 0, 0, 1000, 1)
      `;

      return NextResponse.json({
        success: true,
        player: {
          id: result[0].id,
          username: result[0].username,
          level: result[0].level,
        },
      });
    } else if (action === 'login') {
      // Simple login - just check if user exists
      const result = await sql`
        SELECT id, username, level FROM players WHERE username = ${username} OR email = ${username}
      `;

      if (result.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        player: result[0],
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

    const sql = getDB();

    // Get player info
    const playerResult = await sql`SELECT * FROM players WHERE id = ${playerId}`;

    if (playerResult.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const player = playerResult[0];

    // Get resources
    const resourcesResult = await sql`SELECT * FROM resources WHERE player_id = ${playerId}`;

    // Get bases
    const basesResult = await sql`SELECT * FROM bases WHERE player_id = ${playerId}`;

    // Get units
    const unitsResult = await sql`SELECT * FROM units WHERE player_id = ${playerId}`;

    return NextResponse.json({
      id: player.id,
      username: player.username,
      level: player.level,
      experience: player.experience,
      totalKills: player.total_kills,
      totalLosses: player.total_losses,
      resources: resourcesResult[0] || {
        money: 5000,
        steel: 1000,
        oil: 500,
        electronics: 200,
        manpower: 100,
      },
      bases: basesResult.map((b: any) => ({
        id: b.id,
        playerId: b.player_id,
        name: b.name,
        x: b.x_coord,
        y: b.y_coord,
        health: b.health,
        maxHealth: 1000,
        level: b.level,
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
    });
  } catch (error) {
    console.error('Auth fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
