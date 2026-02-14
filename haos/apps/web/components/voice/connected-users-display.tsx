'use client';

import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import { VoiceParticipant } from '@/stores/voice-store';
import { SpeakingIndicator } from './speaking-indicator';

interface ConnectedUsersDisplayProps {
  participants: VoiceParticipant[];
  maxVisible?: number;
  className?: string;
  onUserClick?: (participant: VoiceParticipant) => void;
}

export function ConnectedUsersDisplay({
  participants,
  maxVisible = 5,
  className = '',
  onUserClick,
}: ConnectedUsersDisplayProps) {
  const visibleParticipants = participants.slice(0, maxVisible);
  const remainingCount = Math.max(0, participants.length - maxVisible);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (participants.length === 0) {
    return null;
  }

  return (
    <div 
      className={cn(
        'flex items-center space-x-2 px-3 py-2 bg-[#2f3136] rounded-lg border border-[#40444b]',
        className
      )}
      role="region"
      aria-label="Connected users in voice channel"
    >
      {/* Users icon */}
      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
      
      {/* Avatar stack */}
      <div className="flex items-center -space-x-2" role="group" aria-label="User avatars">
        {visibleParticipants.map((participant, index) => (
          <button
            key={participant.identity}
            onClick={() => onUserClick?.(participant)}
            className={cn(
              'relative w-8 h-8 rounded-full border-2 border-[#2f3136] bg-[#5865f2]',
              'flex items-center justify-center text-white text-xs font-semibold',
              'hover:z-10 hover:scale-110 transition-transform duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-[#2f3136]'
            )}
            style={{ zIndex: visibleParticipants.length - index }}
            title={`${participant.name}${participant.isLocal ? ' (You)' : ''}`}
            aria-label={`${participant.name}${participant.isLocal ? ' (You)' : ''}${participant.isSpeaking ? ', speaking' : ''}`}
          >
            {participant.avatar ? (
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{getInitials(participant.name)}</span>
            )}
            
            {/* Speaking indicator */}
            <SpeakingIndicator isSpeaking={participant.isSpeaking} size="sm" />
            
            {/* Online status dot */}
            <span 
              className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#2f3136]"
              aria-hidden="true"
            />
          </button>
        ))}
        
        {/* Remaining count badge */}
        {remainingCount > 0 && (
          <div
            className="relative w-8 h-8 rounded-full border-2 border-[#2f3136] bg-[#4f545c] flex items-center justify-center text-white text-xs font-semibold"
            style={{ zIndex: 0 }}
            title={`${remainingCount} more user${remainingCount === 1 ? '' : 's'}`}
            aria-label={`${remainingCount} more user${remainingCount === 1 ? '' : 's'}`}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* User count */}
      <span className="text-sm text-gray-400 ml-1">
        <span className="sr-only">Total users: </span>
        {participants.length}
      </span>
    </div>
  );
}

export default ConnectedUsersDisplay;
