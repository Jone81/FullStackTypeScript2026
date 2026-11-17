import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProfileModel } from "../../api/ui/ProfileModel";

const getSavedProfile = (): ProfileModel | null => {
  try {
    const saved = typeof window !== "undefined" ? localStorage.getItem("profile") : null;
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const initialState: ProfileModel | null = getSavedProfile();

const profileSlice = createSlice({
  name: "profileSlice",
  initialState,
  reducers: {
    setUserProfileSlice: (
      _state: any,
      action: PayloadAction<ProfileModel | null>
    ) => {
      try {
        if (action.payload) {
          localStorage.setItem("profile", JSON.stringify(action.payload));
        } else {
          localStorage.removeItem("profile");
        }
      } catch {
        // ignore storage errors
      }
      return action.payload;
    },
  },
});

export const { setUserProfileSlice } = profileSlice.actions;
export default profileSlice.reducer;
