import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DoorOpen,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Mail,
  FileDown,
  TableProperties,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import axiosClient, { SERVER_BASE_URL } from '../../api/axiosClient';
import StatCard from '../../components/common/StatCard';
import RevenueBarChart from '../../components/charts/RevenueBarChart';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import AlertBanner from '../../components/common/AlertBanner';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboardPage = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data: stats, loading, error } = useFetch('/dashboard/stats', { year });

  const [sendingId, setSendingId] = useState(null);
  const [alertInfo, setAlertInfo] = useState({
    type: '',
    message: '',
    linkUrl: '',
    linkLabel: '',
  });

  const handleRemindInvoice = async (invoiceId) => {
    setSendingId(invoiceId);
    setAlertInfo({ type: '', message: '', linkUrl: '', linkLabel: '' });
    try {
      const res = await axiosClient.post(`/invoices/${invoiceId}/remind`);
      setAlertInfo({
        type: 'success',
        message: res.data.message,
        linkUrl: res.data.data?.previewUrl || '',
        linkLabel: res.data.data?.previewUrl
          ? '📬 Nhấn vào đây để xem nội dung Email nhắc nợ vừa gửi (Ethereal Preview)'
          : '',
      });
    } catch (err) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.message || 'Gửi email nhắc nợ thất bại!',
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleDownloadPDF = (invoiceId) => {
    const token = localStorage.getItem('smartmotel_token');
    window.open(`${SERVER_BASE_URL}/api/invoices/${invoiceId}/pdf?token=${token}`, '_blank');
  };

  if (loading) return <Spinner label="Đang tổng hợp dữ liệu Aggregation Pipeline..." />;

  if (error || !stats) {
    return <AlertBanner type="error" message={error || 'Không thể tải Dashboard'} />;
  }

  const { roomSummary, unpaidRooms, revenue12Months, totalYearlyPaidRevenue, totalCurrentDebt } =
    stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Dashboard Thống Kê Chủ Trọ
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dữ liệu tổng hợp trực tiếp từ MongoDB Aggregation Pipeline ($group, $lookup, $unwind)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>

          <Link to="/admin/utility-sheet">
            <Button variant="primary" size="sm">
              <TableProperties className="w-4 h-4" />
              Bảng Nhập Điện Nước
            </Button>
          </Link>
        </div>
      </div>

      <AlertBanner
        type={alertInfo.type}
        message={alertInfo.message}
        linkUrl={alertInfo.linkUrl}
        linkLabel={alertInfo.linkLabel}
        onClose={() => setAlertInfo({ type: '', message: '', linkUrl: '', linkLabel: '' })}
      />

      {/* (1) Thống kê Số lượng phòng trống & Doanh thu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Số lượng phòng Trống"
          value={`${roomSummary.emptyRooms} / ${roomSummary.totalRooms} phòng`}
          subtitle={`Đang thuê: ${roomSummary.occupiedRooms} • Đang sửa: ${roomSummary.repairingRooms}`}
          icon={DoorOpen}
          color="emerald"
        />

        <StatCard
          title={`Doanh thu đã thu (${year})`}
          value={formatCurrency(totalYearlyPaidRevenue)}
          subtitle="Tổng các hóa đơn Đã thanh toán"
          icon={TrendingUp}
          color="blue"
        />

        <StatCard
          title="Tổng tiền phòng đang nợ"
          value={formatCurrency(totalCurrentDebt)}
          subtitle={`${unpaidRooms.length} phòng có hóa đơn Chưa thanh toán`}
          icon={AlertTriangle}
          color="rose"
        />

        <StatCard
          title="Hợp đồng Hiệu lực"
          value={`${stats.activeContractsCount} hợp đồng`}
          subtitle={`${stats.pendingRepairs} yêu cầu sửa chữa chờ xử lý`}
          icon={CheckCircle2}
          color="indigo"
        />
      </div>

      {/* (3) Biểu đồ doanh thu 12 tháng */}
      <RevenueBarChart data={revenue12Months} year={year} />

      {/* (2) Danh sách các phòng nợ tiền */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Danh Sách Các Phòng Đang Nợ Tiền ({unpaidRooms.length} phòng)
            </h3>
            <p className="text-xs text-slate-500">
              Truy vấn bằng $lookup liên kết Invoices → Rooms → Users và $group theo phòng
            </p>
          </div>
        </div>

        {unpaidRooms.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Tuyệt vời! Hiện không có phòng nào nợ tiền.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4">Phòng</th>
                  <th className="py-3.5 px-4">Người thuê</th>
                  <th className="py-3.5 px-4">Các kỳ hóa đơn nợ</th>
                  <th className="py-3.5 px-4">Tổng tiền nợ</th>
                  <th className="py-3.5 px-4 text-right">Nhắc nợ & Xuất PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {unpaidRooms.map((item) => {
                  const latestUnpaidInvoice = item.invoices[item.invoices.length - 1];
                  return (
                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3.5 px-4 font-extrabold text-blue-600 dark:text-blue-400">
                        Phòng {item.roomNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold">{item.tenantName || 'Chưa cập nhật'}</p>
                        <p className="text-xs text-slate-400">
                          {item.tenantPhone} • {item.tenantEmail}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.invoices.map((inv) => (
                            <span
                              key={inv.invoiceId}
                              className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-medium"
                            >
                              T{inv.month}/{inv.year}: {formatCurrency(inv.totalAmount)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-rose-600 dark:text-rose-400">
                        {formatCurrency(item.totalDebt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {latestUnpaidInvoice && (
                          <div className="inline-flex items-center gap-2">
                            <Button
                              variant="warning"
                              size="sm"
                              loading={sendingId === latestUnpaidInvoice.invoiceId}
                              onClick={() => handleRemindInvoice(latestUnpaidInvoice.invoiceId)}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Gửi Email Nhắc Nợ
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPDF(latestUnpaidInvoice.invoiceId)}
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              PDF
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
