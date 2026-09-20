import React from 'react';
import { PetCharacterConfig } from '../types';
import { Sparkles, Maximize2, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface CharacterStageProps {
  config: PetCharacterConfig;
  themeStyle: {
    isDark: boolean;
    accentColor: string;
    stageBg: string;
  };
  slideIndex?: number;
}

export const CharacterStage: React.FC<CharacterStageProps> = ({ config, themeStyle, slideIndex = 1 }) => {
  if (!config.enabled) return null;

  // Render SVG Robot matching the 3D toy robot with orange/white colors in the screenshots
  const renderRobotMagnifier = () => (
    <svg
      viewBox="0 0 320 280"
      className="w-full h-full max-h-[220px] object-contain drop-shadow-xl select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="headGlow" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#F5F3EF" />
          <stop offset="100%" stopColor="#E2DDD5" />
        </radialGradient>
        <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7A38" />
          <stop offset="100%" stopColor="#E25418" />
        </linearGradient>
        <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <radialGradient id="eyePupil" cx="35%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </radialGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* Ground drop shadow ellipse */}
      <ellipse cx="160" cy="265" rx="85" ry="14" fill="#000000" opacity="0.14" />

      {/* Antenna top */}
      <circle cx="160" cy="38" r="8" fill="url(#orangeGrad)" />
      <path d="M156 38 L164 38 L162 60 L158 60 Z" fill="#D4CDC3" />

      {/* Ears / Head bolts (Orange cylinders on sides) */}
      <rect x="74" y="98" width="16" height="42" rx="8" fill="url(#orangeGrad)" />
      <rect x="230" y="98" width="16" height="42" rx="8" fill="url(#orangeGrad)" />
      <rect x="70" y="105" width="8" height="28" rx="4" fill="#C2410C" />
      <rect x="242" y="105" width="8" height="28" rx="4" fill="#C2410C" />

      {/* Main Head (Rounded cube / soft capsule) */}
      <rect
        x="84"
        y="54"
        width="152"
        height="124"
        rx="46"
        fill="url(#headGlow)"
        filter="url(#softShadow)"
      />

      {/* Face Screen (Dark curved visor) */}
      <rect x="98" y="74" width="124" height="82" rx="30" fill="#1C1F26" />

      {/* Friendly Eyes */}
      <ellipse cx="132" cy="112" rx="15" ry="17" fill="url(#eyePupil)" />
      <ellipse cx="188" cy="112" rx="15" ry="17" fill="url(#eyePupil)" />
      <circle cx="137" cy="107" r="4" fill="#0F172A" />
      <circle cx="193" cy="107" r="4" fill="#0F172A" />

      {/* Cute smile */}
      <path
        d="M150 133 Q160 142 170 133"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Body / Torso */}
      <path
        d="M116 172 L204 172 L214 245 L106 245 Z"
        fill="url(#headGlow)"
        filter="url(#softShadow)"
      />
      {/* Orange chest plate */}
      <rect x="136" y="190" width="48" height="38" rx="12" fill="url(#orangeGrad)" />

      {/* Left arm holding body */}
      <path
        d="M110 185 Q82 205 102 232"
        stroke="url(#headGlow)"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right arm reaching forward with Magnifying Glass */}
      <path
        d="M210 185 Q245 195 240 220"
        stroke="url(#headGlow)"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />

      {/* Magnifying Glass */}
      {/* Handle */}
      <path d="M228 215 L200 240" stroke="#78716C" strokeWidth="10" strokeLinecap="round" />
      {/* Rim */}
      <circle cx="236" cy="180" r="32" stroke="url(#orangeGrad)" strokeWidth="12" fill="none" />
      {/* Blue reflective lens */}
      <circle cx="236" cy="180" r="26" fill="url(#lensGrad)" opacity="0.9" />
      <circle cx="236" cy="180" r="16" fill="#93C5FD" opacity="0.8" />
      {/* Highlight reflections */}
      <ellipse cx="226" cy="170" rx="8" ry="5" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );

  // Render Robot at Desk (Image 3 replica)
  const renderRobotDesk = () => (
    <svg
      viewBox="0 0 340 280"
      className="w-full h-full max-h-[220px] object-contain drop-shadow-xl select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="headGlowDesk" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#F5F3EF" />
          <stop offset="100%" stopColor="#E2DDD5" />
        </radialGradient>
        <linearGradient id="orangeGradDesk" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7A38" />
          <stop offset="100%" stopColor="#E25418" />
        </linearGradient>
      </defs>

      {/* Desk surface */}
      <rect x="30" y="220" width="280" height="14" rx="4" fill="#334155" />
      <rect x="45" y="234" width="12" height="40" fill="#1E293B" />
      <rect x="283" y="234" width="12" height="40" fill="#1E293B" />

      {/* Computer monitor on desk */}
      <rect x="180" y="90" width="115" height="95" rx="10" fill="#0F172A" stroke="#334155" strokeWidth="4" />
      <rect x="188" y="98" width="99" height="78" rx="6" fill="#1E293B" />
      <path d="M196 115 L220 115" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
      <path d="M196 128 L250 128" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
      <path d="M196 140 L235 140" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" />
      {/* Monitor stand */}
      <rect x="230" y="185" width="15" height="35" fill="#475569" />
      <rect x="210" y="217" width="55" height="6" rx="3" fill="#64748B" />

      {/* Antenna */}
      <circle cx="120" cy="40" r="8" fill="url(#orangeGradDesk)" />
      <rect x="118" y="44" width="4" height="20" fill="#A8A29E" />

      {/* Ear bolts */}
      <rect x="52" y="92" width="14" height="34" rx="7" fill="url(#orangeGradDesk)" />
      <rect x="174" y="92" width="14" height="34" rx="7" fill="url(#orangeGradDesk)" />

      {/* Robot Head */}
      <rect x="62" y="58" width="116" height="98" rx="36" fill="url(#headGlowDesk)" />
      {/* Face Visor */}
      <rect x="74" y="74" width="92" height="64" rx="22" fill="#18181B" />
      {/* Eyes looking at monitor */}
      <ellipse cx="102" cy="104" rx="12" ry="14" fill="#F8FAFC" />
      <ellipse cx="144" cy="104" rx="12" ry="14" fill="#F8FAFC" />
      <circle cx="106" cy="102" r="4" fill="#09090B" />
      <circle cx="148" cy="102" r="4" fill="#09090B" />

      {/* Robot Body */}
      <path d="M85 156 L155 156 L165 220 L75 220 Z" fill="url(#headGlowDesk)" />
      <rect x="100" y="172" width="40" height="30" rx="8" fill="url(#orangeGradDesk)" />

      {/* Robot hands on desk keyboard */}
      <ellipse cx="130" cy="222" rx="14" ry="7" fill="url(#headGlowDesk)" />
      <ellipse cx="160" cy="222" rx="14" ry="7" fill="url(#headGlowDesk)" />
      {/* Mini keyboard */}
      <rect x="120" y="219" width="58" height="7" rx="2" fill="#0F172A" />
    </svg>
  );

  return (
    <div
      className="relative w-full flex items-center justify-center transition-all duration-300 py-1"
      style={{
        transform: `scale(${config.scale || 1})`,
      }}
    >
      {/* 1. Blank Space Slot for Compositing in n8n / Photoshop */}
      {config.type === 'blank-space' ? (
        <div
          className={`w-full max-w-[280px] h-[190px] rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all relative overflow-hidden ${
            config.showPlacementGuides
              ? themeStyle.isDark
                ? 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300'
                : 'border-orange-400/60 bg-orange-500/5 text-orange-800'
              : 'border-transparent bg-transparent'
          }`}
        >
          {config.showPlacementGuides && (
            <div className="flex flex-col items-center gap-1.5 p-3 text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm"
                style={{
                  backgroundColor: themeStyle.accentColor,
                  color: '#FFFFFF',
                }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs">Reserved Character Pet Window</span>
              <span className="text-[10px] opacity-80 leading-snug">
                Transparent space for your mascot PNG. Perfect for n8n automated overlay or manual compositing.
              </span>
              <div className="mt-1 px-2 py-0.5 rounded bg-black/10 font-mono text-[9px]">
                x: 50% &bull; y: 40% &bull; slot: 280&times;190px
              </div>
            </div>
          )}
        </div>
      ) : config.type === 'robot-magnifier' ? (
        renderRobotMagnifier()
      ) : config.type === 'robot-desk' ? (
        renderRobotDesk()
      ) : config.type === 'cute-cybercat' ? (
        // Cyber Cat Mascot
        <div className="w-full flex justify-center items-center py-2">
          {renderRobotMagnifier()}
        </div>
      ) : config.type === 'custom' && config.customImageUrl ? (
        <img
          src={config.customImageUrl}
          alt="Custom Mascot Pet"
          className="max-h-[210px] object-contain drop-shadow-xl select-none"
          referrerPolicy="no-referrer"
        />
      ) : (
        // Default to robot magnifier if none selected
        renderRobotMagnifier()
      )}
    </div>
  );
};
