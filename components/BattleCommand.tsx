'use client';

import { useState } from 'react';
import type { Unit, Base } from '@/lib/types/game';

interface BattleCommandProps {
  selectedBase: Base | null;
  selectedUnits: string[];
  onAttack: (unitIds: string[], targetBaseId: string) => Promise<void>;
  isLoading: boolean;
  availableBases: Base[];
}

export default function BattleCommand({
  selectedBase,
  selectedUnits,
  onAttack,
  isLoading,
  availableBases,
}: BattleCommandProps) {
  const [targetBaseId, setTargetBaseId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!selectedBase || selectedUnits.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 opacity-50">
        <h3 className="text-lg font-bold text-red-400 mb-2">Attack Command</h3>
        <p className="text-sm text-slate-400">Select a base and units to attack</p>
      </div>
    );
  }

  const validTargets = availableBases.filter((b) => b.id !== selectedBase.id);

  const handleAttack = async () => {
    if (!targetBaseId) return;
    await onAttack(selectedUnits, targetBaseId);
    setTargetBaseId('');
    setShowConfirm(false);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-red-700">
      <h3 className="text-lg font-bold text-red-400 mb-4">Attack Command</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Target Base</label>
          <select
            value={targetBaseId}
            onChange={(e) => setTargetBaseId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded"
          >
            <option value="">Select a target...</option>
            {validTargets.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name} (Level {base.level})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900 rounded p-3 text-sm">
          <p className="text-slate-300">
            <span className="font-semibold text-blue-400">Units Selected:</span> {selectedUnits.length}
          </p>
        </div>

        {showConfirm ? (
          <div className="space-y-2">
            <p className="text-sm text-yellow-400">Confirm attack on selected base?</p>
            <div className="flex gap-2">
              <button
                onClick={handleAttack}
                disabled={!targetBaseId || isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-bold py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!targetBaseId || isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-bold py-2 rounded"
          >
            Launch Attack
          </button>
        )}
      </div>
    </div>
  );
}
