
import React, { useState, useEffect, useRef } from 'react';
import { FiDatabase, FiLoader, FiSend, FiTrash2, FiCopy } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import { Dialog } from '@headlessui/react';
import clsx from 'clsx';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connection, setConnection] = useState({ host: '', port: '', user: '', password: '', database: '' });
  const [showModal, setShowModal] = useState(false);
  const scrollRef = useRef(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt before submitting.');
      return;
    }
    setLoading(true);
    setError('');
    setResponseData(null);

    try {
      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, connection })
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setResponseData(result);
        toast.success('Query executed successfully!');
      }
    } catch (err) {
      setError('Failed to connect to server');
      toast.error('Failed to connect to server');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [responseData]);

  const handleClear = () => {
    setPrompt('');
    setResponseData(null);
    setError('');
    toast.info('Cleared!');
  };

  const handleConnectionChange = (e) => {
    setConnection({ ...connection, [e.target.name]: e.target.value });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="dark" />
      <div className="w-full max-w-3xl bg-[#23272f] p-8 rounded-2xl shadow-2xl text-center border border-gray-700">
        <div className="flex items-center justify-center mb-8">
          <FiDatabase className="text-green-400 text-4xl mr-3" />
          <h1 className="text-4xl font-extrabold tracking-tight">Talk To DB</h1>
        </div>

        {/* DB Connection Fields */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-left mb-8">
          {['host', 'port', 'user', 'password', 'database'].map((field) => (
            <input
              key={field}
              name={field}
              value={connection[field]}
              onChange={handleConnectionChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="bg-[#323843] text-white p-3 rounded-lg focus:outline-none placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-400 transition"
              type={field === 'password' ? 'password' : 'text'}
              autoComplete={field}
            />
          ))}
        </div>

        {/* Prompt Area */}
        <div className="w-full bg-[#323843] rounded-xl p-4 mb-6 border border-gray-600">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-[140px] p-4 text-lg text-white bg-transparent focus:outline-none resize-none placeholder-gray-400 rounded"
            placeholder="Type your SQL-related prompt here..."
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={clsx(
              "flex items-center justify-center bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-green-400 transition",
              loading && "opacity-60 cursor-not-allowed"
            )}
          >
            {loading ? <FiLoader className="animate-spin mr-2" /> : <FiSend className="mr-2" />}
            {loading ? 'Generating...' : 'Run Query'}
          </button>
          <button
            onClick={handleClear}
            className="flex items-center justify-center bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-red-700 transition"
          >
            <FiTrash2 className="mr-2" />
            Clear
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/80 border border-red-600 text-red-200 rounded-lg p-4 mt-4 text-lg flex items-center justify-center gap-2">
            <span>❌</span> {error}
          </div>
        )}

        {/* Response Display */}
        {responseData && (
          <div ref={scrollRef} className="mt-10 text-left w-full">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg text-green-300">Generated SQL:</span>
                <button
                  onClick={() => handleCopy(responseData.sql)}
                  className="flex items-center gap-1 bg-gray-700 text-white text-xs px-3 py-1 rounded hover:bg-gray-600 transition"
                >
                  <FiCopy /> Copy
                </button>
              </div>
              <pre className="relative bg-black text-green-400 p-4 rounded text-sm font-mono ring-2 ring-green-500 shadow-lg overflow-x-auto whitespace-pre-wrap break-words">
                {responseData.sql}
              </pre>
            </div>

            <div className="mb-4">
              <span className="font-semibold text-lg text-blue-300">Output:</span>
              <div className="overflow-x-auto mt-4 border rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      {Object.keys(responseData.data?.[0] || {}).map((key) => (
                        <th key={key} className="px-4 py-2 text-sm font-medium text-gray-300 border-b text-center">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-[#1e1e1e] divide-y divide-gray-700">
                    {responseData.data?.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <td key={colIndex} className="px-4 py-2 text-sm text-gray-200 border-b text-center">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* About Modal Example */}
        <button
          onClick={() => setShowModal(true)}
          className="mt-8 text-sm text-gray-400 hover:text-green-400 underline"
        >
          What is this?
        </button>
        <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black/70" />
          <div className="relative bg-[#23272f] rounded-xl p-8 shadow-xl border border-gray-700 max-w-md mx-auto">
            <Dialog.Title className="text-xl font-bold mb-4 text-green-400">About Talk To DB</Dialog.Title>
            <Dialog.Description className="text-gray-300 mb-4">
              <span className="block mb-2">Talk To DB lets you write natural language prompts and get SQL queries and results instantly. Powered by Hugging Face LLMs and your database connection.</span>
              <span className="block text-xs text-gray-500">Open source on GitHub.</span>
            </Dialog.Description>
            <button
              onClick={() => setShowModal(false)}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-400 transition"
            >
              Close
            </button>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
