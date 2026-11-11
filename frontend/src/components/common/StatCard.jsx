import React from 'react';

const COLOR_STYLES = {
  blue: {
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25',
    glow: 'from-blue-500/10 via-transparent to-transparent',
    border: 'hover:border-blue-500/40',
  },
  emerald: {
    iconBg:
      'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25',
    glow: 'from-emerald-500/10 via-transparent to-transparent',
    border: 'hover:border-emerald-500/40',
  },
  amber: {
    iconBg:
      'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
    glow: 'from-amber-500/10 via-transparent to-transparent',
    border: 'hover:border-amber-500/40',
  },
  rose: {
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25',
    glow: 'from-rose-500/10 via-transparent to-transparent',
    border: 'hover:border-rose-500/40',
  },
  indigo: {
    iconBg:
      'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25',
    glow: 'from-indigo-500/10 via-transparent to-transparent',
    border: 'hover:border-indigo-500/40',
  },
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const palette = COLOR_STYLES[color] || COLOR_STYLES.blue;

  return (
    <div
      className={`relative overflow-hidden bg-white dark:bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-luxury transition-all duration-300 hover:-translate-y-0.5 ${palette.border}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${palette.glow} pointer-events-none`}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl shrink-0 ${palette.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
