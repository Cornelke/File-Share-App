
import React from 'react';
import { Wifi, Share2 } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconSize = {
    sm: 16,
    md: 24,
    lg: 36
  };
  
  const textSize = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl'
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Wifi 
          size={iconSize[size]} 
          className="text-brand-purple animate-pulse-soft" 
        />
        <Share2 
          size={iconSize[size] * 0.65} 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-brand-blue" 
        />
      </div>
      
      {showText && (
        <span className={`font-bold ${textSize[size]} bg-gradient-to-r from-brand-purple to-brand-blue text-transparent bg-clip-text`}>
          FileShare
        </span>
      )}
    </div>
  );
};

export default Logo;
