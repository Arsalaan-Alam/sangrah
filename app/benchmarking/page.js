"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Benchmarking = () => {
  const [url, setUrl] = useState('');
  const [jsonInputs, setJsonInputs] = useState(['']);
  const [headers, setHeaders] = useState('');
  const [numRequests, setNumRequests] = useState(1);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestDetails, setRequestDetails] = useState([]);
  const [errors, setErrors] = useState({}); // State to track validation errors

  const handleAddJsonInput = () => {
    setJsonInputs([...jsonInputs, '']);
  };

  const handleJsonInputChange = (index, value) => {
    const newJsonInputs = [...jsonInputs];
    newJsonInputs[index] = value;
    setJsonInputs(newJsonInputs);
  };

  const validateJson = (jsonString) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const validateInputs = () => {
    const newErrors = {};

    if (!url) {
      newErrors.url = "URL is required";
    }

    jsonInputs.forEach((jsonInput, index) => {
      if (!validateJson(jsonInput)) {
        newErrors[`jsonInput${index}`] = `Request JSON ${index + 1} is not valid JSON`;
      }
    });

    if (headers && !validateJson(headers)) {
      newErrors.headers = "Headers are not valid JSON";
    }

    if (numRequests <= 0) {
      newErrors.numRequests = "Number of requests must be a positive integer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    const headersObj = JSON.parse(headers || '{}');
    const requests = [];
    const details = [];

    for (let i = 0; i < numRequests; i++) {
      const randomPayload = JSON.parse(jsonInputs[Math.floor(Math.random() * jsonInputs.length)]);
      const startTime = Date.now();

      requests.push(
        axios.post(url, randomPayload, { headers: headersObj })
          .then(response => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            details.push({
              payload: randomPayload,
              response: response.data,
              status: 'success',
              time: duration
            });
            return { status: 'success', time: duration };
          })
          .catch(error => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            details.push({
              payload: randomPayload,
              response: error.message,
              status: 'failed',
              time: duration
            });
            return { status: 'failed', time: duration };
          })
      );
    }

    const startTime = Date.now();
    const results = await Promise.all(requests);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    const successCount = results.filter(result => result.status === 'success').length;
    const failedCount = results.filter(result => result.status === 'failed').length;
    const averageTime = totalTime / numRequests;

    setResults({ successCount, failedCount, averageTime });
    setRequestDetails(details);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 mt-4">
      <div className="mb-4">
        <label className="block mb-2">Prediction URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        {errors.url && <p className="text-red-500">{errors.url}</p>}
      </div>

      {jsonInputs.map((jsonInput, index) => (
        <div key={index} className="mb-4">
          <label className="block mb-2">Request JSON {index + 1}</label>
          <textarea
            value={jsonInput}
            onChange={(e) => handleJsonInputChange(index, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            rows="4"
          />
          {errors[`jsonInput${index}`] && <p className="text-red-500">{errors[`jsonInput${index}`]}</p>}
        </div>
      ))}
      <button
        onClick={handleAddJsonInput}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add JSON
      </button>

      <div className="mb-4">
        <label className="block mb-2">Headers (JSON format)</label>
        <textarea
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          rows="2"
        />
        {errors.headers && <p className="text-red-500">{errors.headers}</p>}
      </div>

      <div className="mb-4">
        <label className="block mb-2">Number of Requests</label>
        <input
          type="number"
          value={numRequests}
          onChange={(e) => setNumRequests(parseInt(e.target.value, 10))}
          className="w-full p-2 border border-gray-300 rounded"
        />
        {errors.numRequests && <p className="text-red-500">{errors.numRequests}</p>}
      </div>

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Start Benchmarking
      </button>

      {loading && <p className='mt-4'>Loading...</p>}

      {results.successCount !== undefined && (
        <div className="mt-4">
          <p>Successful Requests: {results.successCount}</p>
          <p>Failed Requests: {results.failedCount}</p>
          <p>Average Time: {results.averageTime.toFixed(2)} ms</p>
          <Bar
            data={{
              labels: ['Successful', 'Failed'],
              datasets: [
                {
                  label: 'Number of Requests',
                  data: [results.successCount, results.failedCount],
                  backgroundColor: ['#4caf50', '#f44336']
                }
              ]
            }}
          />
        </div>
      )}

      {requestDetails.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Request Details</h2>
          <div className="space-y-4">
            {requestDetails.map((detail, index) => (
              <details key={index} className="border border-gray-300 p-2 rounded">
                <summary className="cursor-pointer">
                  Request {index + 1} - {detail.status.toUpperCase()}
                </summary>
                <div className="mt-2">
                  <pre className="bg-gray-100 p-2 rounded">
                    <strong>Payload:</strong> {JSON.stringify(detail.payload, null, 2)}
                  </pre>
                  <pre className="bg-gray-100 p-2 mt-2 rounded">
                    <strong>Response:</strong> {JSON.stringify(detail.response, null, 2)}
                  </pre>
                  <p><strong>Time:</strong> {detail.time} ms</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Benchmarking;
