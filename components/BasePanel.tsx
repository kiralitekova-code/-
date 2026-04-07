'use client';

import React, { useState } from 'react';
import { Base, Unit } from '@/lib/types/game';
import { UNIT_STATS } from '@/lib/constants';

interface BasePanelProps {
  base: Base;
  units: Unit[];
  onBuildUnit?: (unitType: string) => void;
}

export default function BasePanel({ base, units, onBuildUnit }: BasePanelProps) {
  const baseUnits = units.filter((u) => u.baseId === base.id);
  const healthPercent = (base.health / base.maxHealth) * 100;

  return (
    <div className="panel w-full">
      <div className="panel-header">{base.name}</div>

      <div className="panel-item mb-4">
        <span className="text-sm">Level {base.level}</span>
        <span className="text-sm">({base.x}, {base.y})</span>
      </div>

      <div className="mb-4">
        <div className="text-xs text-blue-400 mb-1">Health</div>
        <div className="health-bar">
          <div
            className={`health-bar-fill ${
              healthPercent <= 30
                ? 'critical'
                : healthPercent <= 60
                  ? 'damaged'
                  : ''
            }`}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
        <div className="text-xs text-yellow-400 mt-1">
          {base.health} / {base.maxHealth}
        </div>
      </div>

      {baseUnits.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-blue-400 font-semibold mb-2">Units</div>
          <div className="space-y-1">
            {baseUnits.map((unit) => (
              <div key={unit.id} className="text-xs flex justify-between">
                <span>{unit.type}</span>
                <span className="text-yellow-400">x{unit.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onBuildUnit && (
        <div className="mt-4">
          <div className="text-xs text-blue-400 font-semibold mb-2">Build Units</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(UNIT_STATS).map((unitType) => (
              <button
                key={unitType}
                onClick={() => onBuildUnit(unitType)}
                className="btn-tactical text-xs py-1"
              >
                {unitType}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
