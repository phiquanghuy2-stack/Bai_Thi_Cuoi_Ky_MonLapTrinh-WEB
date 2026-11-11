import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const AlertBanner = ({ type = 'info', message, linkUrl, linkLabel, onClose }) => {
  if (!message) return null;

  const styles = {
    error:
      'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200',
    success:
      'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-200',
  };

  const Icon =
    type === 'error' ? AlertCircle : type === 'success' ? CheckCircle2 : Info;

  return (
    <div
      className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-sm ${
        styles[type] || styles.info
      }`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">{message}</p>
          {linkUrl && (
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-1 underline font-semibold hover:opacity-80"
            >
              {linkLabel || 'Xem chi tiết tại đây'}
            </a>
          )}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
