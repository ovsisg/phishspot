import { motion } from 'framer-motion';

interface FlowArrowProps {
  direction?: 'right' | 'down';
  delay?: number;
}

export function FlowArrow({ direction = 'right', delay = 0 }: FlowArrowProps) {
  const isRight = direction === 'right';
  
  return (
    <motion.div
      className={`flow-arrow ${direction}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <svg
        width={isRight ? "80" : "40"}
        height={isRight ? "40" : "80"}
        viewBox={isRight ? "0 0 80 40" : "0 0 40 80"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isRight ? (
          <>
            <motion.path
              d="M5 20 L60 20"
              stroke="var(--accent-color)"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeInOut" }}
            />
            <motion.path
              d="M55 15 L65 20 L55 25"
              stroke="var(--accent-color)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 1, duration: 0.4 }}
            />
          </>
        ) : (
          <>
            <motion.path
              d="M20 5 L20 60"
              stroke="var(--accent-color)"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeInOut" }}
            />
            <motion.path
              d="M15 55 L20 65 L25 55"
              stroke="var(--accent-color)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 1, duration: 0.4 }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}
