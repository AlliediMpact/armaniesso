import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = true,
}) => {
  return (
    <div
      className={`
        bg-dark-card border border-dark-border rounded-xl p-6 md:p-8
        transition-all duration-300
        ${hoverable ? 'hover-glow hover:border-orange/50' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
