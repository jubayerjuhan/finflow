import api from '@/lib/axios';

export interface CategoryPayload {
  name: string;
  icon: string;
  color: string;
}

export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data: CategoryPayload) => api.post('/categories', data),
  update: (id: string, data: Partial<CategoryPayload>) =>
    api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};
