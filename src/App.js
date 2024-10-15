import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SignUp from './components/auth/SignUp.jsx';
import SignIn from './components/auth/SignIn.jsx';
import MainApp from './components/MainApp.jsx';
import { AuthProvider } from './components/auth/AuthContext.js';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/main" element={<MainApp />} />
            <Route path="/" element={<Navigate to="/signin" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
