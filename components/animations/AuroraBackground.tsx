'use client';

import { useEffect, useState } from 'react';

export default function AuroraBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Aurora Orb 1 - Main Mint */}
      <div
        className="aurora-orb aurora-orb-1"
        style={{
          background: 'radial-gradient(circle, rgba(0, 245, 160, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Aurora Orb 2 - Cyan */}
      <div
        className="aurora-orb aurora-orb-2"
        style={{
          background: 'radial-gradient(circle, rgba(0, 217, 245, 0.35) 0%, transparent 70%)',
        }}
      />

      {/* Aurora Orb 3 - Deep Violet accent */}
      <div
        className="aurora-orb aurora-orb-3"
        style={{
          background: 'radial-gradient(circle, rgba(91, 33, 182, 0.25) 0%, transparent 70%)',
        }}
      />

      {/* Aurora Orb 4 - Secondary Mint */}
      <div
        className="aurora-orb aurora-orb-4"
        style={{
          background: 'radial-gradient(circle, rgba(0, 245, 160, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Center vignette for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, transparent 0%, rgba(5, 5, 5, 0.7) 100%)',
        }}
      />
    </div>
  );
}
