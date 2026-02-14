'use client';

import { cn } from '@/lib/utils';

interface SpeakingIndicatorProps {
  isSpeaking: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Optional audio level (0-1) for volume-based animation */
  audioLevel?: number;
}

export function SpeakingIndicator({ 
  isSpeaking, 
  size = 'md', 
  className = '',
  audioLevel = 0.5,
}: SpeakingIndicatorProps) {
  const sizeClasses = {
    sm: { container: 'w-8 h-8', ring: '-inset-0.5' },
    md: { container: 'w-12 h-12', ring: '-inset-1' },
    lg: { container: 'w-16 h-16', ring: '-inset-1.5' },
  };

  const sizeConfig = sizeClasses[size];

  if (!isSpeaking) return null;

  // Scale glow intensity based on audio level
  const glowIntensity = Math.min(1, 0.3 + audioLevel * 0.7);

  return (
    <div
      className={cn(
        'absolute inset-0 rounded-full pointer-events-none',
        sizeConfig.container,
        className
      )}
      role="status"
      aria-label="Speaking"
    >
      {/* Primary animated ring - Discord-style green glow */}
      <div 
        className={cn(
          'absolute rounded-full border-2 border-green-500',
          sizeConfig.ring
        )}
        style={{
          animation: 'speakingPulse 1.5s ease-in-out infinite',
          boxShadow: `0 0 ${8 * glowIntensity}px rgba(34, 197, 94, ${0.6 * glowIntensity})`,
        }}
      />
      
      {/* Secondary expanding ring for emphasis */}
      <div 
        className={cn(
          'absolute rounded-full border border-green-400',
          sizeConfig.ring
        )}
        style={{
          animation: 'speakingExpand 2s ease-out infinite',
          opacity: 0.4,
        }}
      />

      {/* Inner glow ring */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `inset 0 0 ${4 * glowIntensity}px rgba(34, 197, 94, ${0.3 * glowIntensity})`,
        }}
      />

      {/* Inline CSS animations */}
      <style jsx>{`
        @keyframes speakingPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        
        @keyframes speakingExpand {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default SpeakingIndicator;