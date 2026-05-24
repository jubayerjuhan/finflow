import api from '@/lib/axios';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  month?: string;
}

export const reportService = {
  getSummary: (filters?: ReportFilters) =>
    api.get('/reports/summary', { params: filters }),
  getUpcomingReport: (filters?: ReportFilters) =>
    api.get('/reports/upcoming', { params: filters }),
};
