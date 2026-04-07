import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

const MISSIONS = [
  {
    id: 'first-base',
    title: 'Build Your First Base',
    description: 'Construct your capital base',
    reward: 500,
    completed: true,
  },
  {
    id: 'train-units',
    title: 'Train Military Units',
    description: 'Train 10 infantry units',
    reward: 1000,
  },
  {
    id: 'research-tech',
    title: 'Complete Your First Research',
    description: 'Research any technology in the lab',
    reward: 750,
  },
  {
    id: 'first-attack',
    title: 'Launch First Attack',
    description: 'Attack another player\'s base',
    reward: 1500,
  },
  {
    id: 'form-alliance',
    title: 'Form or Join an Alliance',
    description: 'Join a faction to gain allies',
    reward: 1000,
  },
  {
    id: 'level-5',
    title: 'Reach Level 5',
    description: 'Gain enough experience to level up',
    reward: 2000,
  },
];

export async function GET(req: NextRequest) {
  try {
    const playerId = req.nextUrl.searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json({ error: 'Missing playerId' }, { status: 400 });
    }

    // For now, return mock missions
    // In production, these would be fetched from the database and checked against player progress
    return NextResponse.json({
      missions: MISSIONS.map((mission) => ({
        ...mission,
        // Simulate some progress
        progress: Math.floor(Math.random() * 100),
      })),
    });
  } catch (error) {
    console.error('Missions fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
