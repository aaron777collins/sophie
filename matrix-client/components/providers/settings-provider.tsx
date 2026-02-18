'use client';

import React, { ReactNode } from 'react';
import { SettingsContext, useSettingsImpl } from '../../hooks/use-settings';

interface SettingsProviderProps {
  children: ReactNode;
  matrixClient?: any; // Matrix client instance
}

export function SettingsProvider({ children, matrixClient }: SettingsProviderProps) {
  const settingsValue = useSettingsImpl(matrixClient);

  return (
    <SettingsContext.Provider value={settingsValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// HOC to wrap components with settings provider
export function withSettingsProvider<T extends object>(
  Component: React.ComponentType<T>,
  matrixClient?: any
) {
  return function SettingsWrappedComponent(props: T) {
    return (
      <SettingsProvider matrixClient={matrixClient}>
        <Component {...props} />
      </SettingsProvider>
    );
  };
}