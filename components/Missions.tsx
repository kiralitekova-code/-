'use client';

import useSWR from 'swr';

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress?: number;
  completed?: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MissionsProps {
  playerId: string;
}

export default function Missions({ playerId }: MissionsProps) {
  const { data, isLoading } = useSWR(
    `/api/missions?playerId=${playerId}`,
    fetcher
  );

  const missions = data?.missions || [];

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-blue-400 mb-4">Missions</h3>

      {isLoading ? (
        <p className="text-slate-400 text-sm">Loading missions...</p>
      ) : missions.length === 0 ? (
        <p className="text-slate-400 text-sm">No missions available</p>
      ) : (
        <div className="space-y-3">
          {missions.map((mission: Mission) => (
            <div
              key={mission.id}
              className={`p-3 rounded border ${
                mission.completed
                  ? 'bg-green-900/20 border-green-700'
                  : 'bg-slate-700 border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">{mission.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{mission.description}</p>
                </div>
                <span className="text-yellow-400 font-bold ml-2">+{mission.reward}</span>
              </div>

              {!mission.completed && mission.progress !== undefined && (
                <div className="bg-slate-900 rounded h-2">
                  <div
                    className="bg-blue-500 h-full rounded transition-all"
                    style={{ width: `${mission.progress}%` }}
                  ></div>
                </div>
              )}

              {mission.completed && (
                <p className="text-xs text-green-400 font-semibold">Completed</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
