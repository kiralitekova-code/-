import { NextRequest, NextResponse } from 'next/server';
import { gameServer } from '@/lib/game-server';
import { getDB } from '@/lib/db';
import { GAME_CONFIG } from '@/lib/constants';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

export async function GET(req: NextRequest) {
  try {
    const playerId = req.nextUrl.searchParams.get('playerId');
    
    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    if (!isValidUUID(playerId)) {
      return NextResponse.json(
        { error: 'Invalid player ID format' },
        { status: 400 }
      );
    }

    // Load player state from database
    const player = await gameServer.loadPlayerState(playerId);
    
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error('[v0] Error in GET /api/player:', error);
    return NextResponse.json(
      { error: 'Failed to load player data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { playerId, action, data } = await req.json();

    if (!playerId || !isValidUUID(playerId)) {
      return NextResponse.json(
        { error: 'Valid player ID is required' },
        { status: 400 }
      );
    }

    const sql = getDB();

    if (action === 'update-resources') {
      const { resources } = data;
      await sql`
        UPDATE resources 
        SET 
          money = ${resources.money},
          steel = ${resources.steel},
          oil = ${resources.oil},
          electronics = ${resources.electronics},
          manpower = ${resources.manpower}
        WHERE player_id = ${playerId}::uuid
      `;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[v0] Error in POST /api/player:', error);
    return NextResponse.json(
      { error: 'Failed to update player data' },
      { status: 500 }
    );
  }
}
