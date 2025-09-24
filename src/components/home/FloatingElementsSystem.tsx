import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Compass, Camera, Backpack, MapPin, Plane, Mountain } from 'lucide-react';

interface FloatingElement {
  id: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  delay: number;
}

const FloatingElementsSystem: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  // Transform mouse position to element movement
  const transformX = useTransform(springX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-20, 20]);
  const transformY = useTransform(springY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-20, 20]);

  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const icons = [
      <Compass key="compass" size={24} className="text-orange-500" />,
      <Camera key="camera" size={24} className="text-orange-400" />,
      <Backpack key="backpack" size={24} className="text-orange-600" />,
      <MapPin key="mappin" size={24} className="text-orange-500" />,
      <Plane key="plane" size={20} className="text-orange-400" />,
      <Mountain key="mountain" size={22} className="text-orange-600" />
    ];

    const newElements: FloatingElement[] = icons.map((icon, index) => ({
      id: `element-${index}`,
      icon,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: 0.8 + Math.random() * 0.4,
      rotation: Math.random() * 360,
      delay: index * 0.2
    }));

    setElements(newElements);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          initial={{
            x: `${element.x}%`,
            y: `${element.y}%`,
            scale: 0,
            rotate: element.rotation
          }}
          animate={{
            x: `${element.x}%`,
            y: `${element.y}%`,
            scale: element.scale,
            rotate: element.rotation + 360
          }}
          transition={{
            scale: { duration: 0.8, delay: element.delay, ease: "easeOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
          whileHover={{
            scale: element.scale * 1.2,
            transition: { duration: 0.2 }
          }}
          style={{
            x: transformX,
            y: transformY
          }}
        >
          <motion.div
            animate={{
              y: [-10, 10, -10]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: element.delay
            }}
          >
            {element.icon}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElementsSystem;