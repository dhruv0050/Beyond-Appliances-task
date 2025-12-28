import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Video, Upload, Loader, BarChart3 } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const IntentBadge = ({ intent }) => {
  const colors = {
    HIGH: 'bg-green-100 text-green-800 border-green-200',
    MEDIUM: 'bg-orange-100 text-orange-800 border-orange-200',
    LOW: 'bg-red-100 text-red-800 border-red-200',
  };
  const cls = colors[intent] || colors.MEDIUM;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {intent || 'NA'}
    </span>
  );
};

const Landing = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formId, setFormId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/results`);
      if (!res.ok) throw new Error('Failed to load results');
      const data = await res.json();
      setVideos(data.results || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    if (!formUrl.trim()) {
      setSubmitError('Please enter a Google Drive URL');
      setSubmitting(false);
      return;
    }

    const videoId = formId.trim() || `video_${Date.now()}`;

    try {
      const res = await fetch(`${API_BASE}/api/analyze/drive-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formUrl, video_id: videoId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to submit video');
      }

      setSubmitSuccess(`✓ Video "${videoId}" submitted for analysis. This may take 5-10 minutes...`);
      setFormUrl('');
      setFormId('');
      
      // Refresh results after a delay
      setTimeout(() => {
        fetchResults();
      }, 2000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit video');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-blue-700 font-semibold">Duroflex</p>
            <h1 className="text-3xl font-bold text-gray-900">Call Analytics</h1>
            <p className="text-sm text-gray-600 mt-2">Submit Google Drive video links to analyze sales calls.</p>
          </div>
          
          <Link 
            to="/analytics" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <BarChart3 className="w-5 h-5" />
            View Analytics Dashboard
          </Link>
        </div>

        {loading && (
          <div className="bg-white shadow rounded-lg p-6 text-gray-600">Loading results...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
            {error}
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Submit New Video</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Drive URL</label>
              <input
                type="text"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Paste the shareable Google Drive link to your video</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video ID (optional)</label>
              <input
                type="text"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                placeholder="e.g., video_1 (auto-generated if empty)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for auto-generated ID</p>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
                {submitSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 transition"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Analyze Video
                </>
              )}
            </button>
          </form>
        </div>

        {!loading && !videos.length && !error && (
          <div className="bg-white shadow rounded-lg p-6 text-gray-600">No results yet. Run analysis from backend.</div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((item) => {
            const data = item.data || {};
            const functional = data.Functional_Metadata || {};
            const customer = data.Customer_Information || {};
            const intent = customer.Purchase_Intent_Analysis?.Intent_to_Buy_Rating || 'NA';
            const satisfaction = customer.Customer_Satisfaction_Score || 0;

            return (
              <div key={item.video_id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Video ID</p>
                    <p className="font-mono text-sm text-gray-900 break-all">{item.video_id}</p>
                  </div>
                  <div className="bg-blue-50 text-blue-700 p-2 rounded-full">
                    <Video className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Call Type</p>
                  <p className="text-base font-semibold text-gray-900">{customer.Type_of_Call || 'NA'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Intent to Purchase</p>
                    <IntentBadge intent={intent} />
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-500">Customer Satisfaction</p>
                    <p className="text-sm font-semibold text-gray-900">{satisfaction || 'NA'}/5</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-800">Objective</p>
                  <p className="text-sm text-gray-700">{functional.Call_Objective_Theme || 'NA'}</p>
                </div>

                <div className="flex justify-end">
                  <Link
                    to={`/report/${item.video_id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    View Report
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Landing;
