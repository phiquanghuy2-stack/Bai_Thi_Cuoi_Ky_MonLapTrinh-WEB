import React from 'react';

const STATUS_MAP = {
  // Room statuses
  Trống: {
    badge:
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  'Đang thuê': {
    badge:
      'bg-indigo-500/10 text-indigo-700 border-indigo-500/25 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
    dot: 'bg-indigo-500',
  },
  'Đang sửa': {
    badge:
      'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    dot: 'bg-amber-500',
  },

  // Contract statuses
  'Hiệu lực': {
    badge:
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  'Đã kết thúc': {
    badge:
      'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    dot: 'bg-slate-400',
  },

  // Invoice statuses
  'Chưa thanh toán': {
    badge:
      'bg-rose-500/10 text-rose-700 border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    dot: 'bg-rose-500 animate-pulse',
  },
  'Đã thanh toán': {
    badge:
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },

  // Repair request statuses
  Mới: {
    badge:
      'bg-rose-500/10 text-rose-700 border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    dot: 'bg-rose-500 animate-pulse',
  },
  'Đang xử lý': {
    badge:
      'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    dot: 'bg-amber-500',
  },
  Xong: {
    badge:
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
};

const StatusBadge = ({ status, className = '' }) => {
  const style = STATUS_MAP[status] || {
    badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border backdrop-blur-md ${style.badge} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
