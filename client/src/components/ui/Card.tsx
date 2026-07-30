import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-xl shadow-xl transition-all duration-200 hover:border-primary/30 ${className}`}
    >
      {children}
    </div>
  );
};
