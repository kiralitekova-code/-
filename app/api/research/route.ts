import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

const RESEARCH_COSTS: Record<string, { money: number; steel: number; electronics: number }> = {
  armor: { money: 5000, steel: 2000, electronics: 1000 },
  weapons: { money: 4000, steel: 1500, electronics: 800 },
  speed: { money: 3000, steel: 1000, electronics: 500 },
  radar: { money: 6000, steel: 1000, electronics: 3000 },
  shield: { money: 7000, steel: 2000, electronics: 2000 },
};

export async function POST(req: NextRequest) {
  try {
    const { baseId, researchType, playerId } = await req.json();

    if (!baseId || !researchType || !playerId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const sql = getDB();

    // Get player resources
    const resourcesResult = await sql`
      SELECT money, steel, oil, electronics, manpower FROM resources WHERE player_id = ${playerId}
    `;

    if (resourcesResult.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const resources = resourcesResult[0];
    const costs = RESEARCH_COSTS[researchType] || { money: 0, steel: 0, electronics: 0 };

    // Check if player has enough resources
    if (
      resources.money < costs.money ||
      resources.steel < costs.steel ||
      resources.electronics < costs.electronics
    ) {
      return NextResponse.json({ error: 'Insufficient resources' }, { status: 400 });
    }

    // Deduct resources
    await sql`
      UPDATE resources 
      SET money = money - ${costs.money}, steel = steel - ${costs.steel}, electronics = electronics - ${costs.electronics} 
      WHERE player_id = ${playerId}
    `;

    // Record research
    const researchResult = await sql`
      INSERT INTO research (player_id, base_id, research_type, completed_at) 
      VALUES (${playerId}, ${baseId}, ${researchType}, NOW()) 
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      research: researchResult[0],
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

    const sql = getDB();
    const result = await sql`
      SELECT * FROM research WHERE player_id = ${playerId} ORDER BY completed_at DESC
    `;

    return NextResponse.json({ research: result });
  } catch (error) {
    console.error('Research fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
