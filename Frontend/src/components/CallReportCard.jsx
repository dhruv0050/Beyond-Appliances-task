import React, { useState } from 'react';
import { Phone, Video, Mic, User, MapPin, Clock, Calendar, Star, TrendingUp } from 'lucide-react';

const StarRating = ({ rating = 0, max = 5 }) => {
  const safe = Number.isFinite(rating) ? rating : 0;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className={`w-5 h-5 ${i < safe ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
      <span className="ml-2 text-sm font-semibold text-gray-700">{safe}/{max}</span>
    </div>
  );
};

const IntentBadge = ({ intent }) => {
  const colors = {
    HIGH: 'bg-green-100 text-green-800 border-green-300',
    MEDIUM: 'bg-orange-100 text-orange-800 border-orange-300',
    LOW: 'bg-red-100 text-red-800 border-red-300',
  };
  return (
    <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${colors[intent] || colors.MEDIUM}`}>
      {intent || 'NA'}
    </span>
  );
};

const CallReportCard = ({ callData }) => {
  const [activeTab, setActiveTab] = useState('presentability');

  const tabs = [
    { id: 'presentability', label: 'Presentability' },
    { id: 'demo', label: 'Product Demo' },
    { id: 'relax', label: 'Sales Framework (RELAX)' },
    { id: 'softskills', label: 'Soft Skills' },
  ];

  if (!callData) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6 fixed h-full shadow-xl">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-1">Duroflex</h2>
          <p className="text-blue-200 text-sm">Call Analytics</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">Call ID</p>
            <p className="font-mono text-sm break-all">{callData.Functional.Call_ID}</p>
          </div>

          <div>
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">Call Time</p>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <p className="text-sm">{callData.Functional.Call_Time}</p>
            </div>
          </div>

          <div>
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">Call Duration</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <p className="text-sm">NA</p>
            </div>
          </div>

          <div>
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">Store Location</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <p className="text-sm">{callData.Functional.Store_Location}</p>
            </div>
          </div>

          <div>
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">Agent Name</p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <p className="text-sm">{callData.Functional.Agent_Name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Call Report Card</h1>

          {/* Module 1: Key Insights */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-2">Call Type</p>
              <p className="text-xl font-semibold text-gray-900">{callData.Customer_Information.Type_of_Call}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600 mb-3">Customer Satisfaction</p>
              <StarRating rating={callData.Customer_Information.Customer_Satisfaction_Score} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <p className="text-sm text-gray-600 mb-3">Intent to Purchase</p>
              <IntentBadge intent={callData.Customer_Information.Intent_to_Buy_Rating} />
            </div>
          </div>

          {/* Module 2: Technical Performance */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Video & Audio Quality</h2>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex justify-center items-center mb-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Agent Video</p>
                <StarRating rating={callData.Functional.Agent_Video_Quality_Rating} />
              </div>

              <div className="text-center">
                <div className="flex justify-center items-center mb-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Mic className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Agent Audio</p>
                <StarRating rating={callData.Functional.Agent_Audio_Quality_Rating} />
              </div>

              <div className="text-center">
                <div className="flex justify-center items-center mb-3">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Video className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Customer Video</p>
                <div className="flex justify-center">
                  <span className="text-sm font-semibold text-gray-400">0/5</span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex justify-center items-center mb-3">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Mic className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Customer Audio</p>
                <StarRating rating={callData.Functional.Customer_Audio_Quality_Rating} />
              </div>
            </div>
          </div>

          {/* Module 3: Customer Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Analysis</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                <p className="text-lg font-semibold text-gray-900">{callData.Functional.Customer_Name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Location</p>
                <p className="text-lg font-semibold text-gray-900">{callData.Customer_Information.Location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Category of Interest</p>
                <p className="text-lg font-semibold text-gray-900">{callData.Customer_Information.Interest_Category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Product of Interest</p>
                <p className="text-lg font-semibold text-gray-900">{callData.Customer_Information.Interest_Product}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-1">Call Objective</p>
                <p className="text-lg font-semibold text-gray-900">{callData.Functional.Call_Objective_Theme}</p>
              </div>
            </div>
          </div>

          {/* Module 4: Agent Performance */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Agent Performance Deep-Dive</h2>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Overall Agent Rating</p>
                <StarRating rating={4} />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-64">
              {activeTab === 'presentability' && (
                <div>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Rating</p>
                    <StarRating rating={callData.Functional.Agent_Presentability.Score} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Reasons</p>
                    <ul className="space-y-2">
                      {(callData.Functional.Agent_Presentability.Reason_for_Score || '')
                        .split(';')
                        .filter(Boolean)
                        .map((reason, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span className="text-gray-700">{reason.trim()}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'demo' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reasons</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-4 px-4 font-medium text-gray-900">Demo Status</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              callData.Agent_Areas.Product_Demonstration.Done
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {callData.Agent_Areas.Product_Demonstration.Done ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">N/A</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 font-medium text-gray-900">Overall Quality</td>
                        <td className="py-4 px-4">
                          <StarRating rating={callData.Agent_Areas.Product_Demonstration.Quality_Rating} />
                        </td>
                        <td className="py-4 px-4">
                          <ul className="space-y-1">
                            {callData.Agent_Areas.Product_Demonstration.Quality_Reasons.map((reason, i) => (
                              <li key={i} className="flex items-start text-sm text-gray-700">
                                <span className="text-blue-600 mr-2">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 font-medium text-gray-900">Relevance</td>
                        <td className="py-4 px-4">
                          <StarRating rating={callData.Agent_Areas.Product_Demonstration.Relevance_Rating} />
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {callData.Agent_Areas.Product_Demonstration.Relevance_Rating_Reason}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 font-medium text-gray-900">Video/Audio Quality</td>
                        <td className="py-4 px-4">
                          <StarRating rating={callData.Agent_Areas.Product_Demonstration.Video_Audio_Quality_Rating} />
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {callData.Agent_Areas.Product_Demonstration.Video_Audio_Quality_Reason}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 font-medium text-gray-900">Effectiveness</td>
                        <td className="py-4 px-4">
                          <StarRating rating={callData.Agent_Areas.Product_Demonstration.Effectiveness_Rating} />
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {callData.Agent_Areas.Product_Demonstration.Effectiveness_Rating_Reason}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 font-medium text-gray-900">Customer Engagement</td>
                        <td className="py-4 px-4">
                          <StarRating rating={callData.Agent_Areas.Product_Demonstration.Customer_Engagement_Rating} />
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {callData.Agent_Areas.Product_Demonstration.Customer_Engagement_Reason}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'relax' && (
                <div className="space-y-6">
                  {Object.entries(callData.Agent_Areas.RELAX_Framework).map(([key, value]) => {
                    const letter = key.split('_')[0];
                    const name = key.split('_').slice(1).join(' ');
                    return (
                      <div key={key} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {letter} - {name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Attempted:</span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                value.Attempted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {value.Attempted ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Rating:</span>
                            <StarRating rating={value.Rating} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Reasons:</p>
                            <ul className="space-y-1">
                              {value.Reasons.map((reason, i) => (
                                <li key={i} className="flex items-start text-sm text-gray-700">
                                  <span className="text-blue-600 mr-2">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'softskills' && (
                <div className="space-y-6">
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Listening</h3>
                    <div className="mb-3">
                      <StarRating rating={callData.Agent_Areas.SoftSkills.Active_Listening_Rating} />
                    </div>
                    <ul className="space-y-1">
                      {callData.Agent_Areas.SoftSkills.Active_Listening_Reasons.map((reason, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-700">
                          <span className="text-green-600 mr-2">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Empathy & Rapport</h3>
                    <div className="mb-3">
                      <StarRating rating={callData.Agent_Areas.SoftSkills.Empathy_Rapport_Rating} />
                    </div>
                    <ul className="space-y-1">
                      {callData.Agent_Areas.SoftSkills.Empathy_Rapport_Reasons.map((reason, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-700">
                          <span className="text-purple-600 mr-2">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Clarity & Confidence</h3>
                    <div className="mb-3">
                      <StarRating rating={callData.Agent_Areas.SoftSkills.Clarity_Confidence_Rating} />
                    </div>
                    <ul className="space-y-1">
                      {callData.Agent_Areas.SoftSkills.Clarity_Confidence_Reasons.map((reason, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-700">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4 py-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Objection Handling</h3>
                    <div className="mb-3">
                      <StarRating rating={callData.Agent_Areas.SoftSkills.Objection_Handling_Rating} />
                    </div>
                    <ul className="space-y-1">
                      {callData.Agent_Areas.SoftSkills.Objection_Handling_Reasons.map((reason, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-700">
                          <span className="text-orange-600 mr-2">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Top 3 Coaching Opportunities */}
            <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-bold text-gray-900">Top 3 Coaching Opportunities</h3>
              </div>
              <ol className="space-y-3">
                {(callData.Agent_Areas.SoftSkills.Top_3_Improvement_Areas || []).map((area, i) => (
                  <li key={i} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold mr-3 text-sm">
                      {i + 1}
                    </span>
                    <span className="text-gray-800 pt-1">{area}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Module 5: Overall Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Overall Summary</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-1 h-6 bg-blue-600 mr-3"></span>
                  Chronological Call Summary
                </h3>
                <p className="text-gray-700 leading-relaxed pl-4">
                  {callData.Agent_Areas.Overall_Summary.Chronological_Call_Summary}
                </p>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-1 h-6 bg-green-600 mr-3"></span>
                  Agent Handling Summary
                </h3>
                <p className="text-gray-700 leading-relaxed pl-4">
                  {callData.Agent_Areas.Overall_Summary.Agent_Handling_Summary}
                </p>
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-1 h-6 bg-purple-600 mr-3"></span>
                  Customer Satisfaction Summary
                </h3>
                <p className="text-gray-700 leading-relaxed pl-4">
                  {callData.Agent_Areas.Overall_Summary.Customer_Satisfaction_Summary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallReportCard;
