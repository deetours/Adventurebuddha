import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface DestinationOrb {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  size: number;
  rotationSpeed: number;
}

const DestinationOrbs: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const [orbs, setOrbs] = useState<DestinationOrb[]>([]);

  useEffect(() => {
    const destinations = [
      { name: "Bali", color: "from-orange-400 to-orange-600" },
      { name: "Thailand", color: "from-orange-500 to-orange-700" },
      { name: "Vietnam", color: "from-orange-300 to-orange-500" },
      { name: "Japan", color: "from-orange-600 to-orange-800" },
      { name: "Nepal", color: "from-orange-400 to-orange-600" }
    ];

    const newOrbs: DestinationOrb[] = destinations.map((dest, index) => ({
      id: `orb-${index}`,
      name: dest.name,
      color: dest.color,
      x: 10 + (index * 18), // Spread across the container
      y: 20 + (index * 15),
      size: 60 + Math.random() * 40,
      rotationSpeed: 1 + Math.random() * 2
    }));

    setOrbs(newOrbs);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 2 }}
    >
      {orbs.map((orb) => (
        <OrbComponent
          key={orb.id}
          orb={orb}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
};

interface OrbComponentProps {
  orb: DestinationOrb;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}

const OrbComponent: React.FC<OrbComponentProps> = ({ orb, scrollYProgress }) => {
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 360 * orb.rotationSpeed]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, -360 * orb.rotationSpeed]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${orb.x}%`,
        top: `${orb.y}%`,
        rotateX,
        rotateY,
        scale
      }}
      whileHover={{
        scale: 1.3,
        transition: { duration: 0.3 }
      }}
    >
      {/* 3D Orb */}
      <motion.div
        className={`relative rounded-full bg-gradient-to-br ${orb.color} shadow-2xl`}
        style={{
          width: orb.size,
          height: orb.size
        }}
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360]
        }}
        transition={{
          duration: 20 / orb.rotationSpeed,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-2 rounded-full bg-white opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
          }}
        />

        {/* Destination label */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-white font-bold text-xs text-center px-2">
            {orb.name}
          </span>
        </motion.div>
      </motion.div>

      {/* Orbiting particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-orange-300 rounded-full"
          style={{
            left: orb.size / 2 - 4,
            top: orb.size / 2 - 4
          }}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.5
          }}
        >
          <motion.div
            className="w-full h-full bg-orange-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DestinationOrbs;