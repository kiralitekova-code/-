'use client';

import { useState } from 'react';
import useSWR from 'swr';

interface AlliancePanelProps {
  playerId: string;
  onCreateAlliance: (name: string) => Promise<void>;
  onAcceptInvite: (allianceId: string) => Promise<void>;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AlliancePanel({
  playerId,
  onCreateAlliance,
  onAcceptInvite,
}: AlliancePanelProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [allianceName, setAllianceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: myAlliances } = useSWR(
    `/api/alliances?playerId=${playerId}&action=my-alliances`,
    fetcher
  );

  const { data: invites } = useSWR(
    `/api/alliances?playerId=${playerId}&action=invites`,
    fetcher
  );

  const handleCreateAlliance = async () => {
    if (!allianceName.trim()) return;

    setIsLoading(true);
    try {
      await onCreateAlliance(allianceName);
      setAllianceName('');
      setShowCreateForm(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-green-400 mb-4">Alliances</h3>

      {/* My Alliances */}
      {myAlliances?.alliances && myAlliances.alliances.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-slate-300 font-semibold mb-2">My Alliances</p>
          {myAlliances.alliances.map((alliance: any) => (
            <button
              key={alliance.id}
              className="w-full text-left p-2 bg-slate-700 rounded mb-2 hover:bg-slate-600 border border-slate-600"
            >
              <p className="text-green-300 font-semibold">{alliance.name}</p>
              <p className="text-xs text-slate-400">Alliance ID: {alliance.id.substring(0, 8)}</p>
            </button>
          ))}
        </div>
      )}

      {/* Pending Invites */}
      {invites?.invites && invites.invites.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-slate-300 font-semibold mb-2">Pending Invites</p>
          {invites.invites.map((invite: any) => (
            <div
              key={invite.id}
              className="flex justify-between items-center bg-slate-700 rounded p-2 mb-2 border border-yellow-600"
            >
              <p className="text-sm text-yellow-300">Alliance Invite</p>
              <button
                onClick={() => onAcceptInvite(invite.alliance_id)}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Alliance */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded"
        >
          Create Alliance
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Alliance name..."
            value={allianceName}
            onChange={(e) => setAllianceName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateAlliance}
              disabled={isLoading || !allianceName.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold py-2 rounded"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
