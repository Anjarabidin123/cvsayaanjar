import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

/**
 * TiltCard adds a subtle 3D tilt effect on hover.
 * It is lightweight and can be lazy‑loaded.
 */
const TiltCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [10, -10]);
  const rotateY = useTransform(x, [-50, 50], [-10, 10]);

  return (
    <motion.div
      className="relative w-full h-full"
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseMove={(e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const xc = e.clientX - left - width / 2;
        const yc = e.clientY - top - height / 2;
        x.set(xc / 5); // reduce intensity
        y.set(yc / 5);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
};

export default TiltCard;
