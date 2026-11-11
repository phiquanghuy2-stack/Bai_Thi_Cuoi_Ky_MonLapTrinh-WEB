import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// Async Thunk: Lấy danh sách hóa đơn có lọc & phân trang
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/invoices', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải danh sách hóa đơn!'
      );
    }
  }
);

// Async Thunk: Lấy dữ liệu Bảng nhập chỉ số điện nước theo Tháng/Năm (Tất cả phòng)
export const fetchUtilitySheet = createAsyncThunk(
  'invoices/fetchUtilitySheet',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/invoices/sheet', {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải bảng chỉ số điện nước!'
      );
    }
  }
);

// Async Thunk: Lập hóa đơn mới cho 1 phòng
export const createInvoiceThunk = createAsyncThunk(
  'invoices/createInvoice',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/invoices', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lập hóa đơn!');
    }
  }
);

// Async Thunk: Cập nhật hóa đơn (chỉ số hoặc trạng thái)
export const updateInvoiceThunk = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/invoices/${id}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật hóa đơn!');
    }
  }
);

// Async Thunk: Đổi trạng thái thanh toán hóa đơn
export const toggleInvoiceStatusThunk = createAsyncThunk(
  'invoices/toggleStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/invoices/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán!'
      );
    }
  }
);

const initialState = {
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  sheetRows: [],
  sheetMonth: new Date().getMonth() + 1,
  sheetYear: new Date().getFullYear(),
  loading: false,
  sheetLoading: false,
  error: null,
};

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearInvoiceError: (state) => ({
      ...state,
      error: null,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => ({
        ...state,
        loading: true,
        error: null,
      }))
      .addCase(fetchInvoices.fulfilled, (state, action) => ({
        ...state,
        loading: false,
        items: action.payload.data || [],
        pagination: action.payload.pagination || state.pagination,
      }))
      .addCase(fetchInvoices.rejected, (state, action) => ({
        ...state,
        loading: false,
        error: action.payload,
      }))
      .addCase(fetchUtilitySheet.pending, (state) => ({
        ...state,
        sheetLoading: true,
        error: null,
      }))
      .addCase(fetchUtilitySheet.fulfilled, (state, action) => ({
        ...state,
        sheetLoading: false,
        sheetRows: action.payload.data || [],
        sheetMonth: action.payload.month,
        sheetYear: action.payload.year,
      }))
      .addCase(fetchUtilitySheet.rejected, (state, action) => ({
        ...state,
        sheetLoading: false,
        error: action.payload,
      }))
      .addCase(toggleInvoiceStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload.data;
        return {
          ...state,
          items: state.items.map((item) =>
            item._id === updated._id ? { ...item, ...updated } : item
          ),
          sheetRows: state.sheetRows.map((row) =>
            row.existingInvoice && row.existingInvoice._id === updated._id
              ? {
                  ...row,
                  existingInvoice: {
                    ...row.existingInvoice,
                    status: updated.status,
                  },
                }
              : row
          ),
        };
      });
  },
});

export const { clearInvoiceError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
