import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface AuthState {
  isLoggedIn: boolean;
  userRole: string | null;
  userName?: string | null;
  userType?: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userRole: null,
  userName: null,
  userType: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ userRole: string, userName: string, userType: string }>) => {
      state.userRole = action.payload.userRole || null; // Set user role if available
      state.isLoggedIn = true;
      state.userName = action.payload.userName || null; // Optional: Set user name if available
      state.userType = action.payload.userType || null; // Optional: Set user type if
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userRole = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;