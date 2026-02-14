'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { SearchIcon, FilterIcon, XIcon, ServerIcon, UsersIcon } from 'lucide-react'
import { ServerList } from './server-list'
import { ServerSearch } from './server-search'
import { CategoryFilter } from './category-filter'
import { ServerPreview } from './server-preview'
import { useMatrixClient } from '@/hooks/use-matrix-client'
import type { PublicRoom } from './types'

interface ServerDiscoveryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ServerDiscoveryModal({ open, onOpenChange }: ServerDiscoveryModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedServer, setSelectedServer] = useState<PublicRoom | null>(null)
  const [rooms, setRooms] = useState<PublicRoom[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { client: matrixClient, getPublicRooms } = useMatrixClient()

  // Load public rooms on modal open
  useEffect(() => {
    if (open && matrixClient) {
      loadPublicRooms()
    }
  }, [open, matrixClient])

  const loadPublicRooms = async () => {
    if (!matrixClient) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Get public rooms from the room directory
      const response = await getPublicRooms({
        limit: 50,
        filter: {
          generic_search_term: searchQuery || undefined,
        },
      })
      
      setRooms((response.chunk || []) as PublicRoom[])
    } catch (err) {
      console.error('Failed to load public rooms:', err)
      setError('Failed to load servers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter rooms based on search and category
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchQuery || 
      room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.canonical_alias?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
      (room.topic?.toLowerCase().includes(selectedCategory.toLowerCase()) ?? false)
    
    return matchesSearch && matchesCategory
  })

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-6xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2">
          <div className="bg-discord-dark border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-discord-darker border-b border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <ServerIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-semibold text-white">
                    Discover Matrix Servers
                  </Dialog.Title>
                  <Dialog.Description className="text-gray-400 text-sm">
                    Browse and join public Matrix spaces and rooms
                  </Dialog.Description>
                </div>
              </div>
              
              <Dialog.Close className="text-gray-400 hover:text-white transition-colors">
                <XIcon className="w-6 h-6" />
              </Dialog.Close>
            </div>

            <div className="flex h-[calc(90vh-120px)]">
              {/* Left Panel - Search and Server List */}
              <div className="flex-1 flex flex-col border-r border-gray-700">
                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-700 space-y-4">
                  <ServerSearch
                    query={searchQuery}
                    onQueryChange={setSearchQuery}
                    onSearch={loadPublicRooms}
                    loading={loading}
                  />
                  
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    rooms={rooms}
                  />
                </div>

                {/* Results */}
                <div className="flex-1 overflow-hidden">
                  {error ? (
                    <div className="p-6 text-center">
                      <div className="text-discord-red mb-2">{error}</div>
                      <button 
                        onClick={loadPublicRooms}
                        className="discord-button-secondary"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <ServerList
                      rooms={filteredRooms}
                      loading={loading}
                      selectedServer={selectedServer}
                      onServerSelect={setSelectedServer}
                    />
                  )}
                </div>
              </div>

              {/* Right Panel - Server Preview */}
              <div className="w-96">
                <ServerPreview
                  server={selectedServer}
                  onJoin={(server) => {
                    // TODO: Implement join functionality
                    console.log('Joining server:', server)
                    onOpenChange(false)
                  }}
                />
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}