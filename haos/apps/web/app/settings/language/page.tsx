'use client'

import { useState } from 'react'
import { ArrowLeftIcon, GlobeIcon, CheckIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-tw', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
]

export default function LanguageSettings() {
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSaveLanguage = () => {
    // In a real app, this would save the language preference
    console.log('Language saved:', selectedLanguage)
    // Apply language change
    document.documentElement.lang = selectedLanguage
    router.back()
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
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <GlobeIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Language</h1>
              <p className="text-gray-400">
                Choose your preferred language for HAOS
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Language */}
          <div className="bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Language</h2>
            <div className="flex items-center gap-3 p-3 bg-discord-darker rounded-lg">
              <span className="text-2xl">{languages.find(l => l.code === selectedLanguage)?.flag}</span>
              <div>
                <p className="text-white font-medium">
                  {languages.find(l => l.code === selectedLanguage)?.name}
                </p>
                <p className="text-gray-400 text-sm">
                  {languages.find(l => l.code === selectedLanguage)?.nativeName}
                </p>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Available Languages</h2>
            
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full max-w-md bg-discord-darker border border-gray-600 text-white rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Language List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => setSelectedLanguage(language.code)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    selectedLanguage === language.code
                      ? 'bg-primary-500 text-white'
                      : 'bg-discord-darker hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{language.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{language.name}</p>
                    <p className={`text-sm truncate ${
                      selectedLanguage === language.code ? 'text-gray-200' : 'text-gray-400'
                    }`}>
                      {language.nativeName}
                    </p>
                  </div>
                  {selectedLanguage === language.code && (
                    <CheckIcon className="w-5 h-5 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Language Settings */}
          <div className="bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Language Options</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Auto-translate messages</label>
                  <p className="text-gray-400 text-sm">Automatically translate messages from other languages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Show original text</label>
                  <p className="text-gray-400 text-sm">Display original text alongside translations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Changes */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveLanguage}
              className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors"
            >
              Save Language
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Translation Notice */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            <strong>Note:</strong> HAOS is currently available in English with partial translations for other languages. 
            Community translations are welcome and can be contributed through our GitHub repository.
          </p>
        </div>
      </div>
    </div>
  )
}