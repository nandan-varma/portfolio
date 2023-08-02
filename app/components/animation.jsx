'use client'
import { motion } from 'framer-motion';

const SpringMotion = ({ children, initial, animate, transition, whileHover, whileTap, className }) => {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      whileHover={whileHover}
      whileTap={whileTap}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const LoadAnimation = ({ children, index }) => {
  return (
    <SpringMotion
      initial={{ y: -1000 }}
      animate={{ y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 15,
        delay: 0.1 * index,
      }}
    >
      {children}
    </SpringMotion>
  )
}

export default SpringMotion;
