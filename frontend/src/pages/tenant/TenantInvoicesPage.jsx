import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, FileDown, ShieldAlert } from 'lucide-react';
import { fetchInvoices } from '../../store/slices/invoiceSlice';
import axiosClient, { SERVER_BASE_URL } from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import TieredElecBreakdownModal from '../../components/invoices/TieredElecBreakdownModal';
import AlertBanner from '../../components/common/AlertBanner';
import { formatCurrency } from '../../utils/formatters';

const TenantInvoicesPage = () => {
  const dispatch = useDispatch();
  const { items: invoices, pagination, loading } = useSelector((state) => state.invoices);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // State phục vụ kiểm thử phân quyền 403 Forbidden (Khi người thuê truyền ID hóa đơn phòng khác)
  const [testForbiddenId, setTestForbiddenId] = useState('');
  const [forbiddenTestResult, setForbiddenTestResult] = useState(null);

  useEffect(() => {
    dispatch(
      fetchInvoices({
        page,
        limit: 8,
        status: statusFilter,
      })
    );
  }, [dispatch, page, statusFilter]);

  const handleDownloadPDF = (invoiceId) => {
    const token = localStorage.getItem('smartmotel_token');
    window.open(`${SERVER_BASE_URL}/api/invoices/${invoiceId}/pdf?token=${token}`, '_blank');
  };

  const handleTestAccessOtherRoomInvoice = async (e) => {
    e.preventDefault();
    if (!testForbiddenId.trim()) return;
    setForbiddenTestResult(null);
    try {
      const res = await axiosClient.get(`/invoices/${testForbiddenId.trim()}`);
      setForbiddenTestResult({
        type: 'success',
        message: `200 OK: Xem thành công hóa đơn phòng ${res.data.data?.room?.roomNumber} (Thuộc quyền sở hữu của bạn).`,
      });
    } catch (err) {
      setForbiddenTestResult({
        type: 'error',
        message: `HTTP ${err.response?.status || 400}: ${
          err.response?.data?.message || 'Lỗi truy cập'
        }`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Hóa Đơn Tiền Trọ Của Tôi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Xem chi tiết tiền điện tính theo bậc thang và tải hóa đơn định dạng PDF
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Chưa thanh toán">Chưa thanh toán</option>
          <option value="Đã thanh toán">Đã thanh toán</option>
        </select>
      </div>

      {loading ? (
        <Spinner label="Đang tải danh sách hóa đơn..." />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="Chưa có hóa đơn nào"
          description="Hiện tại bạn chưa có hóa đơn nào khớp với bộ lọc."
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4">Kỳ HĐ</th>
                  <th className="py-3.5 px-4">Phòng</th>
                  <th className="py-3.5 px-4">Tiền phòng</th>
                  <th className="py-3.5 px-4">Điện (Bậc thang)</th>
                  <th className="py-3.5 px-4">Nước</th>
                  <th className="py-3.5 px-4">Tổng cộng</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {invoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold">
                      Tháng {inv.month}/{inv.year}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600 dark:text-blue-400">
                      {inv.room?.roomNumber}
                    </td>
                    <td className="py-3.5 px-4">{formatCurrency(inv.roomPrice)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-amber-600">
                        {formatCurrency(inv.elecAmount)}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {inv.oldElec} → {inv.newElec} ({inv.newElec - inv.oldElec} kWh)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span>{formatCurrency(inv.waterAmount)}</span>
                      <span className="block text-[11px] text-slate-400">
                        {inv.oldWater} → {inv.newWater} ({inv.newWater - inv.oldWater} m³)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-rose-600 dark:text-rose-400">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Chi tiết
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDownloadPDF(inv._id)}
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          </div>
        </div>
      )}

      {/* Khung kiểm tra phân quyền khắt khe 403 Forbidden theo đúng đặc tả Phần 2.1 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          Kiểm thử bảo mật RBAC (403 Forbidden khi truyền ID hóa đơn phòng khác)
        </div>
        <p className="text-xs text-slate-500">
          Nhập thử một <code>Invoice ID</code> của phòng khác vào ô dưới đây để kiểm tra API{' '}
          <code>GET /api/invoices/:id</code> trả về đúng mã <strong>403 Forbidden</strong>:
        </p>
        <form onSubmit={handleTestAccessOtherRoomInvoice} className="flex gap-2 max-w-xl">
          <input
            type="text"
            value={testForbiddenId}
            onChange={(e) => setTestForbiddenId(e.target.value)}
            placeholder="Nhập ID hóa đơn bất kỳ để test quyền truy cập..."
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
          />
          <Button type="submit" variant="secondary" size="sm">
            Gọi API Kiểm Tra
          </Button>
        </form>
        {forbiddenTestResult && (
          <AlertBanner
            type={forbiddenTestResult.type}
            message={forbiddenTestResult.message}
            onClose={() => setForbiddenTestResult(null)}
          />
        )}
      </div>

      <TieredElecBreakdownModal
        invoice={selectedInvoice}
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        isAdmin={false}
      />
    </div>
  );
};

export default TenantInvoicesPage;
