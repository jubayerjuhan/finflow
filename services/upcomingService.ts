import api from '@/lib/axios';

export interface UpcomingPayload {
  title: string;
  amount: number;
  categoryId: string;
  walletId: string;
  dueDate: string;
  note?: string;
  recurring: 'none' | 'weekly' | 'monthly' | 'yearly';
}

export const upcomingService = {
  getAll: () => api.get('/upcoming'),
  getById: (id: string) => api.get(`/upcoming/${id}`),
  create: (data: UpcomingPayload) => api.post('/upcoming', data),
  update: (id: string, data: Partial<UpcomingPayload>) =>
    api.put(`/upcoming/${id}`, data),
  delete: (id: string) => api.delete(`/upcoming/${id}`),
  markPaid: (id: string) => api.post(`/upcoming/${id}/pay`),
  markSkipped: (id: string) =>
    api.put(`/upcoming/${id}`, { status: 'skipped' }),
};
