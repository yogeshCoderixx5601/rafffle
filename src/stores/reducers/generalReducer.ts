import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IVaultDetails } from "@/types";

const initialState: {
  btc_price_in_dollar: number;
  userAccount: any | null;
  new_activity: boolean;
} = {
  btc_price_in_dollar: 0,
  userAccount: null,
  new_activity: false,
};

const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    setVaultAndOrdinalAddress: (
      state,
      action: PayloadAction<any>
    ) => {
      state.userAccount = action.payload;
    },
    setBTCPrice: (state, action: PayloadAction<number>) => {
      state.btc_price_in_dollar = action.payload;
    },
    setNewActivity: (state, action: PayloadAction<boolean>) => {
      state.new_activity = action.payload;
    },
  },
});

export const { setBTCPrice, setVaultAndOrdinalAddress, setNewActivity } =
  generalSlice.actions;
export default generalSlice.reducer;
