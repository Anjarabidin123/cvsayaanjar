import React from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

/**
 * ParallaxBackground moves the decorative batik blob opposite to scroll direction.
 * It is lightweight and can be lazily loaded.
 */
const ParallaxBackground: React.FC = () => {
  const { scrollY } = useScroll();
  // Move the background -30px to 30px based on scroll position
  const y = useTransform(scrollY, [0, 500], [-30, 30]);
  return (
    <motion.div
      className="pointer-events-none absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-accent/8 rounded-full blur-[80px]"
      style={{ y }}
    />
  );
};

export default ParallaxBackground;
