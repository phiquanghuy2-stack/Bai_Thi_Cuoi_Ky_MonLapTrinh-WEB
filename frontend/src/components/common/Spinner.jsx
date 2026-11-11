import React from 'react';

const Spinner = ({ label = 'Đang tải dữ liệu...', size = 'md' }) => {
  const dims = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
        className={`${dims} border-3 border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
      {label && <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
};

export default Spinner;
