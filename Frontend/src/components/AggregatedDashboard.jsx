import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, Users, Phone, Award, ChevronDown, Filter, Store, BarChart3, AlertCircle, ThumbsUp, ArrowLeft } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const AggregatedDashboard = () => {
  const [timeRange, setTimeRange] = useState('last30');
  const [view, setView] = useState('overall');
  const [selectedRegion, setSelectedRegion] = useState('South');
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [selectedStore, setSelectedStore] = useState('');
  const [storePeriod, setStorePeriod] = useState('week');
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/results`);
        if (!res.ok) throw new Error('Failed to load results');
        const json = await res.json();
        setAllData(json.results || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Transform backend data to call records
  const allCalls = useMemo(() => {
    if (!allData.length) return [];

    return allData.map(item => {
      const data = item.data || {};
      const functional = data.Functional_Metadata || {};
      const customer = data.Customer_Information || {};
      const agent = data.Agent_Performance || {};
      const script = agent.SCRIPT_Framework || {};
      const soft = agent.Soft_Skills_Evaluation || {};
      const aggregate = data.Aggregate_Scores || {};

      const getAvgScore = (...scores) => {
        const valid = scores.filter(s => s > 0);
        return valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 75;
      };

      // Extract city from store location (e.g., "Bangalore Corporate Office")
      const storeLocation = functional.Store_Location || 'Unknown Store';
      const cityMatch = storeLocation.match(/Bangalore|Mumbai|Hyderabad|Chennai|Delhi|Pune|Kolkata/i);
      const extractedCity = cityMatch ? cityMatch[0] : 'Bangalore';
      
      // Determine region based on city
      const cityToRegion = {
        'Bangalore': 'South', 'Chennai': 'South', 'Hyderabad': 'South',
        'Mumbai': 'West', 'Pune': 'West',
        'Delhi': 'North',
        'Kolkata': 'East'
      };
      const region = cityToRegion[extractedCity] || 'South';
      
      // Normalize intent from backend (MEDIUM/HIGH/LOW) to title case (Medium/High/Low)
      // Handle combined ratings like "MEDIUM to HIGH" by taking the highest
      const rawIntent = customer.Purchase_Intent_Analysis?.Intent_to_Buy_Rating || 'MEDIUM';
      let normalizedIntent = 'Medium';
      if (rawIntent.toUpperCase().includes('HIGH')) {
        normalizedIntent = 'High';
      } else if (rawIntent.toUpperCase().includes('MEDIUM')) {
        normalizedIntent = 'Medium';
      } else if (rawIntent.toUpperCase().includes('LOW')) {
        normalizedIntent = 'Low';
      }

      return {
        id: item.video_id,
        store: storeLocation,
        city: extractedCity,
        region: region,
        type: customer.Type_of_Call?.includes('Sales') ? 'Sales' : 'Service',
        intent: normalizedIntent,
        experience: customer.Customer_Satisfaction_Score >= 4 ? 'High' : customer.Customer_Satisfaction_Score >= 3 ? 'Medium' : 'Low',
        scores: {
          overall: aggregate.Agent_Performance_Score ? Math.round(aggregate.Agent_Performance_Score * 20) : 75,
          rapport: script.S_Solution_Finding?.Rating ? script.S_Solution_Finding.Rating * 20 : 75,  // S = Greeting/Opening
          explore: script.R_Research?.Rating ? script.R_Research.Rating * 20 : 75,                  // R = Research/Explore needs
          listen: soft.Active_Listening_Rating ? soft.Active_Listening_Rating * 20 : 75,            // Soft Skills = Listen
          advise: script.I_Inform?.Rating ? script.I_Inform.Rating * 20 : 75,                       // I = Inform/Advise
          execute: script.T_Transact?.Rating ? script.T_Transact.Rating * 20 : 75,                  // T = Close/Execute
          productKnowledge: agent.Product_Knowledge_Assessment?.Technical_Knowledge_Rating ? agent.Product_Knowledge_Assessment.Technical_Knowledge_Rating * 20 : 75,
          softSkills: getAvgScore(soft.Active_Listening_Rating || 0, soft.Empathy_Rapport_Rating || 0, soft.Communication_Clarity_Rating || 0) * 4,
        }
      };
    });
  }, [allData]);

  const filteredCalls = useMemo(() => {
    if (view === 'region') {
      return allCalls.filter(call => call.region === selectedRegion);
    } else if (view === 'city') {
      return allCalls.filter(call => call.city === selectedCity);
    }
    return allCalls;
  }, [allCalls, view, selectedRegion, selectedCity]);

  const metrics = useMemo(() => {
    const total = filteredCalls.length;
    const salesCalls = filteredCalls.filter(c => c.type === 'Sales').length;
    const serviceCalls = filteredCalls.filter(c => c.type === 'Service').length;

    const matrix = {};
    ['High', 'Medium', 'Low'].forEach(intent => {
      matrix[intent] = {};
      ['High', 'Medium', 'Low'].forEach(exp => {
        matrix[intent][exp] = filteredCalls.filter(
          c => c.intent === intent && c.experience === exp
        ).length;
      });
    });

    const storeMetrics = {};
    filteredCalls.forEach(call => {
      if (!storeMetrics[call.store]) {
        storeMetrics[call.store] = {
          storeName: call.store,
          city: call.city,
          region: call.region,
          calls: [],
        };
      }
      storeMetrics[call.store].calls.push(call);
    });

    const storePerformance = Object.values(storeMetrics).map(store => {
      const calls = store.calls;
      const avgScore = (metric) => 
        calls.length ? Math.round(calls.reduce((sum, c) => sum + c.scores[metric], 0) / calls.length) : 0;

      return {
        storeName: store.storeName,
        city: store.city,
        region: store.region,
        totalCalls: calls.length,
        overallScore: avgScore('overall'),
        rapport: avgScore('rapport'),
        explore: avgScore('explore'),
        listen: avgScore('listen'),
        advise: avgScore('advise'),
        execute: avgScore('execute'),
        productKnowledge: avgScore('productKnowledge'),
        softSkills: avgScore('softSkills'),
      };
    }).sort((a, b) => b.overallScore - a.overallScore);

    return {
      total,
      salesCalls,
      serviceCalls,
      matrix,
      storePerformance
    };
  }, [filteredCalls]);

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'bg-emerald-50';
    if (score >= 70) return 'bg-amber-50';
    return 'bg-rose-50';
  };

  const getMatrixColor = (count, max) => {
    if (max === 0) return 'bg-slate-100 text-slate-600';
    const intensity = count / max;
    if (intensity > 0.7) return 'bg-indigo-600 text-white';
    if (intensity > 0.4) return 'bg-indigo-400 text-white';
    if (intensity > 0.2) return 'bg-indigo-200 text-slate-800';
    return 'bg-slate-100 text-slate-600';
  };

  const maxMatrixValue = Math.max(...Object.values(metrics.matrix).flatMap(row => Object.values(row)), 1);

  const storeAnalysis = useMemo(() => {
    if (!selectedStore || !metrics.storePerformance.length) {
      const firstStore = metrics.storePerformance[0]?.storeName;
      if (firstStore && selectedStore === '') {
        setSelectedStore(firstStore);
      }
      return null;
    }

    const storeCalls = allCalls.filter(c => c.store === selectedStore);
    const periods = [];
    const now = new Date();

    if (storePeriod === 'day') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const dayCalls = storeCalls.slice(i * Math.ceil(storeCalls.length / 7), (i + 1) * Math.ceil(storeCalls.length / 7));
        
        periods.push({
          label: `${dayName} ${dateStr}`,
          calls: dayCalls,
          count: dayCalls.length
        });
      }
    } else {
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);
        
        const weekLabel = `Week ${4 - i}`;
        const dateRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        
        const weekCalls = storeCalls.slice(i * Math.ceil(storeCalls.length / 4), (i + 1) * Math.ceil(storeCalls.length / 4));
        
        periods.push({
          label: weekLabel,
          dateRange: dateRange,
          calls: weekCalls,
          count: weekCalls.length
        });
      }
    }

    const temporalData = periods.map(period => {
      if (period.count === 0) {
        return { ...period, overallScore: 0, rapport: 0, explore: 0, listen: 0, advise: 0, execute: 0, productKnowledge: 0, softSkills: 0 };
      }

      const avgScore = (metric) => 
        Math.round(period.calls.reduce((sum, c) => sum + c.scores[metric], 0) / period.count);

      return {
        ...period,
        overallScore: avgScore('overall'),
        rapport: avgScore('rapport'),
        explore: avgScore('explore'),
        listen: avgScore('listen'),
        advise: avgScore('advise'),
        execute: avgScore('execute'),
        productKnowledge: avgScore('productKnowledge'),
        softSkills: avgScore('softSkills')
      };
    });

    const storeData = metrics.storePerformance.find(s => s.storeName === selectedStore);
    const avgOverall = storeData?.overallScore || 0;
    const totalStoreCalls = storeCalls.length;
    
    const scores = {
      'Rapport Building': storeData?.rapport || 0,
      'Exploration': storeData?.explore || 0,
      'Active Listening': storeData?.listen || 0,
      'Advisory': storeData?.advise || 0,
      'Execution': storeData?.execute || 0,
      'Product Knowledge': storeData?.productKnowledge || 0,
      'Soft Skills': storeData?.softSkills || 0
    };

    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const strengths = sortedScores.slice(0, 2);
    const weaknesses = sortedScores.slice(-2).reverse();

    const highExpCalls = storeCalls.filter(c => c.experience === 'High').length;
    const medExpCalls = storeCalls.filter(c => c.experience === 'Medium').length;
    const lowExpCalls = storeCalls.filter(c => c.experience === 'Low').length;
    const expPercentage = totalStoreCalls ? Math.round((highExpCalls / totalStoreCalls) * 100) : 0;

    const highIntentCalls = storeCalls.filter(c => c.intent === 'High').length;
    const conversionPotential = totalStoreCalls ? Math.round((highIntentCalls / totalStoreCalls) * 100) : 0;

    const recentPeriods = temporalData.slice(-3);
    const trend = recentPeriods.length >= 2 
      ? recentPeriods[recentPeriods.length - 1].overallScore - recentPeriods[0].overallScore
      : 0;

    const performanceSummary = avgOverall >= 85 
      ? `${selectedStore} demonstrates excellent performance with an overall score of ${avgOverall}. The store consistently delivers high-quality customer interactions across all touchpoints.`
      : avgOverall >= 70
      ? `${selectedStore} shows good performance with an overall score of ${avgOverall}. The team maintains solid fundamentals with room for optimization in specific areas.`
      : `${selectedStore} has an overall score of ${avgOverall}, indicating significant opportunities for improvement. Focused training and process refinement are recommended.`;

    const trendAnalysis = trend > 5
      ? ` Recent trends show positive momentum with a ${trend}-point improvement.`
      : trend < -5
      ? ` Recent performance has declined by ${Math.abs(trend)} points, requiring attention.`
      : ` Performance has remained stable in recent periods.`;

    const improvementAreas = weaknesses.length > 0
      ? `Primary focus areas include ${weaknesses[0][0]} (${weaknesses[0][1]}/100) and ${weaknesses[1][0]} (${weaknesses[1][1]}/100). ${
          weaknesses[0][1] < 70 
            ? `The ${weaknesses[0][0]} score requires immediate intervention through targeted coaching and skill development programs.` 
            : `Incremental improvements in these areas will drive overall performance gains.`
        } Consider implementing role-playing exercises and peer learning sessions to address these gaps.`
      : 'All performance metrics are well-balanced. Focus on maintaining consistency and exploring advanced techniques.';

    const customerExpSummary = expPercentage >= 60
      ? `Customer experience is strong with ${expPercentage}% of interactions rated as high quality. ${conversionPotential}% of calls show high purchase intent, representing significant conversion opportunities.`
      : expPercentage >= 40
      ? `Customer experience is moderate with ${expPercentage}% high-quality interactions. Focus on elevating the ${medExpCalls + lowExpCalls} medium/low experience calls to improve satisfaction scores.`
      : `Customer experience needs improvement with only ${expPercentage}% high-quality interactions. ${highIntentCalls > 0 ? `Despite ${conversionPotential}% high-intent calls, experience gaps may be impacting conversions.` : 'Low intent signals suggest need for better qualification and engagement strategies.'}`;

    return {
      temporalData,
      analysis: {
        performanceSummary: performanceSummary + trendAnalysis,
        improvementAreas,
        customerExpSummary,
        strengths: strengths.map(s => ({ name: s[0], score: s[1] })),
        weaknesses: weaknesses.map(s => ({ name: s[0], score: s[1] })),
        totalCalls: totalStoreCalls,
        avgScore: avgOverall,
        expBreakdown: { high: highExpCalls, medium: medExpCalls, low: lowExpCalls }
      }
    };
  }, [selectedStore, storePeriod, allCalls, metrics.storePerformance]);

  const regions = ['South', 'West', 'North', 'East'];
  const cities = ['Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Delhi'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading aggregated analytics...</div>
      </div>
    );
  }

  if (!allCalls.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No data available for aggregated view.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-slate-900 text-white shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 hover:bg-slate-800 rounded-lg transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Call Analytics Dashboard
                </h1>
                <p className="text-slate-400 text-sm">Aggregated insights across all touchpoints</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-800 rounded-lg px-4 py-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent text-sm font-medium cursor-pointer outline-none"
              >
                <option value="last7">Last 7 Days</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
                <option value="ytd">Year to Date</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => setView('overall')}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                view === 'overall' 
                  ? 'bg-white text-slate-900 shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Overall Overview
            </button>
            <button
              onClick={() => setView('region')}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                view === 'region' 
                  ? 'bg-white text-slate-900 shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Region-wise
            </button>
            <button
              onClick={() => setView('city')}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                view === 'city' 
                  ? 'bg-white text-slate-900 shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              City-wise
            </button>

            {view === 'region' && (
              <div className="flex items-center gap-2 ml-8 pl-8 border-l border-slate-700">
                <Filter className="w-4 h-4 text-slate-400" />
                {regions.map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      selectedRegion === region
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}

            {view === 'city' && (
              <div className="flex items-center gap-3 ml-8 pl-8 border-l border-slate-700 bg-slate-800 rounded-lg px-4 py-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent font-medium cursor-pointer outline-none"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Phone className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">{metrics.total.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-1">Total Calls Analyzed</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Avg. per store</span>
                <span className="font-semibold text-slate-900">
                  {metrics.storePerformance.length ? Math.round(metrics.total / metrics.storePerformance.length) : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600">{metrics.salesCalls}</p>
                <p className="text-sm text-slate-500 mt-1">Sales Calls</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Sales Ratio</span>
                <span className="font-semibold text-slate-900">
                  {metrics.total ? Math.round((metrics.salesCalls / metrics.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{metrics.serviceCalls}</p>
                <p className="text-sm text-slate-500 mt-1">Service Calls</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Service Ratio</span>
                <span className="font-semibold text-slate-900">
                  {metrics.total ? Math.round((metrics.serviceCalls / metrics.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Intent x Customer Experience Matrix */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-indigo-600" />
            Intent × Customer Experience Matrix
          </h2>
          
          <div className="overflow-hidden">
            <div className="grid grid-cols-4 gap-3">
              <div></div>
              <div className="text-center font-semibold text-sm text-slate-700 py-3">High Experience</div>
              <div className="text-center font-semibold text-sm text-slate-700 py-3">Medium Experience</div>
              <div className="text-center font-semibold text-sm text-slate-700 py-3">Low Experience</div>

              {['High', 'Medium', 'Low'].map(intent => (
                <React.Fragment key={intent}>
                  <div className="flex items-center font-semibold text-sm text-slate-700 pr-4 justify-end">
                    {intent} Intent
                  </div>
                  {['High', 'Medium', 'Low'].map(exp => (
                    <div 
                      key={`${intent}-${exp}`}
                      className={`rounded-lg p-6 text-center transition-all hover:scale-105 ${getMatrixColor(metrics.matrix[intent][exp], maxMatrixValue)}`}
                    >
                      <div className="text-3xl font-bold mb-1">{metrics.matrix[intent][exp]}</div>
                      <div className="text-xs opacity-75">calls</div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-indigo-600"></div>
                <span className="text-slate-600">High Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-indigo-400"></div>
                <span className="text-slate-600">Medium Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-indigo-200"></div>
                <span className="text-slate-600">Low Volume</span>
              </div>
            </div>
          </div>
        </div>

        {/* Store Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-8 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Store Performance Analysis
            </h2>
            <p className="text-sm text-slate-500 mt-1">RELAX Framework Scores & Key Metrics</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-8 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Store Name
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    # Calls
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Overall Score
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-indigo-700 uppercase tracking-wider border-l border-slate-200">
                    R
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    E
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    L
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    A
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-indigo-700 uppercase tracking-wider border-r border-slate-200">
                    X
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Product Knowledge
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Soft Skills
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.storePerformance.map((store) => (
                  <tr key={store.storeName} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div>
                        <div className="font-semibold text-slate-900">{store.storeName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{store.city}, {store.region}</div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                        {store.totalCalls}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${getScoreBg(store.overallScore)} ${getScoreColor(store.overallScore)}`}>
                        {store.overallScore}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center border-l border-slate-100">
                      <span className="font-semibold text-slate-700">{store.rapport}</span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className="font-semibold text-slate-700">{store.explore}</span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className="font-semibold text-slate-700">{store.listen}</span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className="font-semibold text-slate-700">{store.advise}</span>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-slate-100">
                      <span className="font-semibold text-slate-700">{store.execute}</span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`font-semibold ${getScoreColor(store.productKnowledge)}`}>
                        {store.productKnowledge}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`font-semibold ${getScoreColor(store.softSkills)}`}>
                        {store.softSkills}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div>
                <span className="font-semibold">RELAX Framework:</span> 
                <span className="ml-2">R = Rapport | E = Explore | L = Listen | A = Advise | X = Execute</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span>85+ Excellent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>70-84 Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span>&lt;70 Needs Improvement</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store-wise Deep Dive */}
        {storeAnalysis && metrics.storePerformance.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <Store className="w-6 h-6 text-indigo-600" />
                    Store-wise Deep Dive
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Temporal performance trends and detailed analytics</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2.5 border border-slate-200">
                    <Store className="w-4 h-4 text-slate-600" />
                    <select
                      value={selectedStore}
                      onChange={(e) => setSelectedStore(e.target.value)}
                      className="bg-transparent font-medium text-sm cursor-pointer outline-none text-slate-900 min-w-[200px]"
                    >
                      {metrics.storePerformance.map(store => (
                        <option key={store.storeName} value={store.storeName}>
                          {store.storeName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  </div>

                  <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setStorePeriod('day')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        storePeriod === 'day'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setStorePeriod('week')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        storePeriod === 'week'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Weekly
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Performance Over Time
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        {storePeriod === 'day' ? 'Day' : 'Week'}
                      </th>
                      <th className="text-center px-4 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        # Calls
                      </th>
                      <th className="text-center px-4 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Overall Score
                      </th>
                      <th className="text-center px-4 py-4 text-xs font-semibold text-indigo-700 uppercase tracking-wider border-l border-slate-200">
                        R
                      </th>
                      <th className="text-center px-4 py-4 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        E
                      </th>
                      <th className="text-center px-4 py-4 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        L
                      </th>
                      <th className="text-center px-4 py-4 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        A
                      </th>
                      <th className="text-center px-4 py-4 text-xs font-semibold text-indigo-700 uppercase tracking-wider border-r border-slate-200">
                        X
                      </th>
                      <th className="text-center px-4 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Product Knowledge
                      </th>
                      <th className="text-center px-4 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Soft Skills
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storeAnalysis.temporalData.map((period, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-slate-900">{period.label}</div>
                            {period.dateRange && (
                              <div className="text-xs text-slate-500 mt-0.5">{period.dateRange}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                            {period.count}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {period.count > 0 ? (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${getScoreBg(period.overallScore)} ${getScoreColor(period.overallScore)}`}>
                              {period.overallScore}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center border-l border-slate-100">
                          <span className={`font-semibold ${period.count > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                            {period.count > 0 ? period.rapport : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-semibold ${period.count > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                            {period.count > 0 ? period.explore : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-semibold ${period.count > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                            {period.count > 0 ? period.listen : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-semibold ${period.count > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                            {period.count > 0 ? period.advise : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center border-r border-slate-100">
                          <span className={`font-semibold ${period.count > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                            {period.count > 0 ? period.execute : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {period.count > 0 ? (
                            <span className={`font-semibold ${getScoreColor(period.productKnowledge)}`}>
                              {period.productKnowledge}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {period.count > 0 ? (
                            <span className={`font-semibold ${getScoreColor(period.softSkills)}`}>
                              {period.softSkills}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI-Powered Insights */}
            <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  AI-Powered Insights & Recommendations
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">Store Performance Summary</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getScoreBg(storeAnalysis.analysis.avgScore)} ${getScoreColor(storeAnalysis.analysis.avgScore)}`}>
                          {storeAnalysis.analysis.avgScore}/100
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-600">{storeAnalysis.analysis.totalCalls} calls analyzed</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {storeAnalysis.analysis.performanceSummary}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-600 mb-2">Top Strengths:</div>
                    <div className="flex flex-col gap-1">
                      {storeAnalysis.analysis.strengths.map((strength, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{strength.name}</span>
                          <span className={`font-bold ${getScoreColor(strength.score)}`}>{strength.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">Improvement Areas</h4>
                      <div className="text-xs text-slate-500">Priority focus recommendations</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {storeAnalysis.analysis.improvementAreas}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-600 mb-2">Development Priorities:</div>
                    <div className="flex flex-col gap-1">
                      {storeAnalysis.analysis.weaknesses.map((weakness, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{weakness.name}</span>
                          <span className={`font-bold ${getScoreColor(weakness.score)}`}>{weakness.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <ThumbsUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">Customer Experience Summary</h4>
                      <div className="text-xs text-slate-500">Interaction quality & satisfaction</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {storeAnalysis.analysis.customerExpSummary}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-600 mb-2">Experience Breakdown:</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span className="text-slate-700">High Quality</span>
                        </div>
                        <span className="font-bold text-slate-900">{storeAnalysis.analysis.expBreakdown.high}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-slate-700">Medium Quality</span>
                        </div>
                        <span className="font-bold text-slate-900">{storeAnalysis.analysis.expBreakdown.medium}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                          <span className="text-slate-700">Low Quality</span>
                        </div>
                        <span className="font-bold text-slate-900">{storeAnalysis.analysis.expBreakdown.low}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AggregatedDashboard;
