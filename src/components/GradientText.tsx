import React from 'react';

interface GradientTextProps {
  colors: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  className?: string;
  children: React.ReactNode;
}

const GradientText: React.FC<GradientTextProps> = ({
  colors,
  animationSpeed = 3,
  showBorder = false,
  className = '',
  children
}) => {
  return (
    <span 
      className={`${showBorder ? 'border border-white/20 dark:border-white/10' : ''} ${className} text-black dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#FAFBFD] dark:via-[#F97316] dark:to-[#889ACC] dark:animate-gradient`}
    >
      {children}
    </span>
  );
};

export default GradientText; 