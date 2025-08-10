import { motion } from 'framer-motion';
import type { Pokemon } from '../types/pokemon';

interface PokemonCardProps {
  pokemon: Pokemon;
  isWinner?: boolean;
  votes: number;
  totalVotes: number;
  onVote: () => void;
  disabled: boolean;
  hasVoted: boolean;
  userVotedFor: boolean;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isWinner = false,
  votes,
  totalVotes,
  onVote,
  disabled,
  hasVoted,
  userVotedFor
}) => {
  const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  
  return (
    <motion.div
      className={`pokemon-card ${isWinner ? 'winner' : ''} ${userVotedFor ? 'user-voted' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
    >
      <div className="pokemon-image-container">
        <img
          src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
          alt={pokemon.name}
          className="pokemon-image"
        />
        {isWinner && hasVoted && (
          <motion.div
            className="winner-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            👑
          </motion.div>
        )}
      </div>
      
      <div className="pokemon-info">
        <h3 className="pokemon-name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
        
        <div className="pokemon-stats">
          <div className="stat">
            <span className="stat-label">Weight:</span>
            <span className="stat-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
          </div>
          <div className="stat">
            <span className="stat-label">Height:</span>
            <span className="stat-value">{(pokemon.height / 10).toFixed(1)} m</span>
          </div>
          <div className="stat">
            <span className="stat-label">Base XP:</span>
            <span className="stat-value">{pokemon.base_experience}</span>
          </div>
        </div>
        
        {hasVoted ? (
          <div className="vote-results">
            <div className="vote-count">
              <span className="votes">{votes} votes</span>
              <span className="percentage">({percentage}%)</span>
            </div>
            <div className="vote-bar">
              <motion.div
                className="vote-fill"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        ) : (
          <motion.button
            className="vote-button"
            onClick={onVote}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
          >
            Vote for {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}; 