import { configureStore } from '@reduxjs/toolkit';
import signupFlowReducer from './slices/signupFlowSlice';
import authReducer from './features/AuthSlice';
import loadingReducer from './features/Loading';

export const store = configureStore({
  reducer: {
    signupFlow: signupFlowReducer,
    auth: authReducer,
    loading: loadingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
