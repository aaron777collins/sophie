import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Basic emoji data - in a real implementation, this could be expanded or loaded from emoji-mart
const BASIC_EMOJIS = {
  smile: '😄',
  laugh: '😂', 
  heart: '❤️',
  thumbs_up: '👍',
  thumbs_down: '👎',
  fire: '🔥',
  star: '⭐',
  party: '🎉',
  rocket: '🚀',
  coffee: '☕',
  pizza: '🍕',
  cat: '🐱',
  dog: '🐶',
  wave: '👋',
  clap: '👏'
};

interface EmojiAutocompleteProps {
  searchTerm: string;
  onEmojiSelect: (emoji: string) => void;
  onClose?: () => void;
  customEmojis?: { name: string; url: string }[];
}

export const EmojiAutocomplete: React.FC<EmojiAutocompleteProps> = ({ 
  searchTerm, 
  onEmojiSelect, 
  onClose,
  customEmojis = [] 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredEmojis = useMemo(() => {
    const standardEmojis = Object.entries(BASIC_EMOJIS)
      .filter(([name]) => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10);

    const customEmojiMatches = customEmojis
      .filter(emoji => 
        emoji.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);

    return [...customEmojiMatches, ...standardEmojis];
  }, [searchTerm, customEmojis]);

  // Reset selected index when filtered emojis change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredEmojis]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!filteredEmojis.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredEmojis.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredEmojis.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (filteredEmojis[selectedIndex]) {
          const emoji = filteredEmojis[selectedIndex];
          const isCustomEmoji = 'url' in emoji;
          onEmojiSelect(isCustomEmoji ? `:${emoji.name}:` : emoji[1]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        onClose?.();
        break;
    }
  }, [filteredEmojis, selectedIndex, onEmojiSelect, onClose]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!searchTerm || filteredEmojis.length === 0) return null;

  return (
    <div className="emoji-autocomplete-dropdown">
      {filteredEmojis.map((emoji, index) => {
        const isCustomEmoji = 'url' in emoji;
        const isSelected = index === selectedIndex;
        return (
          <div 
            key={index} 
            className={`emoji-autocomplete-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onEmojiSelect(isCustomEmoji ? `:${emoji.name}:` : emoji[1])}
          >
            {isCustomEmoji ? (
              <img 
                src={emoji.url} 
                alt={emoji.name} 
                className="custom-emoji" 
              />
            ) : (
              <span className="emoji">{emoji[1]}</span>
            )}
            <span className="emoji-name">{isCustomEmoji ? emoji.name : emoji[0]}</span>
          </div>
        );
      })}
    </div>
  );
};

export default EmojiAutocomplete;