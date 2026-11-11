import React from 'react';
import { Link } from 'react-router-dom';
import { DoorOpen, FileText, Wrench, Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TenantDashboardPage = () => {
  const { user } = useAuth();
  const { data: contracts, loading: loadingContracts } = useFetch('/contracts');
  const { data: invoices, loading: loadingInvoices } = useFetch('/invoices');
  const { data: repairs, loading: loadingRepairs } = useFetch('/repair-requests');

  if (loadingContracts || loadingInvoices || loadingRepairs) {
    return <Spinner label="Đang tải thông tin phòng thuê của bạn..." />;
  }

  const activeContract =
    (contracts || []).find((c) => c.status === 'Hiệu lực') || user?.activeContract;
  const unpaidInvoices = (invoices || []).filter((i) => i.status === 'Chưa thanh toán');
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Tổng Quan Phòng Thuê
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Theo dõi hợp đồng thuê, hóa đơn hàng tháng và tiến độ sửa chữa của phòng bạn
        </p>
      </div>

      {unpaidInvoices.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-800 dark:text-rose-200">
                Bạn có {unpaidInvoices.length} hóa đơn chưa thanh toán ({formatCurrency(totalUnpaid)})
              </h4>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-0.5">
                Vui lòng kiểm tra chi tiết tiền điện bậc thang, tiền nước và thanh toán đúng hạn.
              </p>
            </div>
          </div>
          <Link to="/tenant/invoices">
            <Button variant="danger" size="sm">
              Xem hóa đơn ngay
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Phòng đang thuê"
          value={activeContract?.room?.roomNumber || 'Chưa có'}
          subtitle={
            activeContract?.room
              ? `Giá thuê: ${formatCurrency(activeContract.room.price)}/tháng`
              : 'Liên hệ chủ trọ để ký hợp đồng'
          }
          icon={DoorOpen}
          color="blue"
        />

        <StatCard
          title="Dư nợ cần thanh toán"
          value={formatCurrency(totalUnpaid)}
          subtitle={`${unpaidInvoices.length} hóa đơn chưa thanh toán`}
          icon={FileText}
          color={totalUnpaid > 0 ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Yêu cầu sửa chữa"
          value={`${(repairs || []).length} yêu cầu`}
          subtitle="Báo hỏng kèm hình ảnh trực tuyến"
          icon={Wrench}
          color="amber"
        />
      </div>

      {/* Chi tiết hợp đồng hiện tại */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Thông Tin Hợp Đồng Thuê Phòng
          </h3>
          {activeContract && <StatusBadge status={activeContract.status} />}
        </div>

        {activeContract ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <p className="text-xs text-slate-500">Số phòng & Diện tích</p>
              <p className="font-bold mt-1">
                Phòng {activeContract.room?.roomNumber} ({activeContract.room?.area} m²)
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <p className="text-xs text-slate-500">Giá thuê cố định</p>
              <p className="font-bold text-blue-600 mt-1">
                {formatCurrency(activeContract.room?.price)}/tháng
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <p className="text-xs text-slate-500">Thời hạn hợp đồng</p>
              <p className="font-bold mt-1">
                {formatDate(activeContract.startDate)} → {formatDate(activeContract.endDate)}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <p className="text-xs text-slate-500">Tiền đặt cọc</p>
              <p className="font-bold text-emerald-600 mt-1">
                {formatCurrency(activeContract.deposit)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Tài khoản của bạn hiện chưa có hợp đồng Hiệu lực nào.
          </p>
        )}
      </div>
    </div>
  );
};

export default TenantDashboardPage;
