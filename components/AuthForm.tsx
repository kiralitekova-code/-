'use client';

import { useState } from 'react';

interface AuthFormProps {
  onAuthSuccess: (playerId: string, username: string) => void;
  isLoading: boolean;
}

export default function AuthForm({ onAuthSuccess, isLoading }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          username,
          email: email || username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      // Store player ID in localStorage and redirect
      localStorage.setItem('playerId', data.player.id);
      onAuthSuccess(data.player.id, data.player.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-amber-400">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              required
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {error && <div className="text-red-400 text-sm border border-red-700 bg-red-900/20 p-3 rounded">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white font-bold py-2 rounded transition"
          >
            {isLoading ? 'Loading...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {mode === 'login' ? 'Create a new account' : 'Already have an account?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
