import React from 'react';

/**
 * Controlled Select Component có validate và hiển thị lỗi ngay dưới select
 */
const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error = '',
  required = false,
  disabled = false,
  placeholder = '',
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-lg border px-3.5 py-2 text-sm transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-100'
        } disabled:opacity-60`}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectField;
