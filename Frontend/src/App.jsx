import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Landing from './components/landing';
import ReportPage from './components/ReportPage';
import AggregatedDashboard from './components/AggregatedDashboard';
import CallReportsList from './components/CallReportsList';
import CallReportDetail from './components/CallReportDetail';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/video-analysis" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
          <Route path="/video-analysis/report/:id" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          <Route path="/video-analysis/analytics" element={<ProtectedRoute><AggregatedDashboard /></ProtectedRoute>} />

          {/* Audio Call Reports Routes */}
          <Route path="/call-reports" element={<ProtectedRoute><CallReportsList /></ProtectedRoute>} />
          <Route path="/call-reports/:callId" element={<ProtectedRoute><CallReportDetail /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
