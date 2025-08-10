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
  const pokemonNumber = `#${pokemon.id.toString().padStart(3, '0')}`;
  
  return (
    <motion.div
      className={`pokemon-card ${isWinner ? 'winner' : ''} ${userVotedFor ? 'user-voted' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
    >
      {/* Card Header */}
      <div className="card-header">
        <div className="pokemon-name-section">
          <h3 className="pokemon-name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
          <span className="pokemon-number">{pokemonNumber}</span>
        </div>
        <div className="hp-section">
          <span className="hp-label">HP</span>
          <span className="hp-value">{pokemon.base_experience}</span>
        </div>
      </div>

      {/* Pokemon Image */}
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
        {userVotedFor && (
          <motion.div
            className="user-vote-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            ✓
          </motion.div>
        )}
      </div>

      {/* Pokemon Stats */}
      <div className="pokemon-stats">
        <div className="stat-row">
          <div className="stat">
            <span className="stat-label">Weight</span>
            <span className="stat-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
          </div>
          <div className="stat">
            <span className="stat-label">Height</span>
            <span className="stat-value">{(pokemon.height / 10).toFixed(1)} m</span>
          </div>
        </div>
      </div>

      {/* Vote Section */}
      {hasVoted ? (
        <div className="vote-results">
          <div className="vote-count">
            <span className="votes">{votes} votes</span>
            <span className="percentage">({percentage}%)</span>
          </div>
          <div className="vote-bar-container">
            <div className="vote-bar">
              <motion.div
                className="vote-fill"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
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

      {/* Card Footer */}
      <div className="card-footer">
        <div className="card-type">Pokémon</div>
      </div>
    </motion.div>
  );
}; 