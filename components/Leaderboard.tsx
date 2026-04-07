'use client';

import useSWR from 'swr';

interface LeaderboardEntry {
  id: string;
  username: string;
  level: number;
  totalKills: number;
  baseCount: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Leaderboard() {
  const { data, isLoading } = useSWR('/api/leaderboard', fetcher);

  const entries = data?.leaderboard || [];

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-yellow-400 mb-4">Global Leaderboard</h3>

      {isLoading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-slate-400 text-sm">No players yet</p>
      ) : (
        <div className="space-y-2">
          {entries.slice(0, 10).map((entry: LeaderboardEntry, index: number) => (
            <div
              key={entry.id}
              className="flex justify-between items-center bg-slate-700 rounded p-3 border border-slate-600"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{entry.username}</p>
                  <p className="text-xs text-slate-400">Level {entry.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-red-400">{entry.totalKills} Kills</p>
                <p className="text-xs text-slate-400">{entry.baseCount} Bases</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
