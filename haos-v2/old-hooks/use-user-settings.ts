import { useState, useEffect } from 'react';

interface UserSettings {
  showTypingIndicators: boolean;
  toggleTypingIndicators: () => void;
}

export function useUserSettings(): UserSettings {
  const [showTypingIndicators, setShowTypingIndicators] = useState<boolean>(true);

  // Load from localStorage on initial load
  useEffect(() => {
    const savedPreference = localStorage.getItem('showTypingIndicators');
    if (savedPreference !== null) {
      setShowTypingIndicators(JSON.parse(savedPreference));
    }
  }, []);

  const toggleTypingIndicators = () => {
    const newPreference = !showTypingIndicators;
    setShowTypingIndicators(newPreference);
    
    // Persist to localStorage
    localStorage.setItem('showTypingIndicators', JSON.stringify(newPreference));
  };

  return {
    showTypingIndicators,
    toggleTypingIndicators
  };
}