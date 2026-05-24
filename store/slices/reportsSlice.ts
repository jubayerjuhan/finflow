import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { reportService, ReportFilters } from '@/services/reportService';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  byCategory: Array<{ category: string; icon: string; color: string; amount: number }>;
  byMonth: Array<{ month: string; income: number; expenses: number }>;
  walletBalances: Array<{ wallet: string; color: string; balance: number }>;
}

export interface UpcomingReport {
  totalUpcoming: number;
  totalAvailableBalance: number;
  byCategory: Array<{ category: string; icon: string; color: string; amount: number }>;
  projectedBalances: Array<{ wallet: string; color: string; current: number; projected: number }>;
}

interface ReportsState {
  summary: ReportSummary | null;
  upcomingReport: UpcomingReport | null;
  dateRange: { startDate: string; endDate: string };
  loading: boolean;
  error: string | null;
}

const now = new Date();
const initialState: ReportsState = {
  summary: null,
  upcomingReport: null,
  dateRange: {
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  },
  loading: false,
  error: null,
};

export const fetchReportSummary = createAsyncThunk(
  'reports/fetchSummary',
  async (filters?: ReportFilters) => {
    const res = await reportService.getSummary(filters);
    return res.data.data;
  }
);

export const fetchUpcomingReport = createAsyncThunk(
  'reports/fetchUpcoming',
  async (filters?: ReportFilters) => {
    const res = await reportService.getUpcomingReport(filters);
    return res.data.data;
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setDateRange: (
      state,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) => {
      state.dateRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchReportSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch report';
      })
      .addCase(fetchUpcomingReport.fulfilled, (state, action) => {
        state.upcomingReport = action.payload;
      });
  },
});

export const { setDateRange } = reportsSlice.actions;
export default reportsSlice.reducer;
