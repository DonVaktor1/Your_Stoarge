import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SignUp from './components/auth/signUp/SignUp.jsx';
import SignIn from './components/auth/signIn/SignIn.jsx';
import MainApp from './components/mainApp/MainApp.jsx';
import Settings from './components/settings/Settings.jsx';
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
            <Route path="/settings" element={<Settings/>} />
            <Route path="/" element={<Navigate to="/signin" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
