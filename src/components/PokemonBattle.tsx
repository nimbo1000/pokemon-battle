import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, AlertTriangle } from 'lucide-react';
import { PokemonCard } from './PokemonCard';
import { LoadingSpinner } from './LoadingSpinner';
import { fetchBulbasaurAndPikachu, fetchRandomBattle } from '../services/pokemonApi';
import { 
  getVotes, 
  incrementVote, 
  resetVotes, 
  getUserVote, 
  setUserVote, 
  clearUserVote, 
  subscribeToVotes, 
  checkForDuplicateVote 
} from '../services/voteService';
import { startNewBattle } from '../services/supabase';
import type { BattleState } from '../types/pokemon';
import { isDebugMode, getDebugModeStatus } from '../utils/debug';

export const PokemonBattle: React.FC = () => {
  const [battleState, setBattleState] = useState<BattleState>({
    pokemon1: null,
    pokemon2: null,
    votes: { pokemon1: 0, pokemon2: 0 },
    hasVoted: false,
    userVote: null,
    loading: true,
    error: null
  });

  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [isNewBattleLoading, setIsNewBattleLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [currentBattleId, setCurrentBattleId] = useState<number | null>(null);



  // Load initial Pokémon and vote data
  const loadInitialData = useCallback(async () => {
    try {
      setBattleState(prev => ({ ...prev, loading: true, error: null }));
      
      const [pokemon1, pokemon2] = await fetchBulbasaurAndPikachu();
      const currentVotes = await getVotes(pokemon1.id, pokemon2.id);
      const userVote = getUserVote();
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
        setCurrentBattleId(currentVotes.id);
        console.log(`🎯 Set current battle ID: ${currentVotes.id}`);
      }
    } catch {
      setBattleState(prev => ({
        ...prev,
        error: 'Failed to load Pokémon data. Please try again.',
        loading: false
      }));
    }
  }, []);

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
      setUserVote(pokemon);
      
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

  // Handle new battle (bonus feature)
  const handleNewBattle = useCallback(async () => {
    try {
      setIsNewBattleLoading(true);
      
      const [pokemon1, pokemon2] = await fetchRandomBattle();
      
      // Start new battle in database with the new Pokémon
      const battleData = await startNewBattle(pokemon1, pokemon2);
      clearUserVote();
      
      setBattleState(prev => ({
        ...prev,
        pokemon1,
        pokemon2,
        votes: {
          pokemon1: battleData ? battleData.pokemon1_votes : 0,
          pokemon2: battleData ? battleData.pokemon2_votes : 0
        },
        hasVoted: false,
        userVote: null,
        error: null
      }));
      
      // Update the current battle ID for real-time subscription
      if (battleData?.id) {
        setCurrentBattleId(battleData.id);
        console.log(`🎮 New battle started with ID: ${battleData.id}`);
        setDebugInfo(`New battle created: ID ${battleData.id} - ${pokemon1.name} vs ${pokemon2.name}`);
      }
    } catch {
      setBattleState(prev => ({
        ...prev,
        error: 'Failed to start new battle. Please try again.'
      }));
    } finally {
      setIsNewBattleLoading(false);
    }
  }, []);



  // Subscribe to real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupSubscription = async () => {
      // Only set up subscription if we have a battle ID
      if (!currentBattleId) {
        console.log('🔄 Skipping subscription setup - no battle ID yet');
        return;
      }
      
      console.log(`🔄 Setting up real-time subscription for battle ID: ${currentBattleId}`);
      
      unsubscribe = await subscribeToVotes((updatedVotes) => {
        console.log('🔄 Received real-time vote update:', updatedVotes);
        setDebugInfo(`Received update: ${JSON.stringify(updatedVotes)}`);
        
        // Only update if this is for the current battle
        if (updatedVotes.id === currentBattleId) {
          setBattleState(prev => {
            const newState = {
              ...prev,
              votes: {
                pokemon1: updatedVotes.pokemon1_votes,
                pokemon2: updatedVotes.pokemon2_votes
              }
            };
            console.log('🔄 Updated battle state with new votes:', newState.votes);
            setDebugInfo(`State updated: ${JSON.stringify(newState.votes)}`);
            return newState;
          });
        } else {
          console.log('🔄 Ignoring update for different battle:', updatedVotes.id);
        }
      }, currentBattleId);
    };
    
    setupSubscription();

    return () => {
      if (unsubscribe) {
        console.log('🔄 Cleaning up real-time subscription...');
        unsubscribe();
      }
    };
  }, [currentBattleId]);

  // Check for duplicate votes on mount
  useEffect(() => {
    if (checkForDuplicateVote()) {
      setShowDuplicateWarning(true);
      setTimeout(() => setShowDuplicateWarning(false), 5000);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const totalVotes = battleState.votes.pokemon1 + battleState.votes.pokemon2;
  const winner = totalVotes > 0 && battleState.hasVoted 
    ? (battleState.votes.pokemon1 > battleState.votes.pokemon2 ? 'pokemon1' : 
       battleState.votes.pokemon2 > battleState.votes.pokemon1 ? 'pokemon2' : null)
    : null;

  if (battleState.loading) {
    return <LoadingSpinner />;
  }

  if (battleState.error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <AlertTriangle size={48} />
          <h2>Oops!</h2>
          <p>{battleState.error}</p>
          <button onClick={loadInitialData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!battleState.pokemon1 || !battleState.pokemon2) {
    return <div>Failed to load Pokémon</div>;
  }

  return (
    <div className="battle-container">
      <motion.header
        className="battle-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Pokémon Battle Royale</h1>
        <p>Choose your champion!</p>
        
        <div className="action-buttons">
          <motion.button
            className="action-button new-battle"
            onClick={handleNewBattle}
            disabled={isNewBattleLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shuffle size={20} />
            {isNewBattleLoading ? 'Starting...' : 'New Battle'}
          </motion.button>
        </div>
      </motion.header>

      <AnimatePresence>
        {showDuplicateWarning && (
          <motion.div
            className="duplicate-warning"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertTriangle size={20} />
            <span>You've already voted! Results are shown below.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="battle-arena"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <PokemonCard
          pokemon={battleState.pokemon1}
          isWinner={winner === 'pokemon1'}
          votes={battleState.votes.pokemon1}
          totalVotes={totalVotes}
          onVote={() => handleVote('pokemon1')}
          disabled={battleState.hasVoted}
          hasVoted={battleState.hasVoted}
          userVotedFor={battleState.userVote === 'pokemon1'}
        />

        <motion.div
          className="vs-divider"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <span>VS</span>
        </motion.div>

        <PokemonCard
          pokemon={battleState.pokemon2}
          isWinner={winner === 'pokemon2'}
          votes={battleState.votes.pokemon2}
          totalVotes={totalVotes}
          onVote={() => handleVote('pokemon2')}
          disabled={battleState.hasVoted}
          hasVoted={battleState.hasVoted}
          userVotedFor={battleState.userVote === 'pokemon2'}
        />
      </motion.div>

      {battleState.hasVoted && totalVotes > 0 && (
        <motion.div
          className="battle-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3>Battle Results</h3>
          <p>Total votes: {totalVotes}</p>
          {winner && battleState[winner] && (
            <p className="winner-announcement">
              🎉 {battleState[winner]!.name.charAt(0).toUpperCase() + battleState[winner]!.name.slice(1)} wins! 🎉
            </p>
          )}
          {!winner && totalVotes > 0 && (
            <p className="tie-announcement">
              🤝 It's a tie! Both Pokémon are equally awesome! 🤝
            </p>
          )}
        </motion.div>
      )}

      {/* Debug info - controlled by environment variable */}
      {isDebugMode() && (
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
          <div><strong>Mode:</strong> {getDebugModeStatus()}</div>
          <div><strong>Debug:</strong> {debugInfo}</div>
          <div><strong>Battle ID:</strong> {currentBattleId || 'None'}</div>
          <div><strong>Pokémon:</strong> {battleState.pokemon1?.id} vs {battleState.pokemon2?.id}</div>
        </div>
      )}
    </div>
  );
}; 