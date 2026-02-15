import React, { useState, useEffect, useMemo } from 'react';

// Lazy-loaded emoji data to optimize performance
const lazyLoadEmojiData = () => {
  return import('./emoji-data.json').then(module => module.default);
};

interface EmojiAutocompleteProps {
  searchTerm: string;
  onEmojiSelect: (emoji: string) => void;
  customEmojis?: { name: string; url: string }[];
}

export const EmojiAutocomplete: React.FC<EmojiAutocompleteProps> = ({ 
  searchTerm, 
  onEmojiSelect, 
  customEmojis = [] 
}) => {
  const [emojiData, setEmojiData] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    lazyLoadEmojiData()
      .then(data => {
        setEmojiData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to load emoji data', error);
        setIsLoading(false);
      });
  }, []);

  const filteredEmojis = useMemo(() => {
    if (isLoading) return [];

    const standardEmojis = Object.entries(emojiData)
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
  }, [searchTerm, emojiData, customEmojis, isLoading]);

  if (!searchTerm || filteredEmojis.length === 0) return null;

  return (
    <div className="emoji-autocomplete-dropdown">
      {filteredEmojis.map((emoji, index) => {
        const isCustomEmoji = 'url' in emoji;
        return (
          <div 
            key={index} 
            className="emoji-autocomplete-item"
            onClick={() => onEmojiSelect(isCustomEmoji ? `:${emoji.name}:` : emoji[0])}
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