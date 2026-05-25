import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { upcomingService, UpcomingPayload } from '@/services/upcomingService';

export interface Contribution {
  _id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface UpcomingExpense {
  _id: string;
  title: string;
  amount: number;
  categoryId: { _id: string; name: string; icon: string; color: string };
  walletId: { _id: string; name: string; icon: string; color: string; balance: number; currency: string };
  dueDate: string;
  note?: string;
  status: 'pending' | 'paid' | 'skipped';
  recurring: 'none' | 'weekly' | 'monthly' | 'yearly';
  paidTransactionId?: string;
  contributions: Contribution[];
  createdAt: string;
}

interface UpcomingState {
  items: UpcomingExpense[];
  loading: boolean;
  error: string | null;
}

const initialState: UpcomingState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchUpcoming = createAsyncThunk('upcoming/fetchAll', async () => {
  const res = await upcomingService.getAll();
  return res.data.data;
});

export const createUpcoming = createAsyncThunk(
  'upcoming/create',
  async (data: UpcomingPayload) => {
    const res = await upcomingService.create(data);
    return res.data.data;
  }
);

export const updateUpcoming = createAsyncThunk(
  'upcoming/update',
  async ({ id, data }: { id: string; data: Partial<UpcomingPayload> & { status?: string } }) => {
    const res = await upcomingService.update(id, data);
    return res.data.data;
  }
);

export const deleteUpcoming = createAsyncThunk(
  'upcoming/delete',
  async (id: string) => {
    await upcomingService.delete(id);
    return id;
  }
);

export const markUpcomingPaid = createAsyncThunk(
  'upcoming/markPaid',
  async ({ id, walletId }: { id: string; walletId?: string }) => {
    const res = await upcomingService.markPaid(id, walletId);
    return res.data.data;
  }
);

export const addContribution = createAsyncThunk(
  'upcoming/addContribution',
  async ({ id, amount, note }: { id: string; amount: number; note?: string }) => {
    const res = await upcomingService.addContribution(id, amount, note);
    return res.data.data as UpcomingExpense;
  }
);

export const removeContribution = createAsyncThunk(
  'upcoming/removeContribution',
  async ({ id, contributionId }: { id: string; contributionId: string }) => {
    const res = await upcomingService.removeContribution(id, contributionId);
    return res.data.data as UpcomingExpense;
  }
);

const upcomingSlice = createSlice({
  name: 'upcoming',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcoming.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcoming.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUpcoming.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch upcoming expenses';
      })
      .addCase(createUpcoming.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateUpcoming.fulfilled, (state, action) => {
        const idx = state.items.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteUpcoming.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u._id !== action.payload);
      })
      .addCase(markUpcomingPaid.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (u) => u._id === action.payload.upcoming._id
        );
        if (idx !== -1) state.items[idx] = action.payload.upcoming;
      })
      .addCase(addContribution.fulfilled, (state, action) => {
        const idx = state.items.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(removeContribution.fulfilled, (state, action) => {
        const idx = state.items.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default upcomingSlice.reducer;
