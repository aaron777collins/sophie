export default function HomePage() {
  return (
    <div className="min-h-screen bg-discord-dark flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-4">Welcome to HAOS v2</h2>
        <p className="text-gray-400 mb-6">
          A Discord-style Matrix client with voice chat powered by LiveKit
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/servers/discover"
            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors text-center"
          >
            Discover Servers
          </a>
          <a
            href="/docs"
            className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors text-center"
          >
            Documentation
          </a>
        </div>
      </div>
    </div>
  )
}