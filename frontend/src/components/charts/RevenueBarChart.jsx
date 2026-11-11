import React, { useMemo } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Biểu đồ Doanh thu 12 tháng chuẩn Fintech Executive Dashboard
 */
const RevenueBarChart = ({ data = [], year }) => {
  const { maxVal, totalPaidYear, totalUnpaidYear, bestMonth } = useMemo(() => {
    const highest = data.reduce(
      (max, item) => Math.max(max, (item.paidRevenue || 0) + (item.unpaidRevenue || 0)),
      0
    );
    const paidSum = data.reduce((sum, item) => sum + (item.paidRevenue || 0), 0);
    const unpaidSum = data.reduce((sum, item) => sum + (item.unpaidRevenue || 0), 0);
    const top = [...data].sort((a, b) => (b.paidRevenue || 0) - (a.paidRevenue || 0))[0];

    return {
      maxVal: highest > 0 ? highest : 10000000,
      totalPaidYear: paidSum,
      totalUnpaidYear: unpaidSum,
      bestMonth: top && top.paidRevenue > 0 ? top : null,
    };
  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-luxury">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="w-4 h-4" />
            Báo cáo tài chính • MongoDB Aggregation Pipeline
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Biểu Đồ Dòng Tiền & Doanh Thu 12 Tháng ({year})
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Tổng thực thu năm {year}
            </span>
            <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPaidYear)}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Công nợ chưa thu
            </span>
            <span className="text-lg font-extrabold font-mono text-rose-600 dark:text-rose-400">
              {formatCurrency(totalUnpaidYear)}
            </span>
          </div>

          {bestMonth && (
            <>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
              <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Đỉnh doanh thu: Tháng {bestMonth.month}
                </span>
                <span className="text-xs font-extrabold font-mono text-slate-900 dark:text-white">
                  {formatCurrency(bestMonth.paidRevenue)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Khu vực vẽ đồ thị cột kết hợp đường lưới */}
      <div className="relative mt-8">
        {/* Đường kẻ ngang tham chiếu */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
          {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
            <div
              key={ratio}
              className="w-full border-b border-dashed border-slate-100 dark:border-slate-800/80 flex items-center"
            >
              <span className="text-[10px] font-mono text-slate-400 -mt-4 bg-white dark:bg-slate-900 pr-2">
                { `${Math.round((maxVal * ratio) / 1000000)}M` }
              </span>
            </div>
          ))}
        </div>

        <div className="relative z-10 pl-10 grid grid-cols-12 gap-2 sm:gap-4 items-end h-64 pt-4">
          {data.map((item) => {
            const paidHeightPct = Math.round(((item.paidRevenue || 0) / maxVal) * 100);
            const unpaidHeightPct = Math.round(((item.unpaidRevenue || 0) / maxVal) * 100);

            return (
              <div
                key={item.month}
                className="flex flex-col items-center justify-end h-full group relative"
              >
                {/* Floating Executive Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 absolute -top-20 z-30 bg-slate-950/95 backdrop-blur-md text-white text-[11px] rounded-xl py-2.5 px-3.5 whitespace-nowrap shadow-xl border border-white/10">
                  <p className="font-extrabold text-amber-300 mb-1">
                    Kỳ Tháng {item.month}/{year} ({item.invoiceCount} HĐ)
                  </p>
                  <p className="text-emerald-400 font-mono">
                    ● Thực thu: {formatCurrency(item.paidRevenue)}
                  </p>
                  {item.unpaidRevenue > 0 && (
                    <p className="text-rose-400 font-mono">
                      ● Còn nợ: {formatCurrency(item.unpaidRevenue)}
                    </p>
                  )}
                </div>

                <div className="w-full max-w-[36px] flex flex-col justify-end h-full rounded-t-xl overflow-hidden bg-slate-100/70 dark:bg-slate-800/40 p-0.5">
                  {unpaidHeightPct > 0 && (
                    <div
                      style={{ height: `${Math.max(unpaidHeightPct, 5)}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-rose-500 to-amber-400 mb-0.5 transition-all duration-500"
                    />
                  )}
                  {paidHeightPct > 0 && (
                    <div
                      style={{ height: `${Math.max(paidHeightPct, 5)}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 via-blue-500 to-cyan-400 group-hover:brightness-110 shadow-glow transition-all duration-500"
                    />
                  )}
                </div>

                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  T{item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chú thích */}
      <div className="flex items-center justify-end gap-6 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-gradient-to-tr from-indigo-600 to-cyan-400 inline-block" />
          Doanh thu đã thanh toán
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-gradient-to-tr from-rose-500 to-amber-400 inline-block" />
          Công nợ chưa thanh toán
        </span>
      </div>
    </div>
  );
};

export default RevenueBarChart;
