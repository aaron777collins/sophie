import React, { useState, useEffect, useRef } from 'react';
import { Channel } from '@/types/channel'; // Adjust import based on your project structure

interface ChannelAutocompleteProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  inputValue: string;
}

export const ChannelAutocomplete: React.FC<ChannelAutocompleteProps> = ({
  channels,
  onChannelSelect,
  inputValue
}) => {
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Extract the channel search term after the # symbol
    const channelTerm = inputValue.split('#').pop()?.toLowerCase() || '';
    
    // Filter channels based on the term
    const filtered = channels.filter(channel => 
      channel.name.toLowerCase().includes(channelTerm)
    );
    
    setFilteredChannels(filtered);
    setSelectedIndex(-1);
  }, [inputValue, channels]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredChannels.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredChannels.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : prev
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < filteredChannels.length) {
          e.preventDefault();
          onChannelSelect(filteredChannels[selectedIndex]);
        }
        break;
    }
  };

  const handleChannelClick = (channel: Channel) => {
    onChannelSelect(channel);
  };

  // Only show dropdown if there are filtered channels
  if (filteredChannels.length === 0 || !inputValue.includes('#')) {
    return null;
  }

  return (
    <div 
      ref={dropdownRef} 
      className="absolute z-50 bg-white border rounded shadow-lg mt-1 max-h-60 overflow-y-auto"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {filteredChannels.map((channel, index) => (
        <div
          key={channel.id}
          className={`
            px-4 py-2 cursor-pointer 
            ${index === selectedIndex ? 'bg-gray-200' : 'bg-white'}
            hover:bg-gray-100
          `}
          onClick={() => handleChannelClick(channel)}
        >
          # {channel.name}
        </div>
      ))}
    </div>
  );
};