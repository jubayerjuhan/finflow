import api from '@/lib/axios';

export interface WalletPayload {
  name: string;
  icon: string;
  color: string;
  currency: string;
  balance: number;
}

export const walletService = {
  getAll: () => api.get('/wallets'),
  getById: (id: string) => api.get(`/wallets/${id}`),
  create: (data: WalletPayload) => api.post('/wallets', data),
  update: (id: string, data: Partial<WalletPayload>) =>
    api.put(`/wallets/${id}`, data),
  delete: (id: string) => api.delete(`/wallets/${id}`),
  transfer: (fromId: string, toId: string, amount: number, note?: string, fee?: number) =>
    api.post('/wallets/transfer', { fromId, toId, amount, note, fee }),
};
