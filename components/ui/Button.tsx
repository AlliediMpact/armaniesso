import React from 'react';
import Link from 'next/link';

type CommonProps = {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
};

type ButtonElement = React.ButtonHTMLAttributes<HTMLButtonElement> & CommonProps & {
  href?: never;
  type?: 'button' | 'submit' | 'reset';
};

type AnchorElement = React.AnchorHTMLAttributes<HTMLAnchorElement> & CommonProps & {
  href: string;
};

type ButtonProps = ButtonElement | AnchorElement;

export const Button: React.FC<ButtonProps> = (props) => {
  const {
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    href,
    ...restProps
  } = props as ButtonProps;

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

  const typedVariant: 'primary' | 'secondary' | 'outline' = variant ?? 'primary';
  const typedSize: 'sm' | 'md' | 'lg' = size ?? 'md';
  const buttonClassName = `${baseStyles} ${variants[typedVariant]} ${sizes[typedSize]} ${className}`;

  if (href) {
    const isExternal = /^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
    const { target, rel, ...anchorProps } = restProps as React.AnchorHTMLAttributes<HTMLAnchorElement>;

    if (isExternal) {
      return (
        <a
          href={href}
          target={target}
          rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
          className={buttonClassName}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={buttonClassName} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = restProps as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      type={type}
      className={buttonClassName}
      {...buttonProps}
    >
      {children}
    </button>
  );
};
