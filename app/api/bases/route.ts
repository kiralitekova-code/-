import { NextRequest, NextResponse } from 'next/server';
import { gameServer } from '@/lib/game-server';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

export async function POST(request: NextRequest) {
  try {
    const { playerId, name, x, y } = await request.json();

    if (!playerId || !isValidUUID(playerId)) {
      return NextResponse.json(
        { error: 'Valid player ID is required' },
        { status: 400 }
      );
    }

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
