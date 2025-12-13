import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CallReportCard from './CallReportCard';
import { transformApiData } from '../utils/transform';
import { ArrowLeft } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const ReportPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/results/${id}`);
        if (!res.ok) throw new Error('Failed to load report');
        const json = await res.json();
        setData(json.data || {});
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const callData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return null;
    return transformApiData(data, id);
  }, [data, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
        Loading report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow border border-red-200 text-red-700">
          <p className="font-semibold mb-2">Unable to load report</p>
          <p className="text-sm mb-4">{error}</p>
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-semibold text-blue-700 hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>
      <CallReportCard callData={callData} />
    </div>
  );
};

export default ReportPage;
