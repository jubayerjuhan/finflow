import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { walletService, WalletPayload } from '@/services/walletService';

export interface Wallet {
  _id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface WalletsState {
  items: Wallet[];
  selectedWalletId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: WalletsState = {
  items: [],
  selectedWalletId: null,
  loading: false,
  error: null,
};

export const fetchWallets = createAsyncThunk('wallets/fetchAll', async () => {
  const res = await walletService.getAll();
  return res.data.data;
});

export const createWallet = createAsyncThunk(
  'wallets/create',
  async (data: WalletPayload) => {
    const res = await walletService.create(data);
    return res.data.data;
  }
);

export const updateWallet = createAsyncThunk(
  'wallets/update',
  async ({ id, data }: { id: string; data: Partial<WalletPayload> }) => {
    const res = await walletService.update(id, data);
    return res.data.data;
  }
);

export const deleteWallet = createAsyncThunk(
  'wallets/delete',
  async (id: string) => {
    await walletService.delete(id);
    return id;
  }
);

export const transferFunds = createAsyncThunk(
  'wallets/transfer',
  async ({
    fromId,
    toId,
    amount,
    note,
  }: {
    fromId: string;
    toId: string;
    amount: number;
    note?: string;
  }) => {
    const res = await walletService.transfer(fromId, toId, amount, note);
    return res.data.data;
  }
);

const walletsSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    setSelectedWallet: (state, action: PayloadAction<string | null>) => {
      state.selectedWalletId = action.payload;
    },
    updateWalletBalance: (
      state,
      action: PayloadAction<{ id: string; balance: number }>
    ) => {
      const wallet = state.items.find((w) => w._id === action.payload.id);
      if (wallet) wallet.balance = action.payload.balance;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch wallets';
      })
      .addCase(createWallet.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateWallet.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (w) => w._id === action.payload._id
        );
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteWallet.fulfilled, (state, action) => {
        state.items = state.items.filter((w) => w._id !== action.payload);
        if (state.selectedWalletId === action.payload) {
          state.selectedWalletId = null;
        }
      })
      .addCase(transferFunds.fulfilled, (state, action) => {
        // Update both wallets
        const { fromWallet, toWallet } = action.payload;
        const fromIdx = state.items.findIndex((w) => w._id === fromWallet._id);
        const toIdx = state.items.findIndex((w) => w._id === toWallet._id);
        if (fromIdx !== -1) state.items[fromIdx] = fromWallet;
        if (toIdx !== -1) state.items[toIdx] = toWallet;
      });
  },
});

export const { setSelectedWallet, updateWalletBalance } = walletsSlice.actions;
export default walletsSlice.reducer;
