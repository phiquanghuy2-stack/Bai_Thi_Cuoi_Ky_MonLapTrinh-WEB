import React from 'react';

/**
 * Controlled Input Component có hiển thị text báo lỗi đỏ ngay dưới input theo đúng đặc tả
 */
const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...rest
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border px-3.5 py-2 text-sm transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-9' : ''
          } ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-900'
              : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900'
          } disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed`}
          {...rest}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : (
        helperText && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )
      )}
    </div>
  );
};

export default InputField;
