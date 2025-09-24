import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

export function HeroAnimation() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const words = ['Adventure', 'Journey', 'Experience', 'Discovery'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [isInView, controls]);

  return (
    <div ref={ref} className="relative inline-block">
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        {words[currentWordIndex]}
      </motion.span>
      
      <span className="invisible">
        {words[currentWordIndex]}
      </span>
    </div>
  );
}