import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Logo chính thức HVA HOMESTAY
 * Tái tạo chuẩn xác biểu tượng mái nhà đỏ chữ HVA liền nét + chữ HVA HOMESTAY từ thiết kế gốc
 * Hỗ trợ hiển thị kèm câu thơ slogan: "Hiên nhà đón gió ngàn phương, Về đây rũ mỏi, An tường giấc say."
 */
const BrandLogo = ({ to = '/', subtitle = '', showSlogan = false, size = 'md' }) => {
  const iconHeight = size === 'lg' ? 54 : size === 'sm' ? 34 : 42;
  const iconWidth = Math.round(iconHeight * 1.18);

  return (
    <Link to={to} className="inline-flex flex-col group select-none">
      <div className="inline-flex items-center gap-3">
        {/* Biểu tượng mái nhà + chữ nghệ thuật HVA màu đỏ Coral (#FA5252) chuẩn theo ảnh mẫu */}
        <svg
          width={iconWidth}
          height={iconHeight}
          viewBox="0 0 120 102"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105 shrink-0"
        >
          {/* Mái nhà có ống khói bên phải + Cạnh trái kéo xuống thành chân trái chữ H */}
          <path
            d="M12 92V44C12 39 14.5 35 18.5 32L52 9.5C55.5 7.2 59.5 7.2 63 9.5L81 21.5V14C81 12.3 82.3 11 84 11H89C90.7 11 92 12.3 92 14V29L102 35.5"
            stroke="#FA5252"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Nét ngang chữ H và tay nắm cửa nhỏ bên dưới */}
          <path
            d="M13 66C19 62 27 62 34 62"
            stroke="#FA5252"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <line
            x1="27"
            y1="75"
            x2="27"
            y2="80"
            stroke="#FA5252"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Chữ H nối liền sang chữ V và vòm chữ A nghệ thuật */}
          <path
            d="M34 92V47C34 40.5 41.5 39.5 44 46L59 90C60.2 93.2 63.8 93.2 65 90L79.5 47C83 37 96.5 37 100.5 47L111 81C113 87.5 108.5 92.5 102.5 92.5C95.5 92.5 89 87 89 79.5C89 71 96.5 65.5 104 63"
            stroke="#FA5252"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Nét chéo trong lòng chữ A */}
          <path
            d="M78 92L90.5 52"
            stroke="#FA5252"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Chữ HVA HOMESTAY màu đen than (#1E2229) chuẩn tỷ lệ ảnh mẫu */}
        <div className="flex flex-col justify-center leading-none">
          <span
            className={`${
              size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl'
            } font-extrabold tracking-[0.14em] text-[#1E2229] dark:text-white`}
          >
            HVA
          </span>
          <span
            className={`${
              size === 'lg' ? 'text-xs' : 'text-[10px]'
            } font-bold tracking-[0.22em] text-[#1E2229] dark:text-slate-300 mt-1`}
          >
            {subtitle || 'HOMESTAY'}
          </span>
        </div>
      </div>

      {showSlogan && (
        <p className="mt-2.5 text-xs sm:text-sm font-serif italic text-neutral-600 dark:text-slate-300 leading-relaxed">
          “Hiên nhà đón gió ngàn phương, Về đây rũ mỏi, An tường giấc say.”
        </p>
      )}
    </Link>
  );
};

export default BrandLogo;
