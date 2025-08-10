import { useState, useCallback } from 'react';
import { isDebugMode, getDebugModeStatus } from '../utils/debug';

interface UseDebugStateReturn {
  debugInfo: string;
  currentBattleId: number | null;
  setDebugInfo: (info: string) => void;
  setCurrentBattleId: (id: number | null) => void;
  isDebugEnabled: boolean;
  debugModeStatus: string;
}

export const useDebugState = (): UseDebugStateReturn => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [currentBattleId, setCurrentBattleId] = useState<number | null>(null);
  
  const isDebugEnabled = isDebugMode();
  const debugModeStatus = getDebugModeStatus();

  const updateDebugInfo = useCallback((info: string) => {
    if (isDebugEnabled) {
      setDebugInfo(info);
    }
  }, [isDebugEnabled]);

  return {
    debugInfo,
    currentBattleId,
    setDebugInfo: updateDebugInfo,
    setCurrentBattleId,
    isDebugEnabled,
    debugModeStatus
  };
}; 