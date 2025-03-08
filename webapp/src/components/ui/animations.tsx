
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Fade in animation
export const FadeIn = ({ 
  children, 
  duration = 0.5, 
  delay = 0,
  className = "" 
}: { 
  children: ReactNode; 
  duration?: number;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale animation
export const ScaleIn = ({ 
  children, 
  duration = 0.3,
  delay = 0,
  className = "" 
}: { 
  children: ReactNode; 
  duration?: number;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Hover scale effect
export const HoverScale = ({ 
  children, 
  scale = 1.03,
  className = "" 
}: { 
  children: ReactNode; 
  scale?: number;
  className?: string;
}) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Pulse animation
export const Pulse = ({ 
  children,
  className = "" 
}: { 
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    animate={{ 
      scale: [1, 1.03, 1],
      opacity: [1, 0.8, 1] 
    }}
    transition={{ 
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" 
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Shimmer effect for loading states
export const Shimmer = ({ 
  width, 
  height, 
  rounded = "rounded-md",
  className = "" 
}: { 
  width: string; 
  height: string;
  rounded?: string;
  className?: string;
}) => (
  <div 
    className={`bg-muted/30 animate-pulse ${rounded} ${width} ${height} ${className} shimmer`}
  />
);

// Success checkmark animation
export const SuccessCheckmark = ({ size = 48, className = "" }: { size?: number; className?: string }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    className={className}
  >
    <motion.circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
    <motion.path
      d="M15 25 L22 32 L35 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "easeInOut" }}
    />
  </motion.svg>
);
