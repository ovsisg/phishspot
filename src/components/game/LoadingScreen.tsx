import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <motion.div 
      className="game-loading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="loading-spinner"></div>
      <p>Loading questions...</p>
    </motion.div>
  );
}
