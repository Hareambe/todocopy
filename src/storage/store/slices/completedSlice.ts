
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Initial state
const initialCompletedState: boolean = false;

const completedSlice = createSlice({
    name: 'completed',
    initialState: initialCompletedState,
    reducers: {
        setCompleted(state, action: PayloadAction<boolean>) {
            return action.payload;
        },
        toggleCompleted(state) {
            return !state;
        },
        resetCompleted() {
            return initialCompletedState;
        }
    }
});

export const { setCompleted, toggleCompleted, resetCompleted } = completedSlice.actions;
export default completedSlice.reducer;
