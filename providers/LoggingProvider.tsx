'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logging';

interface LoggingContextValue {
  logger: typeof logger;
}

const LoggingContext = createContext<LoggingContextValue | undefined>(undefined);

interface LoggingProviderProps {
  children: ReactNode;
}

export function LoggingProvider({ children }: LoggingProviderProps) {
  const { user } = useAuth();

  // Update logger with user context
  useEffect(() => {
    if (user?.id) {
      logger.setUser(user.id);
    } else {
      logger.setUser(undefined);
    }
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      logger.destroy();
    };
  }, []);

  return (
    <LoggingContext.Provider value={{ logger }}>
      {children}
    </LoggingContext.Provider>
  );
}

export function useLogging() {
  const context = useContext(LoggingContext);
  if (!context) {
    throw new Error('useLogging must be used within a LoggingProvider');
  }
  return context.logger;
}