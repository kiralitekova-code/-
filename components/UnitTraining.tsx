'use client';

import { useState } from 'react';
import { UNIT_STATS } from '@/lib/constants';
import type { UnitType } from '@/lib/types/game';

const UNIT_TYPES = Object.keys(UNIT_STATS) as UnitType[];

interface UnitTrainingProps {
  baseId: string;
  resources: {
    money: number;
    steel: number;
    oil: number;
    electronics: number;
    manpower: number;
  };
  onTrain: (unitType: UnitType, quantity: number) => Promise<void>;
  isLoading: boolean;
}

export default function UnitTraining({
  baseId,
  resources,
  onTrain,
  isLoading,
}: UnitTrainingProps) {
  const [selectedUnit, setSelectedUnit] = useState<UnitType>('Infantry');
  const [quantity, setQuantity] = useState(1);

  const unitStats = UNIT_STATS[selectedUnit as keyof typeof UNIT_STATS];
  const cost = unitStats?.cost || { money: 0 };
  const totalCost = {
    money: (cost.money || 0) * quantity,
    steel: ((cost as any).steel || 0) * quantity,
    oil: ((cost as any).oil || 0) * quantity,
    electronics: ((cost as any).electronics || 0) * quantity,
    manpower: ((cost as any).manpower || 0) * quantity,
  };

  const canAfford =
    resources.money >= totalCost.money &&
    resources.steel >= totalCost.steel &&
    resources.oil >= totalCost.oil &&
    resources.electronics >= totalCost.electronics &&
    resources.manpower >= totalCost.manpower;

  const handleTrain = async () => {
    if (canAfford) {
      await onTrain(selectedUnit, quantity);
      setQuantity(1);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-amber-400 mb-4">Unit Training</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Unit Type</label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value as UnitType)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded"
          >
            {UNIT_TYPES.map((unit) => (
              <option key={unit} value={unit}>
                {unit.charAt(0).toUpperCase() + unit.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">Quantity</label>
          <input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded"
          />
        </div>

        <div className="bg-slate-900 rounded p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Money:</span>
            <span className={totalCost.money > resources.money ? 'text-red-400' : 'text-green-400'}>
              {totalCost.money}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Steel:</span>
            <span className={totalCost.steel > resources.steel ? 'text-red-400' : 'text-green-400'}>
              {totalCost.steel}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Oil:</span>
            <span className={totalCost.oil > resources.oil ? 'text-red-400' : 'text-green-400'}>
              {totalCost.oil}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Electronics:</span>
            <span
              className={totalCost.electronics > resources.electronics ? 'text-red-400' : 'text-green-400'}
            >
              {totalCost.electronics}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Manpower:</span>
            <span
              className={totalCost.manpower > resources.manpower ? 'text-red-400' : 'text-green-400'}
            >
              {totalCost.manpower}
            </span>
          </div>
        </div>

        <button
          onClick={handleTrain}
          disabled={!canAfford || isLoading}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white font-bold py-2 rounded"
        >
          {isLoading ? 'Training...' : 'Train Units'}
        </button>
      </div>
    </div>
  );
}
