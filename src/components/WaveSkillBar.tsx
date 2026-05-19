import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * WaveSkillBar shows a skill bar that fills with a wave animation.
 * The animation starts when the component enters the viewport (lazy). 
 */
const WaveSkillBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="relative h-4 bg-muted rounded overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-primary"
          initial={{ width: 0 }}
          animate={{ width: inView ? `${value}%` : 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ backgroundImage: "var(--gradient-gold)" }}
        >
          {/* Wave effect via CSS keyframes */}
          <div className="absolute inset-0 bg-primary/30 animate-wave" />
        </motion.div>
      </div>
    </div>
  );
};

export default WaveSkillBar;
