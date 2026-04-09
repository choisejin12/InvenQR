import { createSlice } from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type UserState = {
  userData: User | null;
  isAuth: boolean;
};

const initialState: UserState = {
  userData: null,
  isAuth: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.userData = action.payload;
      state.isAuth = true;
    },
    logout: (state) => {
      state.userData = null;
      state.isAuth = false;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;