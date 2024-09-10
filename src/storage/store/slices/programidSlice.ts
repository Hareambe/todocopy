import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Initial state
const initialCountState: number = 0;

const programidSlice = createSlice({
    name: 'count',
    initialState: initialCountState,
    reducers: {
        increment(state) {
            return state + 1;
        },
        decrement(state) {
            return state - 1;
        },
        setProgramid(state, action: PayloadAction<number>) {
            return action.payload;
        }
    }
});

export const { increment, decrement, setProgramid } = programidSlice.actions;
export default programidSlice.reducer;
