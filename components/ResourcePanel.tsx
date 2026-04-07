'use client';

import React from 'react';
import { Resources } from '@/lib/types/game';

interface ResourcePanelProps {
  resources: Resources;
}

const RESOURCE_ICONS: Record<string, string> = {
  money: '$',
  steel: '⬜',
  oil: '🛢️',
  electronics: '🔌',
  manpower: '👥',
};

export default function ResourcePanel({ resources }: ResourcePanelProps) {
  return (
    <div className="panel w-full">
      <div className="panel-header">Resources</div>
      <div className="space-y-2">
        {Object.entries(resources).map(([key, value]) => (
          <div key={key} className="panel-item">
            <span className="panel-label capitalize">
              {RESOURCE_ICONS[key] || '●'} {key}
            </span>
            <span className="panel-value">{Math.floor(value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
