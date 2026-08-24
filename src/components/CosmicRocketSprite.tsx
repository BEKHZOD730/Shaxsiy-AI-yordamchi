import React from 'react';
import { RocketSkin } from '../types';

interface CosmicRocketSpriteProps {
  skin?: RocketSkin;
  isBoosting?: boolean;
  velocityWpm?: number;
  showLaserBeam?: boolean;
}

export const CosmicRocketSprite: React.FC<CosmicRocketSpriteProps> = ({
  skin = 'plasma_falcon',
  isBoosting = true,
  velocityWpm = 250,
  showLaserBeam = true,
}) => {
  // Color themes based on skin
  const getSkinColors = () => {
    switch (skin) {
      case 'solar_phoenix':
        return {
          primary: '#fbbf24',
          secondary: '#f97316',
          glow: '#ef4444',
          thruster1: '#ffedd5',
          thruster2: '#ea580c',
          beam: 'rgba(249, 115, 22, 0.4)',
        };
      case 'dark_matter':
        return {
          primary: '#c084fc',
          secondary: '#a855f7',
          glow: '#7e22ce',
          thruster1: '#f3e8ff',
          thruster2: '#9333ea',
          beam: 'rgba(168, 85, 247, 0.4)',
        };
      case 'emerald_staria':
        return {
          primary: '#34d399',
          secondary: '#10b981',
          glow: '#059669',
          thruster1: '#d1fae5',
          thruster2: '#047857',
          beam: 'rgba(16, 185, 129, 0.4)',
        };
      case 'plasma_falcon':
      default:
        return {
          primary: '#00f2ff',
          secondary: '#0284c7',
          glow: '#0369a1',
          thruster1: '#e0f2fe',
          thruster2: '#0284c7',
          beam: 'rgba(0, 242, 255, 0.45)',
        };
    }
  };

  const colors = getSkinColors();
  
  // Calculate flame intensity based on speed
  const speedRatio = Math.min(2.5, Math.max(0.8, velocityWpm / 200));
  const flameLength = isBoosting ? 18 * speedRatio : 6;

  return (
    <div className="relative inline-flex items-center justify-center select-none pointer-events-none">
      
      {/* Downward Laser Targeting Beam */}
      {showLaserBeam && isBoosting && (
        <div 
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 pointer-events-none opacity-80 animate-pulse"
          style={{
            background: `linear-gradient(to bottom, ${colors.primary}, transparent)`,
            boxShadow: `0 0 8px ${colors.primary}`,
          }}
        />
      )}

      {/* Main Rocket SVG Chassis */}
      <div className="relative z-10 filter drop-shadow-[0_0_10px_rgba(0,242,255,0.8)] transition-transform duration-300">
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transform rotate-45"
        >
          <defs>
            <linearGradient id={`hull-grad-${skin}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>

            <linearGradient id={`wing-grad-${skin}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.glow} />
            </linearGradient>

            <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Delta Wing */}
          <path
            d="M14 26L4 36C4 36 10 38 18 34L18 28Z"
            fill={`url(#wing-grad-${skin})`}
            stroke={colors.primary}
            strokeWidth="1.2"
          />

          {/* Right Delta Wing */}
          <path
            d="M26 14L36 4C36 4 38 10 34 18L28 18Z"
            fill={`url(#wing-grad-${skin})`}
            stroke={colors.primary}
            strokeWidth="1.2"
          />

          {/* Central Aerodynamic Hull / Fuselage */}
          <path
            d="M38 10C38 10 35 24 22 37C20 39 16 39 14 37C12 35 12 31 14 29C27 16 41 13 41 13C41 13 41 10 38 10Z"
            fill={`url(#hull-grad-${skin})`}
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Glowing Cockpit Visor Glass */}
          <ellipse
            cx="29"
            cy="19"
            rx="3.5"
            ry="2.2"
            transform="rotate(-45 29 19)"
            fill="#ffffff"
            stroke={colors.primary}
            strokeWidth="1"
            className="animate-pulse"
          />

          {/* Thruster Nozzle Exhaust Ring */}
          <ellipse
            cx="13"
            cy="35"
            rx="4"
            ry="2.5"
            transform="rotate(45 13 35)"
            fill="#050b1a"
            stroke={colors.primary}
            strokeWidth="1.5"
          />
        </svg>

        {/* Dynamic Plasma Thruster Jet Flame */}
        {isBoosting && (
          <div 
            className="absolute -bottom-2 -left-2 transform -rotate-45 pointer-events-none flex items-center justify-center"
            style={{
              filter: `drop-shadow(0 0 12px ${colors.glow})`,
            }}
          >
            {/* Outer Plasma Flame */}
            <div 
              className="rounded-full animate-pulse"
              style={{
                width: `${10 * speedRatio}px`,
                height: `${flameLength}px`,
                background: `linear-gradient(to bottom, #ffffff, ${colors.primary}, ${colors.thruster2}, transparent)`,
                clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
                animationDuration: '0.15s',
              }}
            />
            {/* Core White-Hot Flame */}
            <div 
              className="absolute top-0 rounded-full"
              style={{
                width: '4px',
                height: `${flameLength * 0.6}px`,
                background: 'linear-gradient(to bottom, #ffffff, #e0f2fe, transparent)',
                clipPath: 'polygon(50% 100%, 10% 0%, 90% 0%)',
              }}
            />
          </div>
        )}
      </div>

      {/* Cosmic Plasma Particle Trail Aura */}
      <div 
        className="absolute -inset-2 rounded-full opacity-60 pointer-events-none blur-sm"
        style={{
          background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};
