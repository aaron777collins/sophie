'use client';

import React, { useState, ReactNode } from 'react';
import styles from './avatar.module.css';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  className?: string;
  onClick?: () => void;
}

export function Avatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  shape = 'circle',
  status,
  className = '',
  onClick,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initials = fallback || getInitials(alt);

  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${styles[shape]} ${
        onClick ? styles.clickable : ''
      } ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className={styles.image}
          onError={() => setHasError(true)}
        />
      ) : (
        <span className={styles.fallback} style={getColorFromString(alt)}>
          {initials}
        </span>
      )}
      {status && <span className={`${styles.status} ${styles[status]}`} />}
    </div>
  );
}

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({
  children,
  max = 5,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  return (
    <div className={`${styles.avatarGroup} ${styles[size]} ${className}`}>
      {visibleChildren.map((child, index) => (
        <div key={index} className={styles.avatarGroupItem}>
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className={`${styles.avatarGroupItem} ${styles.avatarGroupMore}`}>
          <span className={`${styles.avatar} ${styles[size]}`}>
            <span className={styles.fallback}>+{remainingCount}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function getColorFromString(str: string): { backgroundColor: string } {
  if (!str) return { backgroundColor: '#5865f2' };
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#5865f2', // Blurple
    '#57f287', // Green
    '#fee75c', // Yellow
    '#eb459e', // Fuchsia
    '#ed4245', // Red
    '#3498db', // Blue
    '#9b59b6', // Purple
    '#e67e22', // Orange
    '#1abc9c', // Teal
  ];
  
  return { backgroundColor: colors[Math.abs(hash) % colors.length] };
}

export default Avatar;
