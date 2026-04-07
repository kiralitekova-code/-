'use client';

import { useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';
import type { Player, Base, Unit, Battle } from './types/game';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function usePlayerData(playerId: string | null) {
  return useSWR(playerId ? `/api/player?id=${playerId}` : null, fetcher);
}

export function useBases(playerId: string | null) {
  return useSWR(playerId ? `/api/bases?playerId=${playerId}` : null, fetcher);
}

export function useUnits(baseId: string | null) {
  return useSWR(baseId ? `/api/units?baseId=${baseId}` : null, fetcher);
}

export function useGameState() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);

  const playerData = usePlayerData(playerId);
  const basesData = useBases(playerId);
  const unitsData = useUnits(selectedBaseId);

  // Initialize player on mount from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('playerId');
    if (stored) {
      setPlayerId(stored);
    }
  }, []);

  const selectBase = useCallback((baseId: string) => {
    setSelectedBaseId(baseId);
  }, []);

  return {
    playerId,
    setPlayerId,
    selectedBaseId,
    selectBase,
    player: playerData.data as Player | undefined,
    bases: basesData.data as Base[] | undefined,
    units: unitsData.data as Unit[] | undefined,
    isLoading: playerData.isLoading || basesData.isLoading || unitsData.isLoading,
  };
}

export async function trainUnits(baseId: string, unitType: string, quantity: number) {
  const res = await fetch('/api/units', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseId, unitType, quantity }),
  });

  if (!res.ok) throw new Error('Failed to train units');
  return res.json();
}

export async function conductResearch(baseId: string, researchType: string) {
  const res = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseId, researchType }),
  });

  if (!res.ok) throw new Error('Failed to conduct research');
  return res.json();
}

export async function launchAttack(
  fromBaseId: string,
  toBaseId: string,
  unitIds: string[]
) {
  const res = await fetch('/api/attack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromBaseId, toBaseId, unitIds }),
  });

  if (!res.ok) throw new Error('Failed to launch attack');
  return res.json();
}
