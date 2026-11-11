/**
 * Biểu giá điện sinh hoạt bậc thang (VNĐ/kWh)
 * Bậc 1: Cho kWh từ 0 - 50       : 1.806 đ/kWh
 * Bậc 2: Cho kWh từ 51 - 100     : 1.866 đ/kWh
 * Bậc 3: Cho kWh từ 101 - 200    : 2.167 đ/kWh
 * Bậc 4: Cho kWh từ 201 - 300    : 2.729 đ/kWh
 * Bậc 5: Cho kWh từ 301 - 400    : 3.050 đ/kWh
 * Bậc 6: Cho kWh từ 401 trở lên  : 3.151 đ/kWh
 */
const ELECTRICITY_TIERS = [
  { tier: 1, label: 'Bậc 1 (0 - 50 kWh)', limit: 50, price: 1806 },
  { tier: 2, label: 'Bậc 2 (51 - 100 kWh)', limit: 50, price: 1866 },
  { tier: 3, label: 'Bậc 3 (101 - 200 kWh)', limit: 100, price: 2167 },
  { tier: 4, label: 'Bậc 4 (201 - 300 kWh)', limit: 100, price: 2729 },
  { tier: 5, label: 'Bậc 5 (301 - 400 kWh)', limit: 100, price: 3050 },
  { tier: 6, label: 'Bậc 6 (Trên 400 kWh)', limit: Infinity, price: 3151 },
];

const calculateTieredElectricity = (oldElec, newElec) => {
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

const calculateInvoiceAmounts = ({
  roomPrice = 0,
  oldElec = 0,
  newElec = 0,
  oldWater = 0,
  newWater = 0,
  waterUnitPrice = Number(process.env.DEFAULT_WATER_PRICE) || 15000,
  serviceFee = Number(process.env.DEFAULT_SERVICE_FEE) || 100000,
}) => {
  const { kwhUsed, totalElecAmount, breakdown } = calculateTieredElectricity(oldElec, newElec);
  const waterUsed = Math.max(0, Number(newWater) - Number(oldWater));
  const waterAmount = Math.round(waterUsed * Number(waterUnitPrice));
  const normalizedRoomPrice = Math.round(Number(roomPrice) || 0);
  const normalizedServiceFee = Math.round(Number(serviceFee) || 0);

  const totalAmount =
    normalizedRoomPrice + totalElecAmount + waterAmount + normalizedServiceFee;

  return {
    roomPrice: normalizedRoomPrice,
    kwhUsed,
    elecAmount: totalElecAmount,
    elecBreakdown: breakdown,
    waterUsed,
    waterUnitPrice: Number(waterUnitPrice),
    waterAmount,
    serviceFee: normalizedServiceFee,
    totalAmount,
  };
};

module.exports = {
  ELECTRICITY_TIERS,
  calculateTieredElectricity,
  calculateInvoiceAmounts,
};
