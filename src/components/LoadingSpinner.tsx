import { motion } from 'framer-motion';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <motion.div
        className="pokeball-spinner"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        ⚪
      </motion.div>
      <motion.p
        className="loading-text"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        Loading Pokémon...
      </motion.p>
    </div>
  );
}; 