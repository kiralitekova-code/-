import { NextRequest, NextResponse } from 'next/server';
import { gameServer } from '@/lib/game-server';

function getMockPlayerId(): string {
  return 'player_demo_001';
}

export async function POST(request: NextRequest) {
  try {
    const playerId = getMockPlayerId();
    const { baseId, unitType, quantity } = await request.json();

    if (!baseId || !unitType || !quantity) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const unit = await gameServer.createUnit(playerId, baseId, unitType, quantity);

    if (!unit) {
      return NextResponse.json(
        { error: 'Failed to create unit' },
        { status: 500 }
      );
    }

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error('[v0] Error in POST /api/units:', error);
    return NextResponse.json(
      { error: 'Failed to create unit' },
      { status: 500 }
    );
  }
}
