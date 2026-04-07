import { NextRequest, NextResponse } from 'next/server';
import { gameServer } from '@/lib/game-server';

// Mock auth - in production, verify JWT from cookie
function getMockPlayerId(): string {
  return 'player_demo_001';
}

export async function GET() {
  try {
    const playerId = getMockPlayerId();
    
    // Load player state from database
    const player = await gameServer.loadPlayerState(playerId);
    
    if (!player) {
      // Create new player if doesn't exist
      return NextResponse.json({
        id: playerId,
        userId: 'user_demo',
        username: 'DemoPlayer',
        level: 1,
        experience: 0,
        totalKills: 0,
        totalLosses: 0,
        bases: [],
        units: [],
        resources: {
          money: 10000,
          steel: 5000,
          oil: 5000,
          electronics: 2000,
          manpower: 1000,
        },
      });
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
