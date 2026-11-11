import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  title = 'Không có dữ liệu',
  description = 'Hiện chưa có bản ghi nào phù hợp với bộ lọc.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
