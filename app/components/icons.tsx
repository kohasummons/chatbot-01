import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export function DentalIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`feather feather-smile ${className}`}
    >
      <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" />
      <path d="M7 9a1 1 0 0 1 0-2 1 1 0 0 1 0 2z" />
      <path d="M17 9a1 1 0 0 1 0-2 1 1 0 0 1 0 2z" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    </svg>
  );
}

export function MasonryIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function VercelIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 76 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
    </svg>
  );
} 