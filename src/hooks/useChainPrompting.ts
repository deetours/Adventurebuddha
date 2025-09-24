import { useChainPromptingContext } from '../contexts/ChainPromptingContext';

export function useChainPrompting() {
  return useChainPromptingContext();
}