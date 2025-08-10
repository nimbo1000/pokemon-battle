import { useState, useCallback, useEffect } from 'react';
import { fetchInitialBattle, fetchRandomBattle, fetchPokemon } from '../services/pokemonApi';
import { 
  getVotes, 
  incrementVote, 
  getUserVote, 
  setUserVote, 
  subscribeToVotes, 
  checkForDuplicateVote 
} from '../services/voteService';
import { startNewBattle } from '../services/supabase';
import type { BattleState } from '../types/pokemon';

interface UseBattleStateReturn {
  // Core battle state
  battleState: BattleState;
  
  // UI state
  showDuplicateWarning: boolean;
  isNewBattleLoading: boolean;
  
  // Actions
  handleVote: (pokemon: 'pokemon1' | 'pokemon2') => Promise<void>;
  handleNewBattle: () => Promise<void>;
  resetToDefaultBattle: () => Promise<void>;
  loadInitialData: () => Promise<void>;
  
  // Computed values
  totalVotes: number;
  winner: 'pokemon1' | 'pokemon2' | null;
  
  // Debug integration
  setDebugInfo?: (info: string) => void;
  setCurrentBattleId?: (id: number | null) => void;
}

export const useBattleState = (
  setDebugInfo?: (info: string) => void,
  setCurrentBattleId?: (id: number | null) => void
): UseBattleStateReturn => {
  // Consolidated battle state
  const [battleState, setBattleState] = useState<BattleState>({
    pokemon1: null,
    pokemon2: null,
    votes: { pokemon1: 0, pokemon2: 0 },
    hasVoted: false,
    userVote: null,
    loading: true,
    error: null
  });

  // UI state
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [isNewBattleLoading, setIsNewBattleLoading] = useState(false);
  const [internalBattleId, setInternalBattleId] = useState<number | null>(null);

  // Load initial Pokémon and vote data
  const loadInitialData = useCallback(async () => {
    try {
      setBattleState(prev => ({ ...prev, loading: true, error: null }));
      
      // Try to load the last active battle from localStorage, fallback to default
      const lastBattleKey = localStorage.getItem('last_active_battle');
      let pokemon1, pokemon2;
      
      if (lastBattleKey) {
        try {
          const [id1, id2] = lastBattleKey.split('-').map(Number);
          [pokemon1, pokemon2] = await Promise.all([
            fetchPokemon(id1),
            fetchPokemon(id2)
          ]);
          console.log(`🔄 Loaded last active battle: ${pokemon1.name} vs ${pokemon2.name}`);
        } catch {
          console.log('🔄 Failed to load last battle, using default');
          [pokemon1, pokemon2] = await fetchInitialBattle();
        }
      } else {
        [pokemon1, pokemon2] = await fetchInitialBattle();
      }
      
      const currentVotes = await getVotes(pokemon1.id, pokemon2.id);
      const userVote = getUserVote(pokemon1.id, pokemon2.id);
      const hasVoted = userVote !== null;

      setBattleState(prev => ({
        ...prev,
        pokemon1,
        pokemon2,
        votes: {
          pokemon1: currentVotes.pokemon1_votes,
          pokemon2: currentVotes.pokemon2_votes
        },
        hasVoted,
        userVote,
        loading: false
      }));
      
      // Set the current battle ID for real-time subscription
      if (currentVotes?.id) {
        setInternalBattleId(currentVotes.id);
        setCurrentBattleId?.(currentVotes.id);
        console.log(`🎯 Set current battle ID: ${currentVotes.id}`);
      }
    } catch {
      setBattleState(prev => ({
        ...prev,
        error: 'Failed to load Pokémon data. Please try again.',
        loading: false
      }));
    }
  }, [setCurrentBattleId]);

  // Handle voting
  const handleVote = useCallback(async (pokemon: 'pokemon1' | 'pokemon2') => {
    if (battleState.hasVoted) {
      setShowDuplicateWarning(true);
      setTimeout(() => setShowDuplicateWarning(false), 3000);
      return;
    }

    try {
      const updatedVotes = await incrementVote(
        pokemon, 
        battleState.pokemon1?.id, 
        battleState.pokemon2?.id
      );
      setUserVote(pokemon, battleState.pokemon1!.id, battleState.pokemon2!.id);
      
      setBattleState(prev => ({
        ...prev,
        votes: {
          pokemon1: updatedVotes.pokemon1_votes,
          pokemon2: updatedVotes.pokemon2_votes
        },
        hasVoted: true,
        userVote: pokemon
      }));
    } catch {
      setBattleState(prev => ({
        ...prev,
        error: 'Failed to submit vote. Please try again.'
      }));
    }
  }, [battleState.hasVoted, battleState.pokemon1?.id, battleState.pokemon2?.id]);

  // Handle new battle
  // Note: battleState.pokemon1 and battleState.pokemon2 are not used in this function
  // as it creates new Pokémon with fetchRandomBattle()
  const handleNewBattle = useCallback(async () => {
    try {
      setIsNewBattleLoading(true);
      
      const [pokemon1, pokemon2] = await fetchRandomBattle();
      
      // Start new battle in database with the new Pokémon
      const battleData = await startNewBattle(pokemon1, pokemon2);
      
      // Save the new battle as the last active battle
      const battleKey = `${pokemon1.id}-${pokemon2.id}`;
      localStorage.setItem('last_active_battle', battleKey);
      
      // Check if user has already voted for this new battle pair
      const userVote = getUserVote(pokemon1.id, pokemon2.id);
      const hasVoted = userVote !== null;
      
      setBattleState(prev => ({
        ...prev,
        pokemon1,
        pokemon2,
        votes: {
          pokemon1: battleData ? battleData.pokemon1_votes : 0,
          pokemon2: battleData ? battleData.pokemon2_votes : 0
        },
        hasVoted,
        userVote,
        error: null
      }));
      
      // Update the current battle ID for real-time subscription
      if (battleData?.id) {
        setInternalBattleId(battleData.id);
        setCurrentBattleId?.(battleData.id);
        console.log(`🎮 New battle started with ID: ${battleData.id}`);
        setDebugInfo?.(`New battle created: ID ${battleData.id} - ${pokemon1.name} vs ${pokemon2.name}`);
      }
    } catch {
      setBattleState(prev => ({
        ...prev,
        error: 'Failed to start new battle. Please try again.'
      }));
    } finally {
      setIsNewBattleLoading(false);
    }
  }, [setCurrentBattleId, setDebugInfo]);

  // Function to reset to default battle
  const resetToDefaultBattle = useCallback(async () => {
    try {
      setIsNewBattleLoading(true);
      
      // Clear the last active battle
      localStorage.removeItem('last_active_battle');
      
      // Load default battle
      const [pokemon1, pokemon2] = await fetchInitialBattle();
      const currentVotes = await getVotes(pokemon1.id, pokemon2.id);
      const userVote = getUserVote(pokemon1.id, pokemon2.id);
      const hasVoted = userVote !== null;
      
      setBattleState(prev => ({
        ...prev,
        pokemon1,
        pokemon2,
        votes: {
          pokemon1: currentVotes.pokemon1_votes,
          pokemon2: currentVotes.pokemon2_votes
        },
        hasVoted,
        userVote,
        error: null
      }));
      
      if (currentVotes?.id) {
        setInternalBattleId(currentVotes.id);
        setCurrentBattleId?.(currentVotes.id);
      }
    } catch {
      setBattleState(prev => ({
        ...prev,
        error: 'Failed to reset to default battle. Please try again.'
      }));
    } finally {
      setIsNewBattleLoading(false);
    }
  }, [setCurrentBattleId]);

  // Subscribe to real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupSubscription = async () => {
      if (!internalBattleId) {
        console.log('🔄 Skipping subscription setup - no battle ID yet');
        return;
      }
      
      console.log(`🔄 Setting up real-time subscription for battle ID: ${internalBattleId}`);
      
      unsubscribe = await subscribeToVotes((updatedVotes) => {
        console.log('🔄 Received real-time vote update:', updatedVotes);
        setDebugInfo?.(`Received update: ${JSON.stringify(updatedVotes)}`);
        
        // Only update if this is for the current battle
        if (updatedVotes.id === internalBattleId) {
          setBattleState(prev => {
            const newState = {
              ...prev,
              votes: {
                pokemon1: updatedVotes.pokemon1_votes,
                pokemon2: updatedVotes.pokemon2_votes
              }
            };
            console.log('🔄 Updated battle state with new votes:', newState.votes);
            setDebugInfo?.(`State updated: ${JSON.stringify(newState.votes)}`);
            return newState;
          });
        } else {
          console.log('🔄 Ignoring update for different battle:', updatedVotes.id);
        }
      }, internalBattleId);
    };
    
    setupSubscription();

    return () => {
      if (unsubscribe) {
        console.log('🔄 Cleaning up real-time subscription...');
        unsubscribe();
      }
    };
  }, [internalBattleId, setDebugInfo]);

  // Check for duplicate votes on mount
  useEffect(() => {
    if (battleState.pokemon1 && battleState.pokemon2) {
      if (checkForDuplicateVote(battleState.pokemon1.id, battleState.pokemon2.id)) {
        setShowDuplicateWarning(true);
        setTimeout(() => setShowDuplicateWarning(false), 5000);
      }
    }
  }, [battleState.pokemon1, battleState.pokemon2]);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Computed values
  const totalVotes = battleState.votes.pokemon1 + battleState.votes.pokemon2;
  const winner = totalVotes > 0 
    ? (battleState.votes.pokemon1 > battleState.votes.pokemon2 ? 'pokemon1' : 'pokemon2')
    : null;

  return {
    battleState,
    showDuplicateWarning,
    isNewBattleLoading,
    handleVote,
    handleNewBattle,
    resetToDefaultBattle,
    loadInitialData,
    totalVotes,
    winner
  };
}; 