import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Save,
  FileDown,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calculator,
} from 'lucide-react';
import {
  fetchUtilitySheet,
  createInvoiceThunk,
  updateInvoiceThunk,
  toggleInvoiceStatusThunk,
} from '../../store/slices/invoiceSlice';
import axiosClient, { SERVER_BASE_URL } from '../../api/axiosClient';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import AlertBanner from '../../components/common/AlertBanner';
import TieredElecBreakdownModal from '../../components/invoices/TieredElecBreakdownModal';
import {
  calculateTieredElectricityPreview,
  formatCurrency,
  WATER_UNIT_PRICE,
} from '../../utils/formatters';

/**
 * MÀN HÌNH ĐẶC BIỆT TRONG ĐẶC TẢ:
 * - Form nhập điện nước là 1 BẢNG (Table) liệt kê tất cả các phòng.
 * - Sửa chỉ số trực tiếp trên dòng.
 * - NẾU chỉ số mới < chỉ số cũ: Báo lỗi đỏ NGAY TẠI DÒNG ĐÓ (Inline Error) và KHÔNG CHO GỬI dòng đó.
 */
const AdminUtilityTablePage = () => {
  const dispatch = useDispatch();
  const { sheetRows, sheetLoading } = useSelector((state) => state.invoices);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // State lưu dữ liệu chỉnh sửa trực tiếp trên từng dòng của bảng (Không mutate state gốc)
  const [editableRows, setEditableRows] = useState([]);
  const [savingRowId, setSavingRowId] = useState(null);
  const [sendingRowId, setSendingRowId] = useState(null);
  const [selectedModalInvoice, setSelectedModalInvoice] = useState(null);
  const [banner, setBanner] = useState({
    type: '',
    message: '',
    linkUrl: '',
    linkLabel: '',
  });

  const loadSheet = useCallback(() => {
    dispatch(fetchUtilitySheet({ month, year }));
  }, [dispatch, month, year]);

  useEffect(() => {
    loadSheet();
  }, [loadSheet]);

  useEffect(() => {
    setEditableRows(
      sheetRows.map((row) => ({
        ...row,
        oldElec: Number(row.oldElec) || 0,
        newElec: Number(row.newElec) || 0,
        oldWater: Number(row.oldWater) || 0,
        newWater: Number(row.newWater) || 0,
        serviceFee: Number(row.serviceFee) || 100000,
        rowServerError: '',
      }))
    );
  }, [sheetRows]);

  // Cập nhật giá trị ô input ngay trên dòng
  const handleCellChange = (roomId, field, rawValue) => {
    const numericVal = rawValue === '' ? '' : Number(rawValue);
    setEditableRows((prevRows) =>
      prevRows.map((row) =>
        row.roomId === roomId
          ? {
              ...row,
              [field]: numericVal,
              rowServerError: '',
            }
          : row
      )
    );
  };

  // Kiểm tra lỗi Inline ngay tại dòng: chỉ số mới < chỉ số cũ
  const getRowValidation = (row) => {
    const oldE = Number(row.oldElec);
    const newE = Number(row.newElec);
    const oldW = Number(row.oldWater);
    const newW = Number(row.newWater);

    const elecInvalid = row.newElec === '' || row.oldElec === '' || newE < oldE || oldE < 0;
    const waterInvalid = row.newWater === '' || row.oldWater === '' || newW < oldW || oldW < 0;

    let inlineError = '';
    if (newE < oldE) {
      inlineError = `Lỗi dòng P.${row.roomNumber}: Chỉ số điện mới (${newE}) nhỏ hơn chỉ số điện cũ (${oldE})!`;
    } else if (newW < oldW) {
      inlineError = `Lỗi dòng P.${row.roomNumber}: Chỉ số nước mới (${newW}) nhỏ hơn chỉ số nước cũ (${oldW})!`;
    }

    const { kwhUsed, totalElecAmount, breakdown } = calculateTieredElectricityPreview(
      oldE,
      Math.max(oldE, newE)
    );
    const waterUsed = Math.max(0, newW - oldW);
    const waterAmount = waterUsed * WATER_UNIT_PRICE;
    const totalAmount =
      Number(row.roomPrice || 0) +
      totalElecAmount +
      waterAmount +
      Number(row.serviceFee || 0);

    return {
      elecInvalid,
      waterInvalid,
      hasInlineError: Boolean(inlineError),
      inlineError,
      kwhUsed,
      elecAmount: totalElecAmount,
      elecBreakdown: breakdown,
      waterUsed,
      waterAmount,
      totalAmount,
    };
  };

  // Lưu / Lập hóa đơn cho 1 dòng cụ thể
  const handleSaveRow = async (row) => {
    const validation = getRowValidation(row);

    // Chốt chặn không cho gửi dòng nếu chỉ số mới < chỉ số cũ
    if (validation.hasInlineError) {
      return;
    }

    setSavingRowId(row.roomId);
    setBanner({ type: '', message: '', linkUrl: '', linkLabel: '' });

    try {
      if (row.existingInvoice?._id) {
        // Cập nhật hóa đơn đã có của tháng/năm này
        await dispatch(
          updateInvoiceThunk({
            id: row.existingInvoice._id,
            payload: {
              oldElec: Number(row.oldElec),
              newElec: Number(row.newElec),
              oldWater: Number(row.oldWater),
              newWater: Number(row.newWater),
              serviceFee: Number(row.serviceFee),
            },
          })
        ).unwrap();

        setBanner({
          type: 'success',
          message: `Đã cập nhật chỉ số & tính lại hóa đơn Phòng ${row.roomNumber} (Tháng ${month}/${year})!`,
        });
      } else {
        // Tạo mới hóa đơn cho phòng trong tháng/năm này
        await dispatch(
          createInvoiceThunk({
            room: row.roomId,
            month,
            year,
            oldElec: Number(row.oldElec),
            newElec: Number(row.newElec),
            oldWater: Number(row.oldWater),
            newWater: Number(row.newWater),
            serviceFee: Number(row.serviceFee),
          })
        ).unwrap();

        setBanner({
          type: 'success',
          message: `Đã lập hóa đơn Phòng ${row.roomNumber} (Tháng ${month}/${year}) thành công!`,
        });
      }

      loadSheet();
    } catch (errorMsg) {
      setEditableRows((prev) =>
        prev.map((r) =>
          r.roomId === row.roomId ? { ...r, rowServerError: String(errorMsg) } : r
        )
      );
    } finally {
      setSavingRowId(null);
    }
  };

  const handleTogglePaid = async (row) => {
    if (!row.existingInvoice?._id) return;
    const nextStatus =
      row.existingInvoice.status === 'Đã thanh toán' ? 'Chưa thanh toán' : 'Đã thanh toán';

    try {
      await dispatch(
        toggleInvoiceStatusThunk({
          id: row.existingInvoice._id,
          status: nextStatus,
        })
      ).unwrap();
      setBanner({
        type: 'success',
        message: `Phòng ${row.roomNumber}: Đã chuyển trạng thái sang "${nextStatus}"!`,
      });
    } catch (errMsg) {
      setBanner({ type: 'error', message: String(errMsg) });
    }
  };

  const handleSendReminder = async (invoiceId, roomNumber) => {
    setSendingRowId(invoiceId);
    setBanner({ type: '', message: '', linkUrl: '', linkLabel: '' });
    try {
      const res = await axiosClient.post(`/invoices/${invoiceId}/remind`);
      setBanner({
        type: 'success',
        message: `Phòng ${roomNumber}: ${res.data.message}`,
        linkUrl: res.data.data?.previewUrl || '',
        linkLabel: res.data.data?.previewUrl
          ? '📬 Xem bản xem trước Email nhắc nợ vừa gửi (Ethereal Email)'
          : '',
      });
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.response?.data?.message || 'Không thể gửi email nhắc nợ!',
      });
    } finally {
      setSendingRowId(null);
    }
  };

  const handleDownloadPDF = (invoiceId) => {
    const token = localStorage.getItem('smartmotel_token');
    window.open(`${SERVER_BASE_URL}/api/invoices/${invoiceId}/pdf?token=${token}`, '_blank');
  };

  const openBreakdownModal = (row, calc) => {
    setSelectedModalInvoice({
      _id: row.existingInvoice?._id || row.roomId,
      room: { roomNumber: row.roomNumber },
      tenant: row.tenant,
      month,
      year,
      oldElec: Number(row.oldElec),
      newElec: Number(row.newElec),
      oldWater: Number(row.oldWater),
      newWater: Number(row.newWater),
      roomPrice: Number(row.roomPrice),
      elecAmount: calc.elecAmount,
      waterAmount: calc.waterAmount,
      serviceFee: Number(row.serviceFee),
      totalAmount: calc.totalAmount,
      status: row.existingInvoice?.status || 'Chưa thanh toán',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Bảng Nhập Chỉ Số Điện Nước & Lập Hóa Đơn
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sửa chỉ số trực tiếp trên từng dòng. Nếu <strong>chỉ số mới &lt; chỉ số cũ</strong>, hệ
            thống báo lỗi đỏ ngay tại dòng đó (Inline Error) và khóa nút gửi của dòng đó.
          </p>
        </div>

        {/* Bộ chọn Kỳ Tháng / Năm */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-500 pl-2">Kỳ hóa đơn:</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold"
          >
            {Array.from({ length: 12 }, (_, idx) => idx + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold"
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AlertBanner
        type={banner.type}
        message={banner.message}
        linkUrl={banner.linkUrl}
        linkLabel={banner.linkLabel}
        onClose={() => setBanner({ type: '', message: '', linkUrl: '', linkLabel: '' })}
      />

      {sheetLoading ? (
        <Spinner label={`Đang tải bảng chỉ số điện nước tháng ${month}/${year}...`} />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 uppercase">
                <tr>
                  <th className="py-3.5 px-3">Phòng / Người thuê</th>
                  <th className="py-3.5 px-3">Điện cũ</th>
                  <th className="py-3.5 px-3">Điện mới</th>
                  <th className="py-3.5 px-3">Nước cũ</th>
                  <th className="py-3.5 px-3">Nước mới</th>
                  <th className="py-3.5 px-3">Điện bậc thang</th>
                  <th className="py-3.5 px-3">Tổng tiền</th>
                  <th className="py-3.5 px-3">Trạng thái</th>
                  <th className="py-3.5 px-3 text-right">Thao tác dòng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {editableRows.map((row) => {
                  const calc = getRowValidation(row);
                  const hasError = calc.hasInlineError || Boolean(row.rowServerError);

                  return (
                    <React.Fragment key={row.roomId}>
                      <tr
                        className={`transition-colors ${
                          hasError
                            ? 'bg-rose-50/70 dark:bg-rose-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                              {row.roomNumber}
                            </span>
                            <StatusBadge status={row.roomStatus} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                            {row.tenant?.name || 'Chưa có khách'} • Phòng:{' '}
                            {formatCurrency(row.roomPrice)}
                          </p>
                        </td>

                        {/* Điện cũ */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            value={row.oldElec}
                            onChange={(e) =>
                              handleCellChange(row.roomId, 'oldElec', e.target.value)
                            }
                            className="w-20 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-semibold text-center"
                          />
                        </td>

                        {/* Điện mới */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            value={row.newElec}
                            onChange={(e) =>
                              handleCellChange(row.roomId, 'newElec', e.target.value)
                            }
                            className={`w-20 rounded-lg border px-2 py-1.5 text-xs font-bold text-center focus:outline-none focus:ring-2 ${
                              calc.elecInvalid
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 focus:ring-rose-300'
                                : 'border-blue-400 dark:border-blue-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-blue-200'
                            }`}
                          />
                        </td>

                        {/* Nước cũ */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            value={row.oldWater}
                            onChange={(e) =>
                              handleCellChange(row.roomId, 'oldWater', e.target.value)
                            }
                            className="w-18 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-semibold text-center"
                          />
                        </td>

                        {/* Nước mới */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            value={row.newWater}
                            onChange={(e) =>
                              handleCellChange(row.roomId, 'newWater', e.target.value)
                            }
                            className={`w-18 rounded-lg border px-2 py-1.5 text-xs font-bold text-center focus:outline-none focus:ring-2 ${
                              calc.waterInvalid
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 focus:ring-rose-300'
                                : 'border-blue-400 dark:border-blue-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-blue-200'
                            }`}
                          />
                        </td>

                        {/* Tiền điện bậc thang & nước */}
                        <td className="py-3 px-3">
                          <p className="font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(calc.elecAmount)}{' '}
                            <span className="text-[11px] font-normal text-slate-400">
                              ({calc.kwhUsed} kWh)
                            </span>
                          </p>
                          <p className="text-[11px] text-cyan-600 dark:text-cyan-400">
                            Nước: {formatCurrency(calc.waterAmount)} ({calc.waterUsed} m³)
                          </p>
                        </td>

                        {/* Tổng tiền dự tính */}
                        <td className="py-3 px-3">
                          <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">
                            {formatCurrency(calc.totalAmount)}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            + DV: {formatCurrency(row.serviceFee)}
                          </span>
                        </td>

                        {/* Trạng thái hóa đơn */}
                        <td className="py-3 px-3">
                          {row.existingInvoice ? (
                            <button
                              type="button"
                              onClick={() => handleTogglePaid(row)}
                              title="Nhấn để đổi trạng thái Thanh toán"
                              className="cursor-pointer hover:opacity-80"
                            >
                              <StatusBadge status={row.existingInvoice.status} />
                            </button>
                          ) : (
                            <span className="text-[11px] italic text-slate-400">
                              Chưa lập HĐ T{month}
                            </span>
                          )}
                        </td>

                        {/* Nút thao tác trên dòng */}
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              variant={row.existingInvoice ? 'primary' : 'success'}
                              size="sm"
                              disabled={calc.hasInlineError}
                              loading={savingRowId === row.roomId}
                              onClick={() => handleSaveRow(row)}
                            >
                              <Save className="w-3.5 h-3.5" />
                              {row.existingInvoice ? 'Cập nhật' : 'Lập HĐ'}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openBreakdownModal(row, calc)}
                              title="Xem diễn giải bậc thang điện"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                            </Button>

                            {row.existingInvoice && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleDownloadPDF(row.existingInvoice._id)}
                                  title="Xuất PDF"
                                >
                                  <FileDown className="w-3.5 h-3.5" />
                                </Button>

                                {row.existingInvoice.status === 'Chưa thanh toán' && (
                                  <Button
                                    variant="warning"
                                    size="sm"
                                    loading={sendingRowId === row.existingInvoice._id}
                                    onClick={() =>
                                      handleSendReminder(
                                        row.existingInvoice._id,
                                        row.roomNumber
                                      )
                                    }
                                    title="Gửi email nhắc nợ"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* INLINE ERROR NGAY TẠI DÒNG ĐÓ NẾU CHỈ SỐ MỚI < CHỈ SỐ CŨ */}
                      {(calc.hasInlineError || row.rowServerError) && (
                        <tr className="bg-rose-100/90 dark:bg-rose-950/70">
                          <td colSpan={9} className="py-2 px-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{calc.inlineError || row.rowServerError}</span>
                              <span className="font-normal text-rose-600 dark:text-rose-400">
                                (Hệ thống đã khóa nút gửi của dòng này cho tới khi bạn nhập chỉ số mới
                                ≥ chỉ số cũ)
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TieredElecBreakdownModal
        invoice={selectedModalInvoice}
        isOpen={Boolean(selectedModalInvoice)}
        onClose={() => setSelectedModalInvoice(null)}
        isAdmin
      />
    </div>
  );
};

export default AdminUtilityTablePage;
