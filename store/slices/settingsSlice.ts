import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  monthlyFund: number; // user's salary / available income to compare against upcoming expenses
}

const initialState: SettingsState = {
  monthlyFund: 0,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setMonthlyFund: (state, action: PayloadAction<number>) => {
      state.monthlyFund = action.payload;
    },
  },
});

export const { setMonthlyFund } = settingsSlice.actions;
export default settingsSlice.reducer;
