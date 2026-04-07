import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { calculateBattleOutcome } from '@/lib/game-server';

export async function POST(req: NextRequest) {
  try {
    const { fromBaseId, toBaseId, unitIds } = await req.json();

    if (!fromBaseId || !toBaseId || !unitIds || unitIds.length === 0) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const sql = getDB();

    // Verify both bases exist
    const [fromBase, toBase] = await Promise.all([
      sql`SELECT * FROM bases WHERE id = ${fromBaseId}`,
      sql`SELECT * FROM bases WHERE id = ${toBaseId}`,
    ]);

    if (fromBase.length === 0 || toBase.length === 0) {
      return NextResponse.json({ error: 'Base not found' }, { status: 404 });
    }

    // Verify units belong to fromBase
    const attackingUnits = await sql`
      SELECT * FROM units WHERE id = ANY(${unitIds}) AND base_id = ${fromBaseId}
    `;

    if (attackingUnits.length !== unitIds.length) {
      return NextResponse.json({ error: 'Not all units belong to from_base' }, { status: 400 });
    }

    // Get defending units
    const defendingUnits = await sql`SELECT * FROM units WHERE base_id = ${toBaseId}`;

    // Calculate battle outcome
    const outcome = calculateBattleOutcome(attackingUnits, defendingUnits);

    // Create battle record
    const battleResult = await sql`
      INSERT INTO battles (attacker_base_id, defender_base_id, attacker_units, defender_units, outcome, created_at) 
      VALUES (${fromBaseId}, ${toBaseId}, ${unitIds.length}, ${defendingUnits.length}, ${JSON.stringify(outcome)}, NOW()) 
      RETURNING *
    `;

    // Remove destroyed units
    if (outcome.destroyedAttacking.length > 0) {
      await sql`DELETE FROM units WHERE id = ANY(${outcome.destroyedAttacking})`;
    }

    if (outcome.destroyedDefending.length > 0) {
      await sql`DELETE FROM units WHERE id = ANY(${outcome.destroyedDefending})`;
    }

    return NextResponse.json({
      success: true,
      battle: battleResult[0],
      outcome,
    });
  } catch (error) {
    console.error('Attack error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const baseId = req.nextUrl.searchParams.get('baseId');

    if (!baseId) {
      return NextResponse.json({ error: 'Missing baseId' }, { status: 400 });
    }

    const sql = getDB();
    const result = await sql`
      SELECT * FROM battles 
      WHERE attacker_base_id = ${baseId} OR defender_base_id = ${baseId} 
      ORDER BY created_at DESC 
      LIMIT 50
    `;

    return NextResponse.json({ battles: result });
  } catch (error) {
    console.error('Battles fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
