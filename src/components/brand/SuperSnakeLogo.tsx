import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SuperSnakeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  withLink?: boolean;
  withGlow?: boolean;
}

export function SuperSnakeLogo({
  className = '',
  size = 'md',
  showText = true,
  withLink = true,
  withGlow = false,
}: SuperSnakeLogoProps) {
  const dimensions = {
    sm: { width: 18, height: 32 },
    md: { width: 22, height: 40 },
    lg: { width: 36, height: 64 },
    hero: { width: 64, height: 114 },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-3.5 group select-none ${className}`}>
      <div className={`relative transition-transform duration-500 ease-out group-hover:scale-105 ${withGlow ? 'filter drop-shadow-[0_0_12px_rgba(4,252,33,0.4)]' : ''}`}>
        <Image
          src="/supersnake logonobg.png"
          alt="SuperSnake"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain transition-all duration-300 group-hover:brightness-110"
          priority
        />
      </div>

      {showText && (
        <span className="font-sans font-bold text-sm tracking-[0.25em] text-white transition-colors duration-300 group-hover:text-white/90">
          SUPERSNAKE
        </span>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" aria-label="SUPERSNAKE Homepage" className="inline-block focus:outline-none focus-visible:ring-1 focus-visible:ring-snake-green">
        {content}
      </Link>
    );
  }

  return content;
}
