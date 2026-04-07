'use client';

import { UNIT_STATS } from '@/lib/constants';
import type { Unit } from '@/lib/types/game';

interface UnitsDisplayProps {
  units: Unit[];
  onSelectUnit?: (unit: Unit) => void;
  selectedUnitId?: string;
}

export default function UnitsDisplay({
  units,
  onSelectUnit,
  selectedUnitId,
}: UnitsDisplayProps) {
  if (!units || units.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-bold text-blue-400 mb-4">Military Units</h3>
        <p className="text-slate-400">No units stationed here</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-blue-400 mb-4">Military Units</h3>
      <div className="space-y-2">
        {units.map((unit) => {
          const stats = UNIT_STATS[unit.type as keyof typeof UNIT_STATS] || {
            attack: 0,
            defense: 0,
          };
          const isSelected = selectedUnitId === unit.id;

          return (
            <button
              key={unit.id}
              onClick={() => onSelectUnit?.(unit)}
              className={`w-full text-left p-3 rounded border transition ${
                isSelected
                  ? 'bg-blue-900 border-blue-500'
                  : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-blue-300">
                    {unit.type.charAt(0).toUpperCase() + unit.type.slice(1)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Qty: {unit.quantity} | Lvl: {unit.level} | HP: {unit.health}
                  </p>
                  <p className="text-xs text-slate-400">
                    ⚔️ {stats.attack} | 🛡️ {stats.defense}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
