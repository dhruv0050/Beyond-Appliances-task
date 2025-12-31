import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Landing from './components/landing';
import ReportPage from './components/ReportPage';
import AggregatedDashboard from './components/AggregatedDashboard';
import CallReportsList from './components/CallReportsList';
import CallReportDetail from './components/CallReportDetail';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/analytics" element={<AggregatedDashboard />} />
          <Route path="/call-reports" element={<CallReportsList />} />
          <Route path="/call-reports/:callId" element={<CallReportDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
