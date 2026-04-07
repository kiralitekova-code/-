import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-military-dark flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-tactical-green mb-4 drop-shadow-lg">ZERX</h1>
          <p className="text-2xl text-tactical-blue mb-2">Military-Economic Strategy Game</p>
          <p className="text-gray-400 text-lg">Command your forces. Build your empire. Dominate the battlefield.</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="panel">
            <div className="text-tactical-green font-bold text-lg mb-2">⚔️ Real-Time Combat</div>
            <p className="text-gray-400 text-sm">Engage in strategic battles with dynamic unit tactics and terrain advantages.</p>
          </div>
          <div className="panel">
            <div className="text-tactical-green font-bold text-lg mb-2">💰 Economic System</div>
            <p className="text-gray-400 text-sm">Manage resources, research technologies, and upgrade your military infrastructure.</p>
          </div>
          <div className="panel">
            <div className="text-tactical-green font-bold text-lg mb-2">🤝 Alliances</div>
            <p className="text-gray-400 text-sm">Form alliances with other players and coordinate massive campaigns.</p>
          </div>
          <div className="panel">
            <div className="text-tactical-green font-bold text-lg mb-2">🎮 Multiplayer</div>
            <p className="text-gray-400 text-sm">Play with thousands of players in a persistent world of endless conflict.</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/game"
            className="btn-tactical success text-lg py-3 px-8 text-center"
          >
            Enter Game
          </Link>
          <button className="btn-tactical text-lg py-3 px-8">
            Learn More
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Zerx © 2026 • Multiplayer Strategy Gaming</p>
          <p className="mt-2">Browser-based • No installation required</p>
        </div>
      </div>
    </main>
  );
}
