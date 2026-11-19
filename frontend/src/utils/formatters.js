import { getImageUrl } from '../api/axiosClient';

export const ELECTRICITY_TIERS = [
  { tier: 1, label: 'Bậc 1 (0 - 50 kWh)', shortLabel: '0 - 50 kWh', limit: 50, price: 1806 },
  { tier: 2, label: 'Bậc 2 (51 - 100 kWh)', shortLabel: '51 - 100 kWh', limit: 50, price: 1866 },
  { tier: 3, label: 'Bậc 3 (101 - 200 kWh)', shortLabel: '101 - 200 kWh', limit: 100, price: 2167 },
  { tier: 4, label: 'Bậc 4 (201 - 300 kWh)', shortLabel: '201 - 300 kWh', limit: 100, price: 2729 },
  { tier: 5, label: 'Bậc 5 (301 - 400 kWh)', shortLabel: '301 - 400 kWh', limit: 100, price: 3050 },
  { tier: 6, label: 'Bậc 6 (Trên 400 kWh)', shortLabel: '> 400 kWh', limit: Infinity, price: 3151 },
];

export const WATER_UNIT_PRICE = 15000;
export const DEFAULT_SERVICE_FEE = 100000;

// Bộ sưu tập ảnh nội thất căn hộ mẫu (lưu trong MongoDB, phục vụ qua /api/images/:name)
// Tự động hiển thị theo từng mã phòng khi phòng chưa upload ảnh
const LUXURY_ROOM_IMAGES = [
  '1522708323590-d24dbb6b0267',
  '1502672260266-1c1ef2d93688',
  '1560448204-e02f11c3d0e2',
  '1493809842364-78817add7ffb',
  '1536376072261-38c75010e6c9',
  '1554995207-c18c203602cb',
  '1598928506311-c55ded91a20c',
  '1512918728675-ed5a9ecdebfd',
  '1484154218962-a197022b5858',
  '1505693416388-ac5ce068fe85',
].map((id) => getImageUrl(`/api/images/${id}.jpg`));

export const getRoomFallbackImage = (roomNumber = '') => {
  const hash = String(roomNumber)
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return LUXURY_ROOM_IMAGES[hash % LUXURY_ROOM_IMAGES.length];
};

export const calculateTieredElectricityPreview = (oldElec, newElec) => {
  const kwhUsed = Math.max(0, Number(newElec) - Number(oldElec));
  let remaining = kwhUsed;
  let totalElecAmount = 0;
  const breakdown = [];

  for (const item of ELECTRICITY_TIERS) {
    if (remaining <= 0) break;
    const kwhInTier = Math.min(remaining, item.limit);
    const amount = kwhInTier * item.price;
    totalElecAmount += amount;
    breakdown.push({
      tier: item.tier,
      label: item.label,
      kwh: kwhInTier,
      unitPrice: item.price,
      amount,
    });
    remaining -= kwhInTier;
  }

  return {
    kwhUsed,
    totalElecAmount: Math.round(totalElecAmount),
    breakdown,
  };
};

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('vi-VN')} ₫`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
