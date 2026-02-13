'use client'

import { useState } from 'react'
import { SearchIcon } from 'lucide-react'

interface ServerSearchProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  loading: boolean
}

export function ServerSearch({ query, onQueryChange, onSearch, loading }: ServerSearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search servers and spaces..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-3 bg-discord-darker border border-gray-600 text-white rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none placeholder-gray-400"
          disabled={loading}
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="discord-button flex-1 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <SearchIcon className="w-4 h-4" />
              <span>Search</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}