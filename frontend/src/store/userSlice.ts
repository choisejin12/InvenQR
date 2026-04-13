import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../types/auth.type';

type UserState = {
  userData: AuthUser | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: UserState = {
  userData: null,
  isAuth: false,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.userData = action.payload;
      state.isAuth = true;
    },
    logout: (state) => {
      state.userData = null;
      state.isAuth = false;
      localStorage.removeItem('accessToken');
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
