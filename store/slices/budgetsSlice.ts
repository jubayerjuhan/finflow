import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { budgetService, BudgetPayload } from '@/services/budgetService';
import { format } from 'date-fns';

export interface Budget {
  _id: string;
  categoryId: { _id: string; name: string; icon: string; color: string };
  amount: number;
  month: string;
  spent?: number;
  createdAt: string;
}

interface BudgetsState {
  items: Budget[];
  selectedMonth: string;
  loading: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  items: [],
  selectedMonth: format(new Date(), 'yyyy-MM'),
  loading: false,
  error: null,
};

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchAll',
  async (month?: string) => {
    const res = await budgetService.getAll(month);
    return res.data.data;
  }
);

export const createBudget = createAsyncThunk(
  'budgets/create',
  async (data: BudgetPayload) => {
    const res = await budgetService.create(data);
    return res.data.data;
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/update',
  async ({ id, data }: { id: string; data: Partial<BudgetPayload> }) => {
    const res = await budgetService.update(id, data);
    return res.data.data;
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/delete',
  async (id: string) => {
    await budgetService.delete(id);
    return id;
  }
);

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch budgets';
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload);
      });
  },
});

export const { setSelectedMonth } = budgetsSlice.actions;
export default budgetsSlice.reducer;
