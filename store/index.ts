import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import walletsReducer from './slices/walletsSlice';
import transactionsReducer from './slices/transactionsSlice';
import categoriesReducer from './slices/categoriesSlice';
import budgetsReducer from './slices/budgetsSlice';
import upcomingReducer from './slices/upcomingSlice';
import reportsReducer from './slices/reportsSlice';
import themeReducer from './slices/themeSlice';
import settingsReducer from './slices/settingsSlice';

const persistConfig = {
  key: 'finflow-root',
  storage,
  whitelist: ['wallets', 'categories', 'theme', 'settings'], // settings holds monthlyFund
};

const rootReducer = combineReducers({
  wallets: walletsReducer,
  transactions: transactionsReducer,
  categories: categoriesReducer,
  budgets: budgetsReducer,
  upcoming: upcomingReducer,
  reports: reportsReducer,
  theme: themeReducer,
  settings: settingsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
