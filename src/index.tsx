// application buradan boostrapt olur.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './main';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import store from './storage/store/store';
const queryClient = new QueryClient();
const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

root.render(
	<>
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</Provider>
	</>
);
