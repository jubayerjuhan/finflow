import api from '@/lib/axios';

export interface TransactionPayload {
  walletId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
  toWalletId?: string;
}

export interface TransactionFilters {
  walletId?: string;
  categoryId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const transactionService = {
  getAll: (filters?: TransactionFilters) =>
    api.get('/transactions', { params: filters }),
  getById: (id: string) => api.get(`/transactions/${id}`),
  create: (data: TransactionPayload) => api.post('/transactions', data),
  update: (id: string, data: Partial<TransactionPayload>) =>
    api.put(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
};
