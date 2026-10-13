import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Profile = {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  description: string;
} | null;

const initialState: Profile = null;

const profileSlice = createSlice({
  name: "profileSlice",
  initialState: initialState as Profile,
  reducers: {
    setProfileSlice: (_state: Profile, action: PayloadAction<Profile>) => {
      return action.payload;
    },
  },
});

export const { setProfileSlice } = profileSlice.actions;
export default profileSlice.reducer;
