import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { action, playerId, allianceId, targetPlayerId, allianceName } = await req.json();

    const sql = getDB();

    if (action === 'create') {
      if (!allianceName || !playerId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      const result = await sql`
        INSERT INTO alliances (name, leader_id, created_at) 
        VALUES (${allianceName}, ${playerId}, NOW()) 
        RETURNING *
      `;

      // Add leader as member
      await sql`
        INSERT INTO alliance_members (alliance_id, player_id, role, joined_at) 
        VALUES (${result[0].id}, ${playerId}, 'leader', NOW())
      `;

      return NextResponse.json({ success: true, alliance: result[0] });
    } else if (action === 'invite') {
      if (!allianceId || !targetPlayerId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      const result = await sql`
        INSERT INTO alliance_invites (alliance_id, player_id, status, created_at) 
        VALUES (${allianceId}, ${targetPlayerId}, 'pending', NOW()) 
        RETURNING *
      `;

      return NextResponse.json({ success: true, invite: result[0] });
    } else if (action === 'accept') {
      if (!allianceId || !playerId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      // Update invite status
      await sql`
        UPDATE alliance_invites SET status = 'accepted' 
        WHERE alliance_id = ${allianceId} AND player_id = ${playerId}
      `;

      // Add member
      const result = await sql`
        INSERT INTO alliance_members (alliance_id, player_id, role, joined_at) 
        VALUES (${allianceId}, ${playerId}, 'member', NOW()) 
        RETURNING *
      `;

      return NextResponse.json({ success: true, member: result[0] });
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

    const sql = getDB();

    if (action === 'my-alliances') {
      const result = await sql`
        SELECT a.* FROM alliances a
        JOIN alliance_members am ON a.id = am.alliance_id
        WHERE am.player_id = ${playerId}
      `;

      return NextResponse.json({ alliances: result });
    } else if (action === 'invites') {
      const result = await sql`
        SELECT * FROM alliance_invites WHERE player_id = ${playerId} AND status = 'pending'
      `;

      return NextResponse.json({ invites: result });
    }

    const result = await sql`SELECT * FROM alliances LIMIT 20`;
    return NextResponse.json({ alliances: result });
  } catch (error) {
    console.error('Alliances fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
