import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  transactionService,
  TransactionPayload,
  TransactionFilters,
} from '@/services/transactionService';

export interface Transaction {
  _id: string;
  walletId: { _id: string; name: string; color: string; icon: string };
  toWalletId?: { _id: string; name: string; color: string; icon: string };
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId: { _id: string; name: string; icon: string; color: string };
  date: string;
  note?: string;
  createdAt: string;
}

interface TransactionsState {
  items: Transaction[];
  total: number;
  page: number;
  totalPages: number;
  filters: TransactionFilters;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  total: 0,
  page: 1,
  totalPages: 1,
  filters: { page: 1, limit: 20 },
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (filters?: TransactionFilters) => {
    const res = await transactionService.getAll(filters);
    return res.data;
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (data: TransactionPayload) => {
    const res = await transactionService.create(data);
    return res.data.data;
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, data }: { id: string; data: Partial<TransactionPayload> }) => {
    const res = await transactionService.update(id, data);
    return res.data.data;
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id: string) => {
    await transactionService.delete(id);
    return id;
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { page: 1, limit: 20 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (t) => t._id === action.payload._id
        );
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { setFilters, resetFilters } = transactionsSlice.actions;
export default transactionsSlice.reducer;
