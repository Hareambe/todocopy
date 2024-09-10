import { combineReducers } from '@reduxjs/toolkit';
import programidReducer from './slices/programidSlice';
import completedReducer from './slices/completedSlice';
import userReducer from './slices/userSlice';
import counterReducer from './slices/countSlice'; // Import the reducer correctly

const rootReducer = combineReducers({
    programid: programidReducer,
    completed: completedReducer,
    users: userReducer,
    counter: counterReducer // Use the correct variable here
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
