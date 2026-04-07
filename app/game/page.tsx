'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GameGrid from '@/components/GameGrid';
import ResourcePanel from '@/components/ResourcePanel';
import BasePanel from '@/components/BasePanel';
import UnitTraining from '@/components/UnitTraining';
import ResearchLab from '@/components/ResearchLab';
import UnitsDisplay from '@/components/UnitsDisplay';
import AlliancePanel from '@/components/AlliancePanel';
import Missions from '@/components/Missions';
import GameChat from '@/components/GameChat';
import Leaderboard from '@/components/Leaderboard';
import PlayerStats from '@/components/PlayerStats';
import type { Player, Base, Unit } from '@/lib/types/game';

export default function GamePage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'military' | 'research' | 'alliance' | 'missions'>('overview');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

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

  const handleTrainUnits = useCallback(
    async (unitType: string, quantity: number) => {
      if (!selectedBase) return;

      try {
        const response = await fetch('/api/units', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseId: selectedBase.id,
            unitType,
            quantity,
          }),
        });

        if (!response.ok) throw new Error('Failed to train units');

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

  const handleResearch = useCallback(
    async (researchType: string) => {
      if (!selectedBase || !player) return;

      try {
        const response = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseId: selectedBase.id,
            playerId: player.id,
            researchType,
          }),
        });

        if (!response.ok) throw new Error('Failed to conduct research');

        // Refresh player data
        const playerResponse = await fetch('/api/player');
        const updatedPlayer = await playerResponse.json();
        setPlayer(updatedPlayer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [selectedBase, player]
  );

  const handleCreateAlliance = useCallback(
    async (name: string) => {
      if (!player) return;

      try {
        const response = await fetch('/api/alliances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            playerId: player.id,
            allianceName: name,
          }),
        });

        if (!response.ok) throw new Error('Failed to create alliance');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [player]
  );

  const handleAcceptInvite = useCallback(
    async (allianceId: string) => {
      if (!player) return;

      try {
        const response = await fetch('/api/alliances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'accept',
            allianceId,
            playerId: player.id,
          }),
        });

        if (!response.ok) throw new Error('Failed to accept invite');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [player]
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <div className="text-blue-400 text-2xl font-bold">Loading Zerx...</div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <div className="text-red-400 text-xl font-bold">{error || 'Failed to load player'}</div>
      </div>
    );
  }

  return (
    <main className="w-full h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-amber-400">ZERX</h1>
          <div className="flex items-center gap-6">
            <div className="text-amber-400">
              <span className="font-semibold">Level {player.level}</span>
              <span className="text-slate-400"> • Bases: {player.bases.length} • Exp: {player.experience}</span>
            </div>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {showLeaderboard ? 'Hide' : 'Leaderboard'}
            </button>
            <button
              onClick={() => localStorage.removeItem('playerId') || window.location.reload()}
              className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-amber-400">Global Leaderboard</h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-slate-400 hover:text-slate-200 font-bold text-2xl"
              >
                ×
              </button>
            </div>
            <Leaderboard />
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Game Grid */}
        <GameGrid bases={player.bases} onCellClick={handleCellClick} selectedCell={selectedCell} />

        {/* Right Sidebar */}
        <aside className="w-96 border-l border-slate-700 bg-slate-900 p-4 overflow-y-auto">
          <div className="space-y-4">
            <ResourcePanel resources={player.resources} />

            {/* Player Stats */}
            <PlayerStats player={player} />

            {/* Missions */}
            <Missions playerId={player.id} />

            {/* Tab Navigation */}
            {selectedBase && (
              <div className="flex gap-1 bg-slate-800 p-2 rounded border border-slate-700 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('military')}
                  className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition whitespace-nowrap ${
                    activeTab === 'military'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Military
                </button>
                <button
                  onClick={() => setActiveTab('research')}
                  className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition whitespace-nowrap ${
                    activeTab === 'research'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Research
                </button>
              </div>
            )}

            {selectedBase ? (
              <>
                {activeTab === 'overview' && (
                  <BasePanel base={selectedBase} units={player.units} onBuildUnit={handleBuildUnit} />
                )}

                {activeTab === 'military' && (
                  <>
                    <UnitTraining
                      baseId={selectedBase.id}
                      resources={player.resources}
                      onTrain={handleTrainUnits}
                      isLoading={false}
                    />
                    <UnitsDisplay
                      units={player.units.filter((u) => u.baseId === selectedBase.id)}
                      onSelectUnit={(unit) => setSelectedUnitId(unit.id)}
                      selectedUnitId={selectedUnitId}
                    />
                  </>
                )}

                {activeTab === 'research' && (
                  <ResearchLab
                    baseId={selectedBase.id}
                    playerId={player.id}
                    resources={player.resources}
                    onResearch={handleResearch}
                    isLoading={false}
                  />
                )}
              </>
            ) : selectedCell ? (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-bold text-blue-400 mb-4">Empty Sector</h3>
                <p className="text-sm text-slate-400 mb-4">
                  ({selectedCell.x}, {selectedCell.y})
                </p>
                {player.bases.length < 5 && (
                  <button
                    onClick={() => handleBuildBase(selectedCell.x, selectedCell.y)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
                  >
                    Build Base
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-bold text-blue-400 mb-4">Select a Location</h3>
                <p className="text-sm text-slate-400">Click on the map to select a sector.</p>
              </div>
            )}

            {player.bases.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-bold text-amber-400 mb-4">Your Bases</h3>
                <div className="space-y-2">
                  {player.bases.map((base) => (
                    <button
                      key={base.id}
                      onClick={() => handleCellClick(base.x, base.y)}
                      className={`w-full text-left px-3 py-2 rounded border transition ${
                        selectedBase?.id === base.id
                          ? 'bg-amber-900 border-amber-500'
                          : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-amber-300">{base.name}</div>
                      <div className="text-xs text-slate-400">Level {base.level} • HP: {base.health}/{base.maxHealth}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AlliancePanel
              playerId={player.id}
              onCreateAlliance={handleCreateAlliance}
              onAcceptInvite={handleAcceptInvite}
            />
          </div>
        </aside>
      </div>

      {/* Chat Widget */}
      <GameChat username={player.username} channel="global" />
    </main>
  );
}
