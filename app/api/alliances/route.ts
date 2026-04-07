import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { action, playerId, allianceId, targetPlayerId, allianceName } = await req.json();

    const db = getDb();

    if (action === 'create') {
      if (!allianceName || !playerId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      const result = await db.query(
        'INSERT INTO alliances (name, leader_id, created_at) VALUES ($1, $2, NOW()) RETURNING *',
        [allianceName, playerId]
      );

      // Add leader as member
      await db.query(
        'INSERT INTO alliance_members (alliance_id, player_id, role, joined_at) VALUES ($1, $2, $3, NOW())',
        [result.rows[0].id, playerId, 'leader']
      );

      return NextResponse.json({ success: true, alliance: result.rows[0] });
    } else if (action === 'invite') {
      if (!allianceId || !targetPlayerId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      const result = await db.query(
        'INSERT INTO alliance_invites (alliance_id, player_id, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [allianceId, targetPlayerId, 'pending']
      );

      return NextResponse.json({ success: true, invite: result.rows[0] });
    } else if (action === 'accept') {
      if (!allianceId || !playerId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      // Update invite status
      await db.query('UPDATE alliance_invites SET status = $1 WHERE alliance_id = $2 AND player_id = $3', [
        'accepted',
        allianceId,
        playerId,
      ]);

      // Add member
      const result = await db.query(
        'INSERT INTO alliance_members (alliance_id, player_id, role, joined_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [allianceId, playerId, 'member']
      );

      return NextResponse.json({ success: true, member: result.rows[0] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Alliance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const playerId = req.nextUrl.searchParams.get('playerId');
    const action = req.nextUrl.searchParams.get('action');

    if (!playerId) {
      return NextResponse.json({ error: 'Missing playerId' }, { status: 400 });
    }

    const db = getDb();

    if (action === 'my-alliances') {
      const result = await db.query(
        `SELECT a.* FROM alliances a
         JOIN alliance_members am ON a.id = am.alliance_id
         WHERE am.player_id = $1`,
        [playerId]
      );

      return NextResponse.json({ alliances: result.rows });
    } else if (action === 'invites') {
      const result = await db.query('SELECT * FROM alliance_invites WHERE player_id = $1 AND status = $2', [
        playerId,
        'pending',
      ]);

      return NextResponse.json({ invites: result.rows });
    }

    const result = await db.query('SELECT * FROM alliances LIMIT 20');
    return NextResponse.json({ alliances: result.rows });
  } catch (error) {
    console.error('Alliances fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
