'use client'

import { useState } from 'react'
import { ArrowLeftIcon, LinkIcon, ExternalLinkIcon, ImageIcon, PlayIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const testLinks = [
  {
    id: 1,
    url: 'https://github.com/matrix-org/matrix-js-sdk',
    title: 'matrix-org/matrix-js-sdk',
    description: 'Matrix Client-Server SDK for JavaScript',
    image: 'https://opengraph.githubassets.com/example',
    domain: 'github.com',
    type: 'website'
  },
  {
    id: 2,
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up - Rick Astley',
    description: 'Official video by Rick Astley',
    image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    domain: 'youtube.com',
    type: 'video'
  },
  {
    id: 3,
    url: 'https://matrix.org/docs/guides/introduction',
    title: 'Introduction to Matrix',
    description: 'Learn about the Matrix protocol and ecosystem',
    image: 'https://matrix.org/images/matrix-logo.svg',
    domain: 'matrix.org',
    type: 'article'
  }
]

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  domain?: string
  type?: string
  loading?: boolean
  error?: string
}

export default function LinkPreviewTestPage() {
  const router = useRouter()
  const [testUrl, setTestUrl] = useState('')
  const [previews, setPreviews] = useState<LinkPreview[]>(testLinks)
  const [isLoading, setIsLoading] = useState(false)

  const handleGeneratePreview = async () => {
    if (!testUrl.trim()) return

    setIsLoading(true)
    const newPreview: LinkPreview = {
      url: testUrl,
      loading: true
    }
    setPreviews(prev => [newPreview, ...prev])

    // Simulate API call delay
    setTimeout(() => {
      setPreviews(prev => prev.map((preview, index) => 
        index === 0 ? {
          ...preview,
          title: `Test Preview: ${new URL(testUrl).hostname}`,
          description: `Generated preview for ${testUrl}`,
          image: `https://via.placeholder.com/400x200/5865f2/ffffff?text=${new URL(testUrl).hostname}`,
          domain: new URL(testUrl).hostname,
          type: 'website',
          loading: false
        } : preview
      ))
      setIsLoading(false)
      setTestUrl('')
    }, 2000)
  }

  const renderPreview = (preview: LinkPreview, index: number) => {
    if (preview.loading) {
      return (
        <div key={index} className="bg-discord-light border border-gray-600 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-600 rounded flex-1"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-24 h-16 bg-gray-600 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-600 rounded"></div>
              <div className="h-3 bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      )
    }

    if (preview.error) {
      return (
        <div key={index} className="bg-discord-light border border-red-500 rounded-lg p-4">
          <div className="flex items-center gap-3 text-red-400">
            <LinkIcon className="w-5 h-5" />
            <span className="text-sm">Failed to load preview</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">{preview.url}</p>
          <p className="text-red-400 text-sm">{preview.error}</p>
        </div>
      )
    }

    return (
      <div key={index} className="bg-discord-light border border-gray-600 hover:border-gray-500 rounded-lg p-4 transition-colors">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">{preview.domain}</span>
          <ExternalLinkIcon className="w-4 h-4 text-gray-400" />
        </div>

        {/* Content */}
        <div className="flex gap-4">
          {preview.image && (
            <div className="relative w-24 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
              <img 
                src={preview.image} 
                alt={preview.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              {preview.type === 'video' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <PlayIcon className="w-6 h-6 text-white" />
                </div>
              )}
              {!preview.image && (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium mb-1 truncate">
              {preview.title || 'No title available'}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {preview.description || 'No description available'}
            </p>
            <p className="text-gray-500 text-xs mt-2 truncate">
              {preview.url}
            </p>
          </div>
        </div>

        {/* Type Badge */}
        {preview.type && (
          <div className="mt-3 flex">
            <span className={`px-2 py-1 text-xs rounded-full ${
              preview.type === 'video' ? 'bg-red-500/20 text-red-300' :
              preview.type === 'article' ? 'bg-blue-500/20 text-blue-300' :
              'bg-gray-500/20 text-gray-300'
            }`}>
              {preview.type}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-discord-dark">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <LinkIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Link Preview Test</h1>
              <p className="text-gray-400">
                Test how links will appear in chat messages
              </p>
            </div>
          </div>
        </div>

        {/* Test Input */}
        <div className="bg-discord-light rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Test a URL</h2>
          <div className="flex gap-3">
            <input
              type="url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter a URL to generate preview..."
              className="flex-1 bg-discord-darker border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:outline-none"
            />
            <button
              onClick={handleGeneratePreview}
              disabled={!testUrl.trim() || isLoading}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Preview'}
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Enter any valid URL to see how it would appear as a link preview
          </p>
        </div>

        {/* Preview Examples */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Preview Examples</h2>
          <div className="space-y-4">
            {previews.map((preview, index) => renderPreview(preview, index))}
          </div>
        </div>

        {/* Information */}
        <div className="bg-discord-light rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">About Link Previews</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Link previews enhance chat messages by showing rich information about shared URLs. 
              HAOS automatically generates previews for supported websites and media.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-white mb-2">Supported Content</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Web pages with Open Graph meta tags</li>
                  <li>• YouTube videos and playlists</li>
                  <li>• GitHub repositories and issues</li>
                  <li>• Twitter/X posts</li>
                  <li>• Images and media files</li>
                  <li>• News articles and blogs</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-white mb-2">Privacy & Security</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Previews are generated server-side</li>
                  <li>• No direct access to external URLs</li>
                  <li>• Cached to reduce external requests</li>
                  <li>• Can be disabled in settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}