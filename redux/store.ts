import { configureStore } from '@reduxjs/toolkit';
import signupFlowReducer from './slices/signupFlowSlice';
import authReducer from './slices/AuthSlice';

export const store = configureStore({
  reducer: {
    signupFlow: signupFlowReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
