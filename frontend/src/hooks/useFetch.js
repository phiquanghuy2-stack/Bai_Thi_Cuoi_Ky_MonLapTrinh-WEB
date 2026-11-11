import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

/**
 * Custom Hook 2: useFetch
 * Tự động gọi API với trạng thái loading, error, data và có cleanup bằng AbortController
 */
export const useFetch = (url, params = {}, immediate = true) => {
  const [data, setData] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const serializedParams = JSON.stringify(params);

  const execute = useCallback(
    async (signal) => {
      if (!url) return null;
      setLoading(true);
      setError(null);

      try {
        const parsedParams = JSON.parse(serializedParams);
        const response = await axiosClient.get(url, {
          params: parsedParams,
          signal,
        });
        setData(response.data?.data ?? response.data);
        if (response.data?.pagination) {
          setPagination(response.data.pagination);
        }
        return response.data;
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return null;
        }
        const message =
          err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải dữ liệu!';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, serializedParams]
  );

  useEffect(() => {
    if (!immediate) return undefined;

    const controller = new AbortController();
    execute(controller.signal);

    // Cleanup function hủy request đang chạy khi component unmount hoặc dependency đổi
    return () => {
      controller.abort();
    };
  }, [execute, immediate]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    return execute(controller.signal);
  }, [execute]);

  return { data, setData, pagination, loading, error, refetch };
};

export default useFetch;
