import { configureStore } from '@reduxjs/toolkit';
import invoiceReducer from './slices/invoiceSlice';
import roomReducer from './slices/roomSlice';

export const store = configureStore({
  reducer: {
    invoices: invoiceReducer,
    rooms: roomReducer,
  },
});

export default store;
