'use client';

import { useEffect, useState } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export default function Notifications({ notifications, onDismiss }: NotificationsProps) {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 max-w-sm">
      {notifications.map((notif) => {
        const bgColor = {
          success: 'bg-green-900 border-green-700',
          error: 'bg-red-900 border-red-700',
          warning: 'bg-yellow-900 border-yellow-700',
          info: 'bg-blue-900 border-blue-700',
        }[notif.type];

        const textColor = {
          success: 'text-green-200',
          error: 'text-red-200',
          warning: 'text-yellow-200',
          info: 'text-blue-200',
        }[notif.type];

        return (
          <div
            key={notif.id}
            className={`${bgColor} border rounded-lg p-4 flex justify-between items-start ${textColor}`}
          >
            <p className="flex-1">{notif.message}</p>
            <button
              onClick={() => onDismiss(notif.id)}
              className="ml-4 font-bold hover:opacity-75"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
