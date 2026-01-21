import React, { useState, useEffect, useCallback } from 'react';
import { analyzeSentiment } from '../api/sentiment';
import { useAuth } from '@clerk/clerk-react';

const SentimentalAnalysis = () => {
  const { getToken } = useAuth();

  // input + ui state
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // history state
  const [history, setHistory] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  // nice accessible color tokens (kept as classes, defined inline via tailwind)
  // load history from backend
  const fetchHistory = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:3001/api/sentiment/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.analyses || []);
      } else {
        console.error("Failed to fetch history");
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }, [getToken]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // format date for history cards
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // save analysis to backend
  const saveAnalysis = async (inputTextVal, resultVal, description) => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:3001/api/sentiment/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          inputText: inputTextVal,
          result: resultVal,
          description: description,
        }),
      });
      if (response.ok) {
        await response.json();
        await fetchHistory();
      } else {
        const errorData = await response.json();
        console.error('Failed to save analysis:', errorData.error);
        setError('Failed to save analysis');
      }
    } catch (err) {
      console.error('Error saving analysis:', err);
      setError('Error saving analysis');
    }
  };

  // analyze handler
  const handleAnalyze = async () => {
    setError(null);
    if (!inputText.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await analyzeSentiment(inputText);
      if (response.success) {
        setResult(response.data);

        // try to extract description for saving
        const description = response.data?.[0]?.emotionalState?.description || "No description available";
        await saveAnalysis(inputText, response.data, description);

      } else {
        setError(response.error || 'Analysis failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  // delete analysis
  const deleteAnalysis = async (id) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3001/api/sentiment/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        await fetchHistory();
      } else {
        const err = await response.json();
        console.error("Failed to delete analysis:", err.error);
      }
    } catch (err) {
      console.error("Error deleting analysis:", err);
    }
  };

  const toggleHistoryItem = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // derive simple description for current result (UI)
  const currentDescription = result && result.length > 0 && result[0]?.emotionalState
    ? result[0].emotionalState.description
    : null;

  // small helper to render sentiment badge
  const SentimentBadge = ({ label }) => {
    if (!label) return null;
    const lower = label.toLowerCase();
    if (lower.includes('positive') || lower.includes('happy') || lower.includes('joy') || lower.includes('calm')) {
      return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600">Positive</span>;
    }
    if (lower.includes('neutral') || lower.includes('mixed')) {
      return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-600">Neutral</span>;
    }
    // otherwise negative/sad/anxious
    return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600">Negative</span>;
  };

  return (
    <div className="bg-[#FFF7E0] min-h-screen text-[#0F172A]">
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <h1 className="text-4xl font-semibold text-[#2DD4BF] text-center mb-2">Mood Tracker</h1>
        <p className="text-center text-[#6B7280] mb-8">Analyze how you're feeling today — type freely and we'll give you a gentle read.</p>

        {/* Input */}
        <div className="max-w-xl mx-auto">
          <textarea
            className="w-full rounded-lg border border-[#E6E9EE] bg-white px-4 py-3 text-[#0F172A] placeholder:text-[#9AA4B2] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter how you're feeling (e.g., 'I couldn't sleep last night, feeling stressed')"
            rows={5}
            disabled={loading}
          />

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white font-medium transition ${loading ? 'bg-[#0CB4B1] opacity-80 animate-pulse' : 'bg-[#06B6D4] hover:shadow-md'}`}
            >
              {loading ? 'Analyzing...' : 'Analyze Sentiment'}
            </button>

            <button
              onClick={() => { setInputText(''); setResult(null); setError(null); }}
              className="px-4 py-2 rounded-full bg-white border border-[#E6E9EE] text-[#0F172A] shadow-sm"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {typeof error === 'string' ? error : 'An error occurred'}
            </div>
          )}
        </div>

        {/* Result panel */}
        {result && (
          <div className="mt-8 max-w-2xl mx-auto bg-white border border-[#E6E9EE] rounded-xl p-6 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <SentimentBadge label={currentDescription} />
                  <span className="text-sm text-[#6B7280] px-3 py-1 bg-[#F8FAFB] rounded-full">{new Date().toLocaleString()}</span>
                </div>

                <p className="text-sm font-medium text-[#0F172A] mb-1">Analysis Result</p>
                <div className="text-lg text-[#0F172A] font-semibold">{currentDescription || 'Unable to determine mood'}</div>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setResult(null)}
                  className="text-sm text-[#06B6D4] hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* optional full JSON */}
            <div className="mt-4">
              <button
                onClick={() => setExpandedItems(prev => ({ ...prev, temp: !prev.temp }))}
                className="text-sm text-[#06B6D4] hover:underline"
              >
                {expandedItems.temp ? 'Hide Details' : 'More Details'}
              </button>

              {expandedItems.temp && (
                <div className="bg-[#F8FAFB] p-3 rounded-lg mt-3 text-sm text-[#374151]">
                  <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        <div className="mt-10 mx-2 pb-12">
          <h2 className="text-3xl font-bold text-center mb-6 text-green-600">Analysis History</h2>

          {history.length === 0 ? (
            <div className="text-center bg-white rounded-lg shadow-md p-8 mx-auto max-w-md">
              <div className="text-gray-500 text-6xl mb-4">📊</div>
              <p className="text-gray-600 text-lg">No previous analyses found.</p>
              <p className="text-gray-400 text-sm mt-2">Your analysis will appear here after you run one.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {history.map((analysis) => (
                <div key={analysis.id} className="bg-white rounded-lg shadow-md p-6 border border-[#E6E9EE] hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {/* tiny status dot using sentiment */}
                        <span className={`w-3 h-3 rounded-full ${analysis.description?.toLowerCase().includes('sad') || analysis.description?.toLowerCase().includes('angry') ? 'bg-red-500' : analysis.description?.toLowerCase().includes('neutral') ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                        <span className="text-sm text-[#6B7280] bg-[#F8FAFB] px-3 py-1 rounded-full">
                          {formatDate(analysis.createdAt)}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-gray-800 font-medium mb-1">Input Text:</p>
                        <p className="text-gray-700 bg-[#F8FAFB] p-3 rounded-lg italic">
                          "{analysis.inputText.length > 150 ? analysis.inputText.substring(0, 150) + "..." : analysis.inputText}"
                        </p>
                      </div>

                      {analysis.description && (
                        <div className="mb-3">
                          <p className="text-gray-800 font-medium mb-1">Analysis Description:</p>
                          <p className="text-sm text-gray-600 bg-[#F1F8F7] p-3 rounded-lg">
                            {analysis.description}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => toggleHistoryItem(analysis.id)}
                      >
                        {expandedItems[analysis.id] ? 'Hide Details' : 'More Details'}
                      </button>

                      <button
                        onClick={() => deleteAnalysis(analysis.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium shadow-sm"
                        title="Delete this analysis"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {expandedItems[analysis.id] && (
                    <div className="bg-gray-50 rounded p-4 overflow-auto max-h-64 mt-4">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap">{JSON.stringify(analysis.result, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* total count */}
          {history.length > 0 && (
            <div className="text-center mt-6">
              <p className="text-gray-600 bg-white rounded-full px-4 py-2 inline-block shadow-sm">
                Total Analyses: <span className="font-bold text-green-600">{history.length}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentalAnalysis;
