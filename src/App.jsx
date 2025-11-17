import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Loader } from 'lucide-react';

// ============================================
// IMPORTANT: ADD YOUR GOOGLE APPS SCRIPT URL HERE
// ============================================
const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
// Example: "https://script.google.com/macros/s/AKfycby.../exec"

export default function StudentDashboard() {
  const [code, setCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [answer, setAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState({});

  // Load questions when component mounts
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getQuestions' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Convert array to object for easy lookup
        const questionsObj = {};
        data.questions.forEach(q => {
          questionsObj[q.id] = q;
        });
        setQuestions(questionsObj);
      }
    } catch (err) {
      console.error('Error loading questions:', err);
      // Don't show error to students if questions can't load
      // They can still try entering a code
    }
  };

  const handleCodeSubmit = () => {
    const upperCode = code.toUpperCase().trim();
    
    if (questions[upperCode]) {
      setCurrentQuestion(questions[upperCode]);
      setError('');
      setSubmitted(false);
    } else {
      setError('Invalid code. Please check with your teacher.');
      setCurrentQuestion(null);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!studentName.trim() || !answer.trim()) {
      setError('Please enter both your name and answer.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'submitResponse',
          code: currentQuestion.id,
          studentName: studentName.trim(),
          answer: answer.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError('Failed to submit answer. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      setError('Failed to submit answer. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuestion = () => {
    setCode('');
    setStudentName('');
    setAnswer('');
    setCurrentQuestion(null);
    setSubmitted(false);
    setError('');
    loadQuestions(); // Reload in case new questions were added
  };

  // Show setup message if API URL not configured
  if (API_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">
            Student Q&A
          </h1>

          {!currentQuestion && !submitted && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your question code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCodeSubmit()}
                  placeholder="e.g., MATH01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg uppercase"
                  maxLength={10}
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleCodeSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Get Question
              </button>
            </div>
          )}

          {currentQuestion && !submitted && (
            <div>
              <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                <div className="text-sm text-indigo-600 font-medium mb-2">
                  Question Code: {currentQuestion.id}
                </div>
                <div className="text-lg text-gray-800">
                  {currentQuestion.question}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleAnswerSubmit}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Answer
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleNewQuestion}
                disabled={loading}
                className="w-full mt-3 text-indigo-600 py-2 hover:text-indigo-800 transition-colors disabled:opacity-50"
              >
                ← Back to enter code
              </button>
            </div>
          )}

          {submitted && (
            <div className="text-center py-8">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Answer Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you, {studentName}. Your teacher will review your answer.
              </p>
              <button
                onClick={handleNewQuestion}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Answer Another Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
