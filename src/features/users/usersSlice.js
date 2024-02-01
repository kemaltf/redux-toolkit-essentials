import { createSlice, createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import axios from "axios";

// const initialState = [
//   { id: "0", name: "Tianna Jenkins" },
//   { id: "1", name: "Kevin Grant" },
//   { id: "2", name: "Madison Price" },
// ];

const initialState = [];

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

// Maybe you will be confused, the first posts are posts created in Store.js, and the second posts are slices.
export const selectAllUsers = (state) => state.users;

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await axios.get("https://7c5t2c-5000.csb.app/users");
  return response.data;
});

export default usersSlice.reducer;
