import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, AlertTriangle, RotateCcw } from 'lucide-react';
import { PokemonCard } from './PokemonCard';
import { LoadingSpinner } from './LoadingSpinner';
import { useBattleState } from '../hooks/useBattleState';
import { useDebugState } from '../hooks/useDebugState';
import { DebugPanel } from './DebugPanel';

export const PokemonBattle: React.FC = () => {
  // Use custom hooks for state management
  const {
    debugInfo,
    currentBattleId,
    setDebugInfo,
    setCurrentBattleId,
    debugModeStatus
  } = useDebugState();

  const {
    battleState,
    showDuplicateWarning,
    isNewBattleLoading,
    handleVote,
    handleNewBattle,
    resetToDefaultBattle,
    loadInitialData,
    totalVotes,
    winner
  } = useBattleState(setDebugInfo, setCurrentBattleId);

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
          
          <motion.button
            className="action-button reset-battle"
            onClick={resetToDefaultBattle}
            disabled={isNewBattleLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={20} />
            {isNewBattleLoading ? 'Resetting...' : 'Reset to Default'}
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

      {/* Debug Panel */}
      <DebugPanel
        debugInfo={debugInfo}
        currentBattleId={currentBattleId}
        battleState={battleState}
        debugModeStatus={debugModeStatus}
      />
    </div>
  );
}; 