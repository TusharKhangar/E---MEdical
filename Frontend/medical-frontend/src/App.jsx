// src/App.jsx

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRouter />
          
          {/* Toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              className: 'text-sm',
              style: { background: '#0f172a', color: '#fff', borderRadius: '10px', padding: '10px 14px' },
              success: { iconTheme: { primary: '#4fa59b', secondary: '#0f172a' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#0f172a' } },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;