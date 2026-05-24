import api from '@/lib/axios';

export interface BudgetPayload {
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM
}

export const budgetService = {
  getAll: (month?: string) => api.get('/budgets', { params: { month } }),
  create: (data: BudgetPayload) => api.post('/budgets', data),
  update: (id: string, data: Partial<BudgetPayload>) =>
    api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};
