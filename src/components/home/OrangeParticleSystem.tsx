import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

const OrangeParticleSystem: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const createParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: `particle-${i}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 2 + Math.random() * 4,
          opacity: 0.3 + Math.random() * 0.7,
          duration: 3 + Math.random() * 4,
          delay: Math.random() * 2
        });
      }
      setParticles(newParticles);
    };

    createParticles();

    // Performance optimization: Use requestAnimationFrame for smooth animations
    const animateParticles = () => {
      // Update particle positions for subtle movement
      setParticles(prevParticles =>
        prevParticles.map(particle => ({
          ...particle,
          x: particle.x + (Math.random() - 0.5) * 0.1,
          y: particle.y + (Math.random() - 0.5) * 0.1
        }))
      );
      animationFrameRef.current = requestAnimationFrame(animateParticles);
    };

    animateParticles();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-orange-400"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay
          }}
        />
      ))}

      {/* Travel-themed particle shapes */}
      <motion.div
        className="absolute top-1/4 left-1/3"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Compass shape made of particles */}
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute top-0 left-1/2 w-1 h-8 bg-orange-500 rounded-full transform -translate-x-1/2"
            animate={{ scaleY: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute left-0 top-1/2 w-8 h-1 bg-orange-400 rounded-full transform -translate-y-1/2"
            animate={{ scaleX: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-orange-600 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-3/4 right-1/4"
        animate={{
          rotate: [0, -360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Mountain shape */}
        <div className="relative w-20 h-12">
          <div className="absolute bottom-0 left-0 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-orange-500" />
          <div className="absolute bottom-0 left-4 w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-orange-400" />
          <div className="absolute bottom-0 right-4 w-0 h-0 border-l-4 border-r-4 border-b-10 border-l-transparent border-r-transparent border-b-orange-600" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1/2 right-1/3"
        animate={{
          x: [-10, 10, -10],
          y: [-5, 5, -5]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Camera shape */}
        <div className="relative w-12 h-8 bg-orange-500 rounded-lg">
          <div className="absolute top-1 left-1 w-2 h-2 bg-orange-300 rounded-full" />
          <div className="absolute top-2 right-2 w-4 h-3 bg-orange-400 rounded" />
        </div>
      </motion.div>
    </div>
  );
};

export default OrangeParticleSystem;