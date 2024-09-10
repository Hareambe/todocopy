
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Initial state
const initialUserState: { [key: string]: string } = {};

const userSlice = createSlice({
    name: 'users',
    initialState: initialUserState,
    reducers: {
        setUserName(state, action: PayloadAction<{ userId: string; userName: string }>) {
            const { userId, userName } = action.payload;
            state[userId] = userName;
        }
    }
});

export const { setUserName } = userSlice.actions;
export default userSlice.reducer;
