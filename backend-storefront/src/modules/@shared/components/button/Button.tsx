import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size, children, className, ...props }: ButtonProps) {
  const cls = ['btn', variant, size].filter(Boolean).join(' ');
  return (
    <button className={className || cls} {...props}>
      {children}
    </button>
  );
}
