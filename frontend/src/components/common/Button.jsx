import React from 'react';

const VARIANT_CLASSES = {
  primary:
    'bg-gradient-to-r from-[#FF385C] via-[#E61E4D] to-[#D70466] hover:brightness-105 text-white shadow-sm focus:ring-rose-500',
  secondary:
    'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-neutral-200 dark:border-slate-700 focus:ring-neutral-400',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
  warning:
    'bg-amber-500 hover:bg-amber-600 text-white shadow-sm focus:ring-amber-400',
  outline:
    'border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-neutral-900 dark:hover:border-slate-500 hover:bg-neutral-50 text-neutral-800 dark:text-slate-200',
};

const SIZE_CLASSES = {
  sm: 'px-3.5 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-xs sm:text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-sm sm:text-base rounded-xl',
};

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary
      } ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
