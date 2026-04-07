import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDB();

    const result = await db.query(
      `SELECT 
        p.id,
        p.username,
        p.level,
        p.total_kills,
        COUNT(b.id) as base_count
      FROM players p
      LEFT JOIN bases b ON p.id = b.player_id
      GROUP BY p.id, p.username, p.level, p.total_kills
      ORDER BY p.total_kills DESC, p.level DESC
      LIMIT 100`,
      []
    );

    return NextResponse.json({
      leaderboard: result.rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        level: row.level,
        totalKills: row.total_kills,
        baseCount: parseInt(row.base_count),
      })),
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
