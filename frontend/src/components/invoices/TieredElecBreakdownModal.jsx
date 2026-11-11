import React from 'react';
import { FileDown, Mail, Zap, Droplets, Home } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import {
  calculateTieredElectricityPreview,
  formatCurrency,
} from '../../utils/formatters';
import { SERVER_BASE_URL } from '../../api/axiosClient';

const TieredElecBreakdownModal = ({
  invoice,
  isOpen,
  onClose,
  isAdmin = false,
  onSendReminder,
  sendingReminder = false,
}) => {
  if (!invoice) return null;

  const { kwhUsed, breakdown } = calculateTieredElectricityPreview(
    invoice.oldElec,
    invoice.newElec
  );
  const waterUsed = invoice.newWater - invoice.oldWater;

  const handleDownloadPDF = () => {
    const token = localStorage.getItem('smartmotel_token');
    const url = `${SERVER_BASE_URL}/api/invoices/${invoice._id}/pdf?token=${token}`;
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết Hóa đơn Phòng ${invoice.room?.roomNumber || ''} - Tháng ${invoice.month}/${invoice.year}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-xs text-slate-500">Người thuê</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {invoice.tenant?.name || 'Khách thuê phòng'}{' '}
              {invoice.tenant?.phone ? `(${invoice.tenant.phone})` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={invoice.status} />
          </div>
        </div>

        {/* Các khoản thu chính */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Home className="w-4 h-4 text-blue-500" />
              Tiền phòng cố định
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(invoice.roomPrice)}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Zap className="w-4 h-4 text-amber-500" />
              Tiền điện ({invoice.oldElec} → {invoice.newElec}: {kwhUsed} kWh)
            </div>
            <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1">
              {formatCurrency(invoice.elecAmount)}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Droplets className="w-4 h-4 text-cyan-500" />
              Tiền nước ({invoice.oldWater} → {invoice.newWater}: {waterUsed} m³)
            </div>
            <p className="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-1">
              {formatCurrency(invoice.waterAmount)}
            </p>
          </div>
        </div>

        {/* Bảng diễn giải bậc thang tiền điện */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Bảng tính tiền điện theo Bậc thang ({kwhUsed} kWh)
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-3">Bậc thang</th>
                  <th className="py-2.5 px-3 text-right">Số kWh</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {breakdown.map((row) => (
                  <tr key={row.tier}>
                    <td className="py-2 px-3 font-medium">{row.label}</td>
                    <td className="py-2 px-3 text-right">{row.kwh} kWh</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(row.unitPrice)}</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {formatCurrency(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tổng kết */}
        <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Đã bao gồm phí dịch vụ chung: <strong>{formatCurrency(invoice.serviceFee)}</strong>
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              TỔNG CỘNG THANH TOÁN
            </p>
          </div>
          <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(invoice.totalAmount)}
          </span>
        </div>

        {/* Nút xuất PDF & Gửi email nhắc nợ */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {isAdmin && invoice.status === 'Chưa thanh toán' && onSendReminder && (
            <Button
              variant="warning"
              onClick={() => onSendReminder(invoice)}
              loading={sendingReminder}
            >
              <Mail className="w-4 h-4" />
              Gửi Email Nhắc Nợ
            </Button>
          )}
          <Button variant="primary" onClick={handleDownloadPDF}>
            <FileDown className="w-4 h-4" />
            Xuất Hóa Đơn PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TieredElecBreakdownModal;
