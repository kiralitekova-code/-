import { NextRequest, NextResponse } from 'next/server';
import { gameServer } from '@/lib/game-server';

function getMockPlayerId(): string {
  return 'player_demo_001';
}

export async function POST(request: NextRequest) {
  try {
    const playerId = getMockPlayerId();
    const { name, x, y } = await request.json();

    if (!name || typeof x !== 'number' || typeof y !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const base = await gameServer.createBase(playerId, name, x, y);

    if (!base) {
      return NextResponse.json(
        { error: 'Failed to create base' },
        { status: 500 }
      );
    }

    return NextResponse.json(base, { status: 201 });
  } catch (error) {
    console.error('[v0] Error in POST /api/bases:', error);
    return NextResponse.json(
      { error: 'Failed to create base' },
      { status: 500 }
    );
  }
}
