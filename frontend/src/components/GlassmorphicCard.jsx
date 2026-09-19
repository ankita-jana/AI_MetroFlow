import React from 'react';

const gradientMap = {
  violet: 'from-violet-500 to-purple-600',
  cyan: 'from-cyan-500 to-blue-500',
  emerald: 'from-emerald-500 to-teal-500',
  blue: 'from-blue-500 to-indigo-500',
  amber: 'from-amber-500 to-orange-500',
  red: 'from-red-500 to-rose-500',
  pink: 'from-pink-500 to-rose-500',
  primary: 'from-violet-500 to-cyan-500',
  warm: 'from-amber-500 to-red-500',
  cool: 'from-cyan-500 to-violet-500',
};

const glowMap = {
  violet: 'hover:shadow-violet-500/10',
  cyan: 'hover:shadow-cyan-500/10',
  emerald: 'hover:shadow-emerald-500/10',
  blue: 'hover:shadow-blue-500/10',
  amber: 'hover:shadow-amber-500/10',
  red: 'hover:shadow-red-500/10',
  primary: 'hover:shadow-violet-500/10',
};

const GlassmorphicCard = ({ children, className = '', hoverEffect = true, gradient, glow = false }) => {
  const gradientBorder = gradient ? gradientMap[gradient] : null;
  const glowClass = glow && glowMap[gradient || 'primary'] ? glowMap[gradient || 'primary'] : '';

  return (
    <div className={`
      glass-card p-6 text-[var(--text)] transition-all duration-300
      ${glow ? `hover:shadow-lg ${glowClass}` : ''}
      ${className}
    `}>
      {gradientBorder && (
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradientBorder} rounded-t-xl`} />
      )}
      {children}
    </div>
  );
};

export default GlassmorphicCard;
