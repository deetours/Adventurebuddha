import React, { createContext, useContext, useState, ReactNode } from 'react';
import { chainPromptingService } from '../services/chainPromptingService';
import { getChainForPage } from '../config/chainPrompts';

interface ChainPromptingContextType {
  executePageEnhancement: (pageName: string, initialContext?: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
  results: Record<string, unknown>;
  error: string | null;
  clearResults: () => void;
}

const ChainPromptingContext = createContext<ChainPromptingContextType | undefined>(undefined);

export function ChainPromptingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);

  const executePageEnhancement = async (pageName: string, initialContext?: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Clear previous results
      chainPromptingService.clearContext();
      
      // Set initial context if provided
      if (initialContext) {
        chainPromptingService.setContext(initialContext);
      }
      
      // Get the enhancement chain for this page
      const chain = getChainForPage(pageName);
      
      if (!chain) {
        throw new Error(`No enhancement chain found for page: ${pageName}`);
      }
      
      // Execute the chain steps
      const stepResults = await chainPromptingService.executeChain(chain.steps);
      setResults(stepResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Chain prompting error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults({});
    setError(null);
    chainPromptingService.clearContext();
  };

  return (
    <ChainPromptingContext.Provider
      value={{
        executePageEnhancement,
        isLoading,
        results,
        error,
        clearResults
      }}
    >
      {children}
    </ChainPromptingContext.Provider>
  );
}

export function useChainPromptingContext() {
  const context = useContext(ChainPromptingContext);
  if (context === undefined) {
    throw new Error('useChainPromptingContext must be used within a ChainPromptingProvider');
  }
  return context;
}