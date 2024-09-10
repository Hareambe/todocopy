import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ToDoPage from './pages/TodoPage';  // Existing page     // New PrimeDemo page
import React from 'react';

function App() {
	return (
		<Router>
			<nav className="mb-4">
				{/* Add links to navigate between pages */}
				<Link to="/" className="mr-4">Home</Link>
				<Link to="/todo" className="mr-4">Todo Page</Link>
			</nav>

			<div className="p-5">
				<Routes>
					{/* Define routes and their corresponding components */}
					<Route path="/" element={<h1>Welcome to the Home Page</h1>} />
					<Route path="/todo" element={<ToDoPage />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
