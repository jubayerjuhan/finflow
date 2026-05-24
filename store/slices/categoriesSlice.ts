import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  categoryService,
  CategoryPayload,
} from '@/services/categoryService';

export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async () => {
    const res = await categoryService.getAll();
    return res.data.data;
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data: CategoryPayload) => {
    const res = await categoryService.create(data);
    return res.data.data;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: string; data: Partial<CategoryPayload> }) => {
    const res = await categoryService.update(id, data);
    return res.data.data;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string) => {
    await categoryService.delete(id);
    return id;
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;
