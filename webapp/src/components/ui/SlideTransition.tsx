
import { ReactNode, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideTransitionProps {
  children: ReactNode;
  isVisible?: boolean;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  delay?: number;
  className?: string;
}

export const SlideTransition = ({
  children,
  isVisible = true,
  direction = "up",
  duration = 0.5,
  delay = 0,
  className = "",
}: SlideTransitionProps) => {
  const directionMap = {
    up: { y: [20, 0] },
    down: { y: [-20, 0] },
    left: { x: [20, 0] },
    right: { x: [-20, 0] },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, ...getInitialState(direction) }}
          animate={{ 
            opacity: 1, 
            ...getFinalState(direction),
            transition: { duration, delay, ease: "easeOut" }
          }}
          exit={{ 
            opacity: 0,
            ...getInitialState(direction),
            transition: { duration: duration * 0.8, ease: "easeIn" }
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper function to get initial state based on direction
function getInitialState(direction: "up" | "down" | "left" | "right") {
  switch (direction) {
    case "up": return { y: 20 };
    case "down": return { y: -20 };
    case "left": return { x: 20 };
    case "right": return { x: -20 };
  }
}

// Helper function to get final state based on direction
function getFinalState(direction: "up" | "down" | "left" | "right") {
  switch (direction) {
    case "up": return { y: 0 };
    case "down": return { y: 0 };
    case "left": return { x: 0 };
    case "right": return { x: 0 };
  }
}

// Page transition component with scroll restoration
export const PageTransition = ({ children }: { children: ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [children]);

  return (
    <div ref={scrollRef} className="h-full w-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Staggered children component
export const StaggerChildren = ({ 
  children, 
  staggerDelay = 0.1, 
  className = "" 
}: { 
  children: ReactNode[]; 
  staggerDelay?: number;
  className?: string;
}) => {
  return (
    <div className={className}>
      <AnimatePresence>
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.4, 
              delay: index * staggerDelay,
              ease: "easeOut" 
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
