import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculateBattleOutcome } from '@/lib/game-server';

export async function POST(req: NextRequest) {
  try {
    const { fromBaseId, toBaseId, unitIds } = await req.json();

    if (!fromBaseId || !toBaseId || !unitIds || unitIds.length === 0) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = getDb();

    // Verify both bases exist
    const [fromBase, toBase] = await Promise.all([
      db.query('SELECT * FROM bases WHERE id = $1', [fromBaseId]),
      db.query('SELECT * FROM bases WHERE id = $1', [toBaseId]),
    ]);

    if (fromBase.rows.length === 0 || toBase.rows.length === 0) {
      return NextResponse.json({ error: 'Base not found' }, { status: 404 });
    }

    // Verify units belong to fromBase
    const unitsResult = await db.query(
      'SELECT * FROM units WHERE id = ANY($1) AND base_id = $2',
      [unitIds, fromBaseId]
    );

    if (unitsResult.rows.length !== unitIds.length) {
      return NextResponse.json({ error: 'Not all units belong to from_base' }, { status: 400 });
    }

    const attackingUnits = unitsResult.rows;

    // Get defending units
    const defendingResult = await db.query('SELECT * FROM units WHERE base_id = $1', [toBaseId]);
    const defendingUnits = defendingResult.rows;

    // Calculate battle outcome
    const outcome = calculateBattleOutcome(attackingUnits, defendingUnits);

    // Create battle record
    const battleResult = await db.query(
      'INSERT INTO battles (attacker_base_id, defender_base_id, attacker_units, defender_units, outcome, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [fromBaseId, toBaseId, unitIds.length, defendingUnits.length, JSON.stringify(outcome)]
    );

    // Remove destroyed units
    if (outcome.destroyedAttacking.length > 0) {
      await db.query('DELETE FROM units WHERE id = ANY($1)', [outcome.destroyedAttacking]);
    }

    if (outcome.destroyedDefending.length > 0) {
      await db.query('DELETE FROM units WHERE id = ANY($1)', [outcome.destroyedDefending]);
    }

    return NextResponse.json({
      success: true,
      battle: battleResult.rows[0],
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

    const db = getDb();
    const result = await db.query(
      'SELECT * FROM battles WHERE attacker_base_id = $1 OR defender_base_id = $1 ORDER BY created_at DESC LIMIT 50',
      [baseId]
    );

    return NextResponse.json({ battles: result.rows });
  } catch (error) {
    console.error('Battles fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
