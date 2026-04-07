'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GameGrid } from '@/components/GameGrid';
import { ResourcePanel } from '@/components/ResourcePanel';
import { BasePanel } from '@/components/BasePanel';
import { Player, Base, Unit } from '@/lib/types/game';

export default function GamePage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load player data on mount
  useEffect(() => {
    const loadPlayer = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/player');
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/';
            return;
          }
          throw new Error('Failed to load player data');
        }
        const data = await response.json();
        setPlayer(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, []);

  const handleCellClick = useCallback((x: number, y: number) => {
    setSelectedCell({ x, y });
    if (player) {
      const base = player.bases.find((b) => b.x === x && b.y === y);
      setSelectedBase(base || null);
    }
  }, [player]);

  const handleBuildBase = useCallback(
    async (x: number, y: number) => {
      if (!player) return;

      try {
        const response = await fetch('/api/bases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Base ${player.bases.length + 1}`,
            x,
            y,
          }),
        });

        if (!response.ok) throw new Error('Failed to create base');

        // Refresh player data
        const playerResponse = await fetch('/api/player');
        const updatedPlayer = await playerResponse.json();
        setPlayer(updatedPlayer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [player]
  );

  const handleBuildUnit = useCallback(
    async (unitType: string) => {
      if (!selectedBase) return;

      try {
        const response = await fetch('/api/units', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseId: selectedBase.id,
            unitType,
            quantity: 1,
          }),
        });

        if (!response.ok) throw new Error('Failed to build unit');

        // Refresh player data
        const playerResponse = await fetch('/api/player');
        const updatedPlayer = await playerResponse.json();
        setPlayer(updatedPlayer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [selectedBase]
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-military-dark">
        <div className="text-tactical-green text-2xl font-bold">Loading Zerx...</div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-military-dark">
        <div className="text-tactical-red text-xl font-bold">{error || 'Failed to load player'}</div>
      </div>
    );
  }

  return (
    <main className="w-full h-screen flex flex-col bg-military-dark">
      {/* Header */}
      <header className="border-b border-tactical-blue/30 bg-military-light/50 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-tactical-green">ZERX</h1>
          <div className="flex items-center gap-6">
            <div className="text-tactical-yellow">
              <span className="font-semibold">Level {player.level}</span>
              <span className="text-gray-400"> • Bases: {player.bases.length}</span>
            </div>
            <button className="btn-tactical">Settings</button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Game Grid */}
        <GameGrid bases={player.bases} onCellClick={handleCellClick} selectedCell={selectedCell} />

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-tactical-blue/30 bg-military-light/50 p-4 overflow-y-auto">
          <div className="space-y-4">
            <ResourcePanel resources={player.resources} />

            {selectedBase ? (
              <BasePanel base={selectedBase} units={player.units} onBuildUnit={handleBuildUnit} />
            ) : selectedCell ? (
              <div className="panel w-full">
                <div className="panel-header">Empty Sector</div>
                <p className="text-sm text-gray-400 mb-4">
                  ({selectedCell.x}, {selectedCell.y})
                </p>
                {player.bases.length < 5 && (
                  <button
                    onClick={() => handleBuildBase(selectedCell.x, selectedCell.y)}
                    className="btn-tactical success w-full"
                  >
                    Build Base
                  </button>
                )}
              </div>
            ) : (
              <div className="panel w-full">
                <div className="panel-header">Select a Cell</div>
                <p className="text-sm text-gray-400">Click on the map to select a location.</p>
              </div>
            )}

            {player.bases.length > 0 && (
              <div className="panel w-full">
                <div className="panel-header">Bases</div>
                <div className="space-y-2">
                  {player.bases.map((base) => (
                    <button
                      key={base.id}
                      onClick={() => handleCellClick(base.x, base.y)}
                      className="w-full text-left px-3 py-2 bg-military-dark/50 border border-tactical-blue/20 rounded hover:border-tactical-blue/60 transition-all"
                    >
                      <div className="font-semibold text-tactical-green">{base.name}</div>
                      <div className="text-xs text-gray-400">Level {base.level}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
