import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, CheckCircle, Loader, RefreshCw } from 'lucide-react';

// ============================================
// IMPORTANT: ADD YOUR GOOGLE APPS SCRIPT URL HERE
// ============================================
const API_URL = "https://script.google.com/macros/s/AKfycbzKo6XA6EnL3DLxSh0BslQkTVH9kn8B8gP5Sqb2eC_JP0Yy4HfmiqWiEKVDZd2R9eNJ/exec";
// Example: "https://script.google.com/macros/s/AKfycby.../exec"

export default function TeacherDashboard() {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Load questions when component mounts
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getQuestions' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions);
      } else {
        setError('Failed to load questions');
      }
    } catch (err) {
      console.error('Error loading questions:', err);
      setError('Failed to load questions. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async (code) => {
    setLoadingResponses(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'getResponses',
          code: code
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResponses(data.responses);
      }
    } catch (err) {
      console.error('Error loading responses:', err);
    } finally {
      setLoadingResponses(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleAutoGenerateCode = () => {
    let code;
    do {
      code = generateRandomCode();
    } while (questions.some(q => q.id === code));
    setNewCode(code);
  };

  const handleCreateQuestion = async () => {
    if (!newCode.trim() || !newQuestion.trim()) {
      setError('Please enter both a code and a question.');
      return;
    }

    const upperCode = newCode.toUpperCase().trim();

    if (questions.some(q => q.id === upperCode)) {
      setError('This code already exists. Please use a different code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'createQuestion',
          code: upperCode,
          question: newQuestion.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setQuestions([...questions, data.question]);
        setNewCode('');
        setNewQuestion('');
        setShowForm(false);
      } else {
        setError(data.error || 'Failed to create question');
      }
    } catch (err) {
      console.error('Error creating question:', err);
      setError('Failed to create question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (codeToDelete) => {
    if (!confirm('Are you sure you want to delete this question and all its responses?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'deleteQuestion',
          code: codeToDelete
        })
      });

      const data = await response.json();

      if (data.success) {
        setQuestions(questions.filter(q => q.id !== codeToDelete));
      } else {
        setError('Failed to delete question');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleViewResponses = async (question) => {
    setSelectedQuestion(question);
    await loadResponses(question.id);
  };

  const handleBackToQuestions = () => {
    setSelectedQuestion(null);
    setResponses([]);
  };

  // Show setup message if API URL not configured
  if (API_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 flex items-center justify-center">
        <div className="max-w-2xl bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Setup Required</h1>
          <p className="text-gray-700 mb-4">
            The Google Sheets API URL needs to be configured. Please follow the setup instructions in the deployment guide.
          </p>
          <p className="text-sm text-gray-600">
            Update the <code className="bg-gray-100 px-2 py-1 rounded">API_URL</code> variable in <code className="bg-gray-100 px-2 py-1 rounded">src/App.jsx</code>
          </p>
        </div>
      </div>
    );
  }

  // Response Viewer
  if (selectedQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToQuestions}
                className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
              >
                ← Back to Questions
              </button>
              <button
                onClick={() => loadResponses(selectedQuestion.id)}
                disabled={loadingResponses}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
                title="Refresh responses"
              >
                <RefreshCw size={18} className={loadingResponses ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <div className="mb-6 p-6 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md font-mono font-bold">
                  {selectedQuestion.id}
                </span>
                <span className="text-sm text-gray-500">
                  {responses.length} response{responses.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-lg text-gray-800">{selectedQuestion.question}</p>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Student Responses</h2>

            {loadingResponses ? (
              <div className="text-center py-12">
                <Loader size={48} className="animate-spin text-purple-600 mx-auto" />
                <p className="text-gray-600 mt-4">Loading responses...</p>
              </div>
            ) : responses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No responses yet. Share code <span className="font-mono font-bold">{selectedQuestion.id}</span> with your students.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((response, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {response.studentName}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {new Date(response.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-medium">
                        Submitted
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{response.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Teacher Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-purple-600">
                Teacher Dashboard
              </h1>
              <button
                onClick={loadQuestions}
                disabled={loading}
                className="text-gray-600 hover:text-gray-800"
                title="Refresh questions"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={20} />
              New Question
            </button>
          </div>

          {showForm && (
            <div className="mb-8 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Question</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="e.g., MATH03"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                      maxLength={10}
                      disabled={loading}
                    />
                    <button
                      onClick={handleAutoGenerateCode}
                      disabled={loading}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      Auto-Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Students will use this code to access the question
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question
                  </label>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter your question here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateQuestion}
                    disabled={loading}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Question'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setNewCode('');
                      setNewQuestion('');
                      setError('');
                    }}
                    disabled={loading}
                    className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Your Questions ({questions.length})
            </h2>

            {loading && questions.length === 0 ? (
              <div className="text-center py-12">
                <Loader size={48} className="animate-spin text-purple-600 mx-auto" />
                <p className="text-gray-600 mt-4">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No questions yet.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Create your first question →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md font-mono font-bold text-sm">
                            {q.id}
                          </span>
                          <button
                            onClick={() => handleCopyCode(q.id)}
                            className="text-gray-400 hover:text-purple-600 transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === q.id ? (
                              <CheckCircle size={18} className="text-green-500" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                        </div>
                        <p className="text-gray-800 text-lg mb-3">{q.question}</p>
                        <p className="text-xs text-gray-400 mb-3">
                          Created {new Date(q.createdAt).toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleViewResponses(q)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                        >
                          View Responses
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-600 transition-colors p-2 disabled:opacity-50"
                        title="Delete question"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
