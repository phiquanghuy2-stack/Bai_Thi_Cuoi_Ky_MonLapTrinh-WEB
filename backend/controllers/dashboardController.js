const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const RepairRequest = require('../models/RepairRequest');
const Contract = require('../models/Contract');

// @desc    Thống kê Dashboard Admin (BẮT BUỘC dùng MongoDB Aggregation Pipeline: $group, $lookup)
// @route   GET /api/dashboard/stats?year=2026
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const selectedYear = Number(req.query.year) || new Date().getFullYear();

    // 1. AGGREGATION PIPELINE: Thống kê số lượng phòng theo trạng thái ('Trống', 'Đang thuê', 'Đang sửa')
    const roomStatusAgg = await Room.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
        },
      },
    ]);

    const roomSummary = {
      totalRooms: 0,
      emptyRooms: 0,
      occupiedRooms: 0,
      repairingRooms: 0,
    };

    roomStatusAgg.forEach((item) => {
      roomSummary.totalRooms += item.count;
      if (item._id === 'Trống') roomSummary.emptyRooms = item.count;
      if (item._id === 'Đang thuê') roomSummary.occupiedRooms = item.count;
      if (item._id === 'Đang sửa') roomSummary.repairingRooms = item.count;
    });

    // 2. AGGREGATION PIPELINE ($match -> $lookup -> $unwind -> $group -> $sort):
    // Danh sách các phòng đang nợ tiền ('Chưa thanh toán')
    const unpaidRoomsAgg = await Invoice.aggregate([
      {
        $match: {
          status: 'Chưa thanh toán',
        },
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'roomInfo',
        },
      },
      {
        $unwind: '$roomInfo',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'tenant',
          foreignField: '_id',
          as: 'tenantInfo',
        },
      },
      {
        $unwind: {
          path: '$tenantInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$room',
          roomNumber: { $first: '$roomInfo.roomNumber' },
          roomPrice: { $first: '$roomInfo.price' },
          tenantName: { $first: '$tenantInfo.name' },
          tenantPhone: { $first: '$tenantInfo.phone' },
          tenantEmail: { $first: '$tenantInfo.email' },
          unpaidCount: { $sum: 1 },
          totalDebt: { $sum: '$totalAmount' },
          invoices: {
            $push: {
              invoiceId: '$_id',
              month: '$month',
              year: '$year',
              totalAmount: '$totalAmount',
              elecAmount: '$elecAmount',
              waterAmount: '$waterAmount',
            },
          },
        },
      },
      {
        $sort: {
          totalDebt: -1,
          roomNumber: 1,
        },
      },
    ]);

    // 3. AGGREGATION PIPELINE ($match -> $group -> $sort):
    // Biểu đồ doanh thu 12 tháng trong năm được chọn
    const monthlyRevenueAgg = await Invoice.aggregate([
      {
        $match: {
          year: selectedYear,
        },
      },
      {
        $group: {
          _id: '$month',
          paidRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Đã thanh toán'] }, '$totalAmount', 0],
            },
          },
          unpaidRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Chưa thanh toán'] }, '$totalAmount', 0],
            },
          },
          totalBilled: { $sum: '$totalAmount' },
          roomRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Đã thanh toán'] }, '$roomPrice', 0],
            },
          },
          elecRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Đã thanh toán'] }, '$elecAmount', 0],
            },
          },
          waterRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Đã thanh toán'] }, '$waterAmount', 0],
            },
          },
          invoiceCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Chuẩn hóa đủ 12 tháng (Tháng 1 -> Tháng 12) để hiển thị biểu đồ 12 tháng
    const revenueMap = {};
    monthlyRevenueAgg.forEach((m) => {
      revenueMap[m._id] = m;
    });

    const revenue12Months = Array.from({ length: 12 }, (_, idx) => {
      const monthNum = idx + 1;
      const item = revenueMap[monthNum] || {};
      return {
        month: monthNum,
        label: `Tháng ${monthNum}`,
        paidRevenue: item.paidRevenue || 0,
        unpaidRevenue: item.unpaidRevenue || 0,
        totalBilled: item.totalBilled || 0,
        roomRevenue: item.roomRevenue || 0,
        elecRevenue: item.elecRevenue || 0,
        waterRevenue: item.waterRevenue || 0,
        invoiceCount: item.invoiceCount || 0,
      };
    });

    // Tổng hợp nhanh các chỉ số phụ trợ
    const [pendingRepairs, activeContractsCount] = await Promise.all([
      RepairRequest.countDocuments({ status: { $in: ['Mới', 'Đang xử lý'] } }),
      Contract.countDocuments({ status: 'Hiệu lực' }),
    ]);

    const totalYearlyPaidRevenue = revenue12Months.reduce(
      (sum, m) => sum + m.paidRevenue,
      0
    );
    const totalCurrentDebt = unpaidRoomsAgg.reduce(
      (sum, r) => sum + r.totalDebt,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        year: selectedYear,
        roomSummary,
        activeContractsCount,
        pendingRepairs,
        totalYearlyPaidRevenue,
        totalCurrentDebt,
        unpaidRooms: unpaidRoomsAgg,
        revenue12Months,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
