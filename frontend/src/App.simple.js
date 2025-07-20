import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple components to test
const Home = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">🍽️ RecipeGenius</h1>
      <p className="text-xl text-gray-600 mb-8">Smart Recipe Generator & Grocery Planner</p>
      <div className="space-y-4">
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-green-800">✅ Frontend: Working</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-blue-800">🔗 Backend: {process.env.REACT_APP_API_URL}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p className="text-yellow-800">🔑 Clerk Key: {process.env.REACT_APP_CLERK_PUBLISHABLE_KEY ? 'Configured' : 'Missing'}</p>
        </div>
      </div>
      <button 
        onClick={() => fetch(`${process.env.REACT_APP_API_URL}/api/health`)
          .then(res => res.json())
          .then(data => alert(JSON.stringify(data, null, 2)))
          .catch(err => alert('Error: ' + err.message))
        }
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
      >
        Test Backend Connection
      </button>
    </div>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
