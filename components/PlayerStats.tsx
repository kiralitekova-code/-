'use client';

import type { Player } from '@/lib/types/game';

interface PlayerStatsProps {
  player: Player;
}

export default function PlayerStats({ player }: PlayerStatsProps) {
  const winRate =
    player.totalKills + player.totalLosses > 0
      ? Math.round((player.totalKills / (player.totalKills + player.totalLosses)) * 100)
      : 0;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-400">{player.username}</h2>
          <p className="text-slate-400">Level {player.level}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700/50 rounded p-3">
          <p className="text-xs text-slate-400 mb-1">Experience</p>
          <p className="text-lg font-bold text-blue-400">{player.experience}</p>
        </div>

        <div className="bg-slate-700/50 rounded p-3">
          <p className="text-xs text-slate-400 mb-1">Bases</p>
          <p className="text-lg font-bold text-green-400">{player.bases.length}</p>
        </div>

        <div className="bg-slate-700/50 rounded p-3">
          <p className="text-xs text-slate-400 mb-1">Total Kills</p>
          <p className="text-lg font-bold text-red-400">{player.totalKills}</p>
        </div>

        <div className="bg-slate-700/50 rounded p-3">
          <p className="text-xs text-slate-400 mb-1">Total Losses</p>
          <p className="text-lg font-bold text-yellow-400">{player.totalLosses}</p>
        </div>

        <div className="col-span-2 bg-slate-700/50 rounded p-3">
          <p className="text-xs text-slate-400 mb-1">Win Rate</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-900 rounded h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded"
                style={{ width: `${winRate}%` }}
              ></div>
            </div>
            <span className="text-lg font-bold text-purple-400">{winRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
