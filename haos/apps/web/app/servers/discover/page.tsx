'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { SearchIcon, FilterIcon, ArrowLeftIcon, ServerIcon, UsersIcon, ChevronDownIcon } from 'lucide-react'
import { ServerList } from '@/components/server-discovery/server-list'
import { ServerSearch } from '@/components/server-discovery/server-search'
import { CategoryFilter } from '@/components/server-discovery/category-filter'
import { ServerPreview } from '@/components/server-discovery/server-preview'
import { useMatrixClient } from '@/hooks/use-matrix-client'
import type { PublicRoom } from '@/components/server-discovery/types'

type SortOption = 'members' | 'name' | 'recent'
type SortDirection = 'asc' | 'desc'

export default function ServerDiscoveryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedServer, setSelectedServer] = useState<PublicRoom | null>(null)
  const [rooms, setRooms] = useState<PublicRoom[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortOption>('members')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [totalResults, setTotalResults] = useState(0)
  
  const { client: matrixClient, getPublicRooms } = useMatrixClient()
  
  const itemsPerPage = 20

  // Load public rooms on page load and when search changes
  useEffect(() => {
    if (matrixClient) {
      loadPublicRooms()
    }
  }, [matrixClient, searchQuery, currentPage])

  const loadPublicRooms = async () => {
    if (!matrixClient) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Calculate offset for pagination
      const offset = (currentPage - 1) * itemsPerPage
      
      // Get public rooms from the room directory
      const response = await getPublicRooms({
        limit: itemsPerPage,
        since: offset > 0 ? `offset_${offset}` : undefined,
        filter: {
          generic_search_term: searchQuery || undefined,
        },
      })
      
      const roomList = (response.chunk || []) as PublicRoom[]
      setRooms(roomList)
      setTotalResults(response.total_room_count_estimate || roomList.length)
    } catch (err) {
      console.error('Failed to load public rooms:', err)
      setError('Failed to load servers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort rooms
  const processedRooms = useMemo(() => {
    let filtered = rooms.filter(room => {
      const matchesSearch = !searchQuery || 
        room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.canonical_alias?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || 
        (room.topic?.toLowerCase().includes(selectedCategory.toLowerCase()) ?? false)
      
      return matchesSearch && matchesCategory
    })

    // Sort results
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number
      
      switch (sortBy) {
        case 'members':
          aValue = a.num_joined_members
          bValue = b.num_joined_members
          break
        case 'name':
          aValue = (a.name || a.canonical_alias || a.room_id).toLowerCase()
          bValue = (b.name || b.canonical_alias || b.room_id).toLowerCase()
          break
        case 'recent':
          // For now, use member count as proxy for activity
          aValue = a.num_joined_members
          bValue = b.num_joined_members
          break
        default:
          return 0
      }
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue)
      } else {
        return sortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      }
    })

    return filtered
  }, [rooms, searchQuery, selectedCategory, sortBy, sortDirection])

  const handleJoinServer = async (server: PublicRoom) => {
    try {
      // TODO: Implement actual join functionality
      console.log('Joining server:', server)
      // After successful join, could redirect to the server
      // router.push(`/servers/${server.room_id}`)
    } catch (error) {
      console.error('Failed to join server:', error)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadPublicRooms()
  }

  const handleSortChange = (newSortBy: SortOption) => {
    if (newSortBy === sortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortDirection('desc')
    }
  }

  const totalPages = Math.ceil(totalResults / itemsPerPage)

  return (
    <div className="min-h-screen bg-discord-dark">
      {/* Header */}
      <header className="bg-discord-darker border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <ServerIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Discover Matrix Servers</h1>
                <p className="text-gray-400 text-sm">
                  Browse and join public Matrix spaces and rooms
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Search and Server List */}
          <div className="lg:col-span-2 flex flex-col bg-discord-light rounded-lg overflow-hidden">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-700 space-y-4">
              <ServerSearch
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onSearch={handleSearch}
                loading={loading}
              />
              
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1">
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    rooms={rooms}
                  />
                </div>
                
                {/* Sort Controls */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Sort by:</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleSortChange('members')}
                      className={`px-3 py-1.5 text-sm rounded transition-colors ${
                        sortBy === 'members' 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Members {sortBy === 'members' && (sortDirection === 'desc' ? '↓' : '↑')}
                    </button>
                    <button
                      onClick={() => handleSortChange('name')}
                      className={`px-3 py-1.5 text-sm rounded transition-colors ${
                        sortBy === 'name' 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Name {sortBy === 'name' && (sortDirection === 'desc' ? '↓' : '↑')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>
                  {loading ? 'Loading...' : `${processedRooms.length} servers found`}
                  {totalResults > rooms.length && ` (${totalResults} total)`}
                </span>
                
                {/* Pagination Info */}
                {totalPages > 1 && (
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                )}
              </div>
            </div>

            {/* Server List */}
            <div className="flex-1 overflow-hidden">
              {error ? (
                <div className="p-6 text-center">
                  <div className="text-discord-red mb-2">{error}</div>
                  <button 
                    onClick={handleSearch}
                    className="discord-button-secondary"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <ServerList
                  rooms={processedRooms}
                  loading={loading}
                  selectedServer={selectedServer}
                  onServerSelect={setSelectedServer}
                />
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                      return page <= totalPages ? (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded transition-colors ${
                            page === currentPage
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ) : null
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Server Preview */}
          <div className="bg-discord-light rounded-lg overflow-hidden">
            <ServerPreview
              server={selectedServer}
              onJoin={handleJoinServer}
            />
          </div>
        </div>
      </div>
    </div>
  )
}