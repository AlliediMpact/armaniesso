import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 justify-center whitespace-nowrap';

  const variants = {
    primary:
      'bg-orange text-dark-bg hover:bg-orange-light hover:shadow-lg hover:shadow-orange/50',
    secondary:
      'bg-dark-card text-orange border border-orange hover:bg-orange hover:text-dark-bg transition-all',
    outline:
      'border-2 border-orange text-orange hover:bg-orange hover:text-dark-bg hover:border-orange-light',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
