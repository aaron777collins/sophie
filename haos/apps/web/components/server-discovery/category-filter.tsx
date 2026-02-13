'use client'

import * as Select from '@radix-ui/react-select'
import { ChevronDownIcon, FilterIcon, CheckIcon } from 'lucide-react'
import type { PublicRoom, ServerCategory } from './types'

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  rooms: PublicRoom[]
}

const SERVER_CATEGORIES: ServerCategory[] = [
  {
    id: 'all',
    name: 'All Categories',
    description: 'Show all available servers',
    keywords: []
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Gaming communities and discussions',
    keywords: ['game', 'gaming', 'discord', 'minecraft', 'wow', 'league', 'valorant', 'steam']
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Programming, development, and tech discussions',
    keywords: ['tech', 'programming', 'development', 'coding', 'software', 'linux', 'opensource', 'python', 'javascript', 'rust', 'go']
  },
  {
    id: 'community',
    name: 'Community',
    description: 'General communities and social spaces',
    keywords: ['community', 'general', 'chat', 'social', 'friends', 'meetup', 'local']
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Learning, study groups, and educational content',
    keywords: ['education', 'learning', 'study', 'university', 'college', 'school', 'course', 'tutorial']
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Art, music, writing, and creative pursuits',
    keywords: ['art', 'music', 'creative', 'writing', 'design', 'photography', 'drawing', 'digital art']
  },
  {
    id: 'science',
    name: 'Science & Research',
    description: 'Scientific discussions and research',
    keywords: ['science', 'research', 'physics', 'chemistry', 'biology', 'mathematics', 'academic']
  },
  {
    id: 'hobbies',
    name: 'Hobbies & Interests',
    description: 'Specific hobbies and interest groups',
    keywords: ['hobby', 'cooking', 'gardening', 'fitness', 'books', 'movies', 'anime', 'manga', 'sports']
  }
]

export function CategoryFilter({ selectedCategory, onCategoryChange, rooms }: CategoryFilterProps) {
  // Get room counts for each category
  const getCategoryCount = (category: ServerCategory) => {
    if (category.id === 'all') return rooms.length
    
    return rooms.filter(room => {
      const content = [
        room.name || '',
        room.topic || '',
        room.canonical_alias || ''
      ].join(' ').toLowerCase()
      
      return category.keywords.some(keyword => content.includes(keyword))
    }).length
  }

  const selectedCategoryData = SERVER_CATEGORIES.find(cat => cat.id === selectedCategory)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
        <FilterIcon className="w-4 h-4" />
        <span>Filter by Category</span>
      </label>
      
      <Select.Root value={selectedCategory} onValueChange={onCategoryChange}>
        <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-discord-darker border border-gray-600 text-white rounded-lg hover:border-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none">
          <div className="flex items-center space-x-2">
            <span className="text-sm">
              {selectedCategoryData?.name || 'All Categories'}
            </span>
            {selectedCategory !== 'all' && (
              <span className="text-xs text-gray-400">
                ({getCategoryCount(selectedCategoryData!)} servers)
              </span>
            )}
          </div>
          <Select.Icon>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="bg-discord-darker border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
            <Select.Viewport className="p-1">
              {SERVER_CATEGORIES.map((category) => {
                const count = getCategoryCount(category)
                
                return (
                  <Select.Item
                    key={category.id}
                    value={category.id}
                    className="relative flex items-center px-3 py-2 text-sm text-white hover:bg-discord-light rounded cursor-pointer focus:bg-discord-light focus:outline-none"
                  >
                    <Select.ItemText>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.description && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {category.description}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 ml-4">
                          {count} {count === 1 ? 'server' : 'servers'}
                        </div>
                      </div>
                    </Select.ItemText>
                    
                    <Select.ItemIndicator className="absolute left-1 flex items-center">
                      <CheckIcon className="w-3 h-3" />
                    </Select.ItemIndicator>
                  </Select.Item>
                )
              })}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}