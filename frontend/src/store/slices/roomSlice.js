import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/rooms', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải danh sách phòng trọ!'
      );
    }
  }
);

export const deleteRoomThunk = createAsyncThunk(
  'rooms/deleteRoom',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/rooms/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa phòng!');
    }
  }
);

const initialState = {
  items: [],
  pagination: {
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  },
  loading: false,
  error: null,
};

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearRoomError: (state) => ({
      ...state,
      error: null,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => ({
        ...state,
        loading: true,
        error: null,
      }))
      .addCase(fetchRooms.fulfilled, (state, action) => ({
        ...state,
        loading: false,
        items: action.payload.data || [],
        pagination: action.payload.pagination || state.pagination,
      }))
      .addCase(fetchRooms.rejected, (state, action) => ({
        ...state,
        loading: false,
        error: action.payload,
      }))
      .addCase(deleteRoomThunk.fulfilled, (state, action) => ({
        ...state,
        items: state.items.filter((room) => room._id !== action.payload),
      }));
  },
});

export const { clearRoomError } = roomSlice.actions;
export default roomSlice.reducer;
