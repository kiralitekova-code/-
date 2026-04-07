import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { action, playerId, allianceId, allianceName } = await req.json();

    const sql = getDB();

    // Validate playerId is a valid UUID format
    if (!playerId || typeof playerId !== 'string') {
      return NextResponse.json({ error: 'Invalid playerId' }, { status: 400 });
    }

    if (action === 'create') {
      if (!allianceName) {
        return NextResponse.json({ error: 'Missing alliance name' }, { status: 400 });
      }

      const result = await sql`
        INSERT INTO alliances (name, leader_player_id, created_at, updated_at) 
        VALUES (${allianceName}, ${playerId}::uuid, NOW(), NOW()) 
        RETURNING *
      `;

      // Add leader as member
      await sql`
        INSERT INTO alliance_members (alliance_id, player_id, joined_at) 
        VALUES (${result[0].id}, ${playerId}::uuid, NOW())
      `;

      return NextResponse.json({ success: true, alliance: result[0] });
    } else if (action === 'join') {
      if (!allianceId) {
        return NextResponse.json({ error: 'Missing allianceId' }, { status: 400 });
      }

      // Check if already a member
      const existing = await sql`
        SELECT id FROM alliance_members 
        WHERE alliance_id = ${allianceId}::uuid AND player_id = ${playerId}::uuid
      `;

      if (existing.length > 0) {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 });
      }

      // Add member directly (no invite system in current schema)
      const result = await sql`
        INSERT INTO alliance_members (alliance_id, player_id, joined_at) 
        VALUES (${allianceId}::uuid, ${playerId}::uuid, NOW()) 
        RETURNING *
      `;

      return NextResponse.json({ success: true, member: result[0] });
    } else if (action === 'leave') {
      if (!allianceId) {
        return NextResponse.json({ error: 'Missing allianceId' }, { status: 400 });
      }

      await sql`
        DELETE FROM alliance_members 
        WHERE alliance_id = ${allianceId}::uuid AND player_id = ${playerId}::uuid
      `;

      return NextResponse.json({ success: true });
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

    const sql = getDB();

    if (action === 'my-alliances' && playerId) {
      // Validate UUID format before query
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(playerId)) {
        return NextResponse.json({ alliances: [] });
      }

      const result = await sql`
        SELECT a.* FROM alliances a
        JOIN alliance_members am ON a.id = am.alliance_id
        WHERE am.player_id = ${playerId}::uuid
      `;

      return NextResponse.json({ alliances: result });
    } else if (action === 'members' && playerId) {
      const allianceId = req.nextUrl.searchParams.get('allianceId');
      if (!allianceId) {
        return NextResponse.json({ error: 'Missing allianceId' }, { status: 400 });
      }

      const result = await sql`
        SELECT am.*, p.level, u.username 
        FROM alliance_members am
        JOIN players p ON am.player_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE am.alliance_id = ${allianceId}::uuid
      `;

      return NextResponse.json({ members: result });
    }

    // List all alliances
    const result = await sql`
      SELECT a.*, 
        (SELECT COUNT(*) FROM alliance_members WHERE alliance_id = a.id) as member_count
      FROM alliances a 
      ORDER BY created_at DESC 
      LIMIT 20
    `;
    return NextResponse.json({ alliances: result });
  } catch (error) {
    console.error('Alliances fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
