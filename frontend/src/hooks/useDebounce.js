import { useState, useEffect } from 'react';

/**
 * Custom Hook 1: useDebounce
 * Trì hoãn cập nhật giá trị tìm kiếm/lọc, có cleanup clearTimeout trong useEffect
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function hủy timer khi value hoặc delay thay đổi hoặc component unmount
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
