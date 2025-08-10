import React from 'react';
import type { BattleState } from '../types/pokemon';

interface DebugPanelProps {
  debugInfo: string;
  currentBattleId: number | null;
  battleState: BattleState;
  debugModeStatus: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  debugInfo,
  currentBattleId,
  battleState,
  debugModeStatus
}) => {
  if (!debugModeStatus.includes('enabled')) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 1000
    }}>
      <div><strong>Mode:</strong> {debugModeStatus}</div>
      <div><strong>Debug:</strong> {debugInfo}</div>
      <div><strong>Battle ID:</strong> {currentBattleId || 'None'}</div>
      <div><strong>Pokémon:</strong> {battleState.pokemon1?.id} vs {battleState.pokemon2?.id}</div>
    </div>
  );
}; 