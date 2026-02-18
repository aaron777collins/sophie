export default function ChannelsPage() {
  return (
    <div className="min-h-screen bg-discord-dark flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-4">Channels</h1>
        <p className="text-gray-400 mb-6">
          Browse and join different channels in your servers
        </p>
        <a
          href="/"
          className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}