import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline-red' | 'white' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type AnchorProps = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#CC0000] text-white hover:bg-[#A80000] active:bg-[#900000] border border-transparent',
  secondary:
    'bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 hover:border-[#CC0000] hover:text-[#CC0000]',
  'outline-red':
    'bg-transparent text-[#CC0000] border border-[#CC0000] hover:bg-[#CC0000] hover:text-white',
  white:
    'bg-white text-[#CC0000] hover:bg-[#F5F5F5] border border-transparent',
  ghost:
    'bg-transparent text-[#1A1A1A] hover:bg-[#F5F5F5] border border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-4 py-2 text-xs font-semibold tracking-wide',
  md: 'min-h-[44px] px-6 py-2.5 text-sm font-semibold',
  lg: 'min-h-[48px] px-7 py-3 text-sm font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps | AnchorProps) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-lg whitespace-nowrap shrink-0 cursor-pointer',
    'transition-colors transition-transform duration-150 ease-out active:scale-[0.98]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000]',
    'disabled:opacity-50 disabled:pointer-events-none',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  if ('href' in props && props.href !== undefined) {
    const { href, ...anchorProps } = props;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonProps.type ?? 'button'} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
