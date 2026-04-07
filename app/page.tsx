'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const playerId = localStorage.getItem('playerId');
    if (playerId) {
      router.push('/game');
    }
  }, [router]);

  const handleAuthSuccess = (playerId: string, username: string) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/game');
    }, 500);
  };

  if (showAuth) {
    return (
      <main className="w-full min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="w-full">
          <div className="max-w-md mx-auto mb-8 text-center">
            <h1 className="text-4xl font-bold text-amber-400 mb-2">ZERX</h1>
            <p className="text-slate-400">Military Strategy Game</p>
          </div>
          <AuthForm onAuthSuccess={handleAuthSuccess} isLoading={isLoading} />
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAuth(false)}
              className="text-blue-400 hover:text-blue-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-amber-400">ZERX</h1>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded transition"
          >
            Play Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold text-amber-400">Command Your Empire</h2>
          <p className="text-xl text-slate-300">
            Build bases, train armies, conduct research, and dominate the battlefield in an epic
            multiplayer military strategy game.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded text-lg transition"
          >
            Launch Game
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-16 border-t border-slate-700 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center text-amber-400">Core Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h4 className="text-blue-400 text-xl font-bold mb-3">Base Management</h4>
              <p className="text-slate-300">
                Build and manage multiple military bases across the map. Upgrade defenses and train
                armies.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h4 className="text-green-400 text-xl font-bold mb-3">Strategic Combat</h4>
              <p className="text-slate-300">
                Command diverse unit types and engage in tactical battles. Outmaneuver opponents
                to win.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h4 className="text-purple-400 text-xl font-bold mb-3">Research &amp; Tech</h4>
              <p className="text-slate-300">
                Unlock advanced technologies through research. Gain strategic advantages over your
                enemies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Systems Section */}
      <section className="px-6 py-16 border-t border-slate-700">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center text-amber-400">Game Systems</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h4 className="text-red-400 text-lg font-bold mb-2">Military Units</h4>
              <p className="text-slate-300 text-sm">
                Infantry, Vehicles, Air Forces, and Naval Units - each with unique stats and
                abilities.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h4 className="text-yellow-400 text-lg font-bold mb-2">Resources</h4>
              <p className="text-slate-300 text-sm">
                Manage Money, Steel, Oil, Electronics, and Manpower to build your war machine.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h4 className="text-green-400 text-lg font-bold mb-2">Alliances</h4>
              <p className="text-slate-300 text-sm">
                Form alliances with other players, coordinate attacks, and dominate the world.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h4 className="text-blue-400 text-lg font-bold mb-2">Leaderboards</h4>
              <p className="text-slate-300 text-sm">
                Compete globally and climb the ranks. Show your dominance to the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 border-t border-slate-700 bg-gradient-to-r from-amber-900/20 to-amber-800/20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h3 className="text-3xl font-bold text-amber-400">Ready to Command?</h3>
          <p className="text-slate-300">
            Join thousands of players in the ultimate military strategy experience.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded text-lg transition"
          >
            Start Playing Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/80 px-6 py-8 text-center text-slate-400">
        <p>&copy; 2026 Zerx. All rights reserved.</p>
      </footer>
    </main>
  );
}
