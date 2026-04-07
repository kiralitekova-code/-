import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

const RESEARCH_COSTS = {
  armor: { money: 5000, steel: 2000, electronics: 1000 },
  weapons: { money: 4000, steel: 1500, electronics: 800 },
  speed: { money: 3000, steel: 1000, oil: 2000 },
  radar: { money: 6000, electronics: 3000, steel: 1000 },
  shield: { money: 7000, steel: 2000, electronics: 2000 },
};

export async function POST(req: NextRequest) {
  try {
    const { baseId, researchType, playerId } = await req.json();

    if (!baseId || !researchType || !playerId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = getDB();

    // Get player resources
    const resourcesResult = await db.query(
      'SELECT money, steel, oil, electronics, manpower FROM players WHERE id = $1',
      [playerId]
    );

    if (resourcesResult.rows.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const resources = resourcesResult.rows[0];
    const costs = (RESEARCH_COSTS as any)[researchType] || { money: 0, steel: 0, electronics: 0 };

    // Check if player has enough resources
    if (
      resources.money < costs.money ||
      resources.steel < costs.steel ||
      resources.electronics < costs.electronics
    ) {
      return NextResponse.json({ error: 'Insufficient resources' }, { status: 400 });
    }

    // Deduct resources
    await db.query(
      'UPDATE players SET money = money - $1, steel = steel - $2, electronics = electronics - $3 WHERE id = $4',
      [costs.money, costs.steel, costs.electronics, playerId]
    );

    // Record research
    const researchResult = await db.query(
      'INSERT INTO research (player_id, base_id, research_type, completed_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [playerId, baseId, researchType]
    );

    return NextResponse.json({
      success: true,
      research: researchResult.rows[0],
    });
  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const playerId = req.nextUrl.searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json({ error: 'Missing playerId' }, { status: 400 });
    }

    const db = getDB();
    const result = await db.query(
      'SELECT * FROM research WHERE player_id = $1 ORDER BY completed_at DESC',
      [playerId]
    );

    return NextResponse.json({ research: result.rows });
  } catch (error) {
    console.error('Research fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
