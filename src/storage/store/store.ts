
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: [
                    'form1.transHeaderTicketAddDate',
                    'form2.transDetailTicketDate',
                    'form1',
                    'form2',
                    'users'
                ],
                ignoredActions: [
                    'form1/updateHeaderForm',
                    'form2/updateDetailForm',
                    'filters/setFilters',
                    'users/setUserName'
                ]
            }
        })
});

export default store;
