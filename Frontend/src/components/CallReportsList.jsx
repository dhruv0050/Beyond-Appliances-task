import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Calendar, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const CallReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/call-reports`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      setError('Failed to load call reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/call-reports/stats/overview`);
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const getIntentColor = (intent) => {
    if (!intent) return 'bg-gray-800 text-gray-400 border-gray-700';
    const upper = intent.toUpperCase();
    if (upper.includes('HIGH')) return 'bg-emerald-900/30 text-emerald-300 border-emerald-600/40';
    if (upper.includes('MEDIUM')) return 'bg-amber-900/30 text-amber-300 border-amber-600/40';
    return 'bg-red-900/30 text-red-300 border-red-600/40';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-300">Loading call reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-100">Call Analytics Reports</h1>
                <p className="text-sm text-gray-400 mt-1">GMB Audio Call Analysis</p>
              </div>
            </div>
            
            {stats && (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{stats.total_calls}</div>
                  <div className="text-xs text-gray-500">Total Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">{stats.converted_calls}</div>
                  <div className="text-xs text-gray-500">Converted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{stats.conversion_rate}%</div>
                  <div className="text-xs text-gray-500">Conv. Rate</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const analysis = report.analysis || {};
            const hasError = analysis.error;
            const functional = analysis.Functional || {};
            const customer = analysis.Customer_Information || {};
            const agent = analysis.Agent_Areas || {};
            
            return (
              <Link
                key={report.call_id}
                to={`/call-reports/${report.call_id}`}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all group"
              >
                {/* Store Header */}
                <div className="mb-4 pb-4 border-b border-gray-800">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-100 group-hover:text-amber-400 transition">
                      {report.store_name}
                    </h3>
                    {report.is_converted && (
                      <span className="px-2 py-1 bg-emerald-900/30 border border-emerald-600/40 rounded text-xs font-semibold text-emerald-300">
                        ✓ Converted
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{report.city}, {report.state}</span>
                  </div>
                </div>

                {/* Call Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-gray-300">{report.call_id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{report.call_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{Math.floor(report.duration_seconds / 60)}:{(report.duration_seconds % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>

                {hasError ? (
                  <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3 text-xs text-red-300">
                    ⚠️ Analysis failed or pending
                  </div>
                ) : (
                  <>
                    {/* Intent Badges */}
                    <div className="flex gap-2 mb-4">
                      {customer.Intent_to_Visit_Rating && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getIntentColor(customer.Intent_to_Visit_Rating)}`}>
                          Visit: {customer.Intent_to_Visit_Rating}
                        </span>
                      )}
                      {customer.Intent_to_Purchase_Rating && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getIntentColor(customer.Intent_to_Purchase_Rating)}`}>
                          Purchase: {customer.Intent_to_Purchase_Rating}
                        </span>
                      )}
                    </div>

                    {/* Objective */}
                    {functional.Call_Objective_Theme && (
                      <div className="text-sm text-gray-400 mb-2">
                        <span className="text-gray-500">Objective:</span> {functional.Call_Objective_Theme}
                      </div>
                    )}

                    {/* AIDA Stage */}
                    {customer.Customer_Stage_AIDA && (
                      <div className="text-sm">
                        <span className="text-gray-500">Stage:</span>{' '}
                        <span className="text-amber-400 font-semibold">{customer.Customer_Stage_AIDA}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="mt-4 pt-4 border-t border-gray-800 text-right">
                  <span className="text-xs text-amber-400 group-hover:text-amber-300 font-semibold">
                    View Full Report →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CallReportsList;
