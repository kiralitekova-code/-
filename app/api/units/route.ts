import { NextRequest, NextResponse } from 'next/server';
import { gameServer } from '@/lib/game-server';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

export async function POST(request: NextRequest) {
  try {
    const { playerId, baseId, unitType, quantity } = await request.json();

    if (!playerId || !isValidUUID(playerId)) {
      return NextResponse.json(
        { error: 'Valid player ID is required' },
        { status: 400 }
      );
    }

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
