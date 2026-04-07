'use client';

import React, { useState } from 'react';
import { GAME_CONFIG } from '@/lib/constants';
import { Base } from '@/lib/types/game';

interface GameGridProps {
  bases: Base[];
  onCellClick: (x: number, y: number) => void;
  selectedCell?: { x: number; y: number };
}

export function GameGrid({ bases, onCellClick, selectedCell }: GameGridProps) {
  const baseMap = new Map(bases.map((b) => [`${b.x},${b.y}`, b]));

  const cellSize = Math.max(30, Math.min(60, window.innerWidth / (GAME_CONFIG.GRID_SIZE + 2)));

  return (
    <div className="flex-1 overflow-auto p-4">
      <div
        className="inline-grid gap-0 border border-tactical-blue/40 bg-military-dark/50 p-2"
        style={{
          gridTemplateColumns: `repeat(${GAME_CONFIG.GRID_SIZE}, ${cellSize}px)`,
          gridAutoRows: `${cellSize}px`,
        }}
      >
        {Array.from({ length: GAME_CONFIG.GRID_SIZE * GAME_CONFIG.GRID_SIZE }).map((_, idx) => {
          const x = idx % GAME_CONFIG.GRID_SIZE;
          const y = Math.floor(idx / GAME_CONFIG.GRID_SIZE);
          const base = baseMap.get(`${x},${y}`);
          const isSelected = selectedCell?.x === x && selectedCell?.y === y;

          return (
            <div
              key={`${x}-${y}`}
              onClick={() => onCellClick(x, y)}
              className={`
                grid-cell 
                flex items-center justify-center text-xs font-bold
                ${base ? 'has-base bg-tactical-green/20' : ''}
                ${isSelected ? 'selected bg-tactical-blue/40' : ''}
                hover:shadow-lg transition-all
              `}
              title={base ? `${base.name} (Lvl ${base.level})` : `(${x}, ${y})`}
            >
              {base && <span className="text-tactical-green drop-shadow">●</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
