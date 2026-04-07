'use client';

import { useState } from 'react';

interface ResearchLabProps {
  baseId: string;
  playerId: string;
  resources: {
    money: number;
    steel: number;
    oil: number;
    electronics: number;
    manpower: number;
  };
  onResearch: (researchType: string) => Promise<void>;
  isLoading: boolean;
}

const RESEARCH_TYPES = [
  { id: 'armor', name: 'Advanced Armor', cost: { money: 5000, steel: 2000, electronics: 1000 } },
  { id: 'weapons', name: 'Weapon Systems', cost: { money: 4000, steel: 1500, electronics: 800 } },
  { id: 'speed', name: 'Engine Tech', cost: { money: 3000, steel: 1000, oil: 2000 } },
  { id: 'radar', name: 'Radar Systems', cost: { money: 6000, electronics: 3000, steel: 1000 } },
  { id: 'shield', name: 'Shield Tech', cost: { money: 7000, steel: 2000, electronics: 2000 } },
];

export default function ResearchLab({
  baseId,
  playerId,
  resources,
  onResearch,
  isLoading,
}: ResearchLabProps) {
  const [researching, setResearching] = useState<string | null>(null);

  const handleResearch = async (researchType: string) => {
    setResearching(researchType);
    try {
      await onResearch(researchType);
    } finally {
      setResearching(null);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-purple-400 mb-4">Research Lab</h3>

      <div className="space-y-3">
        {RESEARCH_TYPES.map((research) => {
          const canAfford =
            resources.money >= research.cost.money &&
            resources.steel >= (research.cost.steel || 0) &&
            resources.electronics >= (research.cost.electronics || 0) &&
            resources.oil >= (research.cost.oil || 0);

          return (
            <button
              key={research.id}
              onClick={() => handleResearch(research.id)}
              disabled={!canAfford || isLoading || researching !== null}
              className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:opacity-50 text-left p-3 rounded border border-slate-600 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-purple-300">{research.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    💰 {research.cost.money} 🔩 {research.cost.steel} 🔌{' '}
                    {research.cost.electronics}
                    {research.cost.oil ? ` 🛢️ ${research.cost.oil}` : ''}
                  </p>
                </div>
                {researching === research.id && <span className="text-blue-400">Researching...</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
