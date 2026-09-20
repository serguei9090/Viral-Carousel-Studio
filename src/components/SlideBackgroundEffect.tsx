import React from 'react';
import { BackgroundEffect } from '../types';

interface SlideBackgroundEffectProps {
  effect?: BackgroundEffect;
  isDark: boolean;
  accentColor?: string;
}

export const SlideBackgroundEffect: React.FC<SlideBackgroundEffectProps> = ({
  effect = 'none',
  isDark,
  accentColor = '#FF3366',
}) => {
  if (!effect || effect === 'none') {
    return null;
  }

  if (effect === 'colorful-splash') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Colorful Designer Splash Mesh Blobs */}
        {/* Blob 1: Top-Right Luminous Rose / Fuchsia */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full transition-opacity duration-300"
          style={{
            background: isDark
              ? 'radial-gradient(circle, #F43F5E 0%, #E11D48 50%, transparent 75%)'
              : 'radial-gradient(circle, #FDA4AF 0%, #FB7185 60%, transparent 80%)',
            filter: 'blur(56px)',
            opacity: isDark ? 0.45 : 0.35,
          }}
        />

        {/* Blob 2: Center-Left Electric Violet / Purple */}
        <div
          className="absolute top-1/3 -left-20 w-72 h-72 rounded-full transition-opacity duration-300"
          style={{
            background: isDark
              ? 'radial-gradient(circle, #8B5CF6 0%, #6D28D9 55%, transparent 75%)'
              : 'radial-gradient(circle, #DDD6FE 0%, #C4B5FD 60%, transparent 80%)',
            filter: 'blur(64px)',
            opacity: isDark ? 0.42 : 0.32,
          }}
        />

        {/* Blob 3: Bottom-Right Cyan Azure / Mint */}
        <div
          className="absolute -bottom-14 -right-12 w-64 h-64 rounded-full transition-opacity duration-300"
          style={{
            background: isDark
              ? 'radial-gradient(circle, #06B6D4 0%, #0284C7 55%, transparent 75%)'
              : 'radial-gradient(circle, #BAE6FD 0%, #7DD3FC 60%, transparent 80%)',
            filter: 'blur(58px)',
            opacity: isDark ? 0.38 : 0.28,
          }}
        />

        {/* Blob 4: Center Warm Accent Halo behind Character */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
            filter: 'blur(70px)',
            opacity: isDark ? 0.22 : 0.18,
          }}
        />

        {/* Fine Designer Tactile Grain Texture Overlay (eliminates banding) */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(${isDark ? '#FFFFFF' : '#000000'} 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />
      </div>
    );
  }

  if (effect === 'aurora-glow') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Flowing Aurora Curtains */}
        <div
          className="absolute -top-32 left-0 right-0 h-96 opacity-40 rotate-12 scale-125"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, transparent 0%, #10B981 30%, #06B6D4 60%, #6366F1 90%, transparent 100%)'
              : 'linear-gradient(135deg, transparent 0%, #A7F3D0 30%, #BAE6FD 60%, #C7D2FE 90%, transparent 100%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -bottom-20 left-0 right-0 h-80 opacity-30 -rotate-6"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)'
              : 'linear-gradient(90deg, #E9D5FF 0%, #FBCFE8 50%, #FED7AA 100%)',
            filter: 'blur(65px)',
          }}
        />
      </div>
    );
  }

  if (effect === 'studio-spotlight') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Focused Overhead Studio Spotlight */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[65%] rounded-full opacity-35"
          style={{
            background: isDark
              ? `radial-gradient(ellipse at top, ${accentColor} 0%, rgba(255,255,255,0.04) 50%, transparent 80%)`
              : `radial-gradient(ellipse at top, ${accentColor} 0%, rgba(0,0,0,0.02) 60%, transparent 85%)`,
            filter: 'blur(50px)',
          }}
        />
      </div>
    );
  }

  if (effect === 'subtle-grid') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Modern Tech Dot Grid with radial mask */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(${isDark ? '#94A3B8' : '#64748B'} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)',
          }}
        />
      </div>
    );
  }

  return null;
};
