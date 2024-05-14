"use client"
import React, { useState } from 'react';

const Page = () => {
  const [cpu, setCpu] = useState('');
  const [memory, setMemory] = useState('');
  const [storage, setStorage] = useState('');
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const memoryInBytes = memory * 1024 * 1024;
    const storageInBytes = storage * 1024 * 1024;

    const payload = {
      cpu: parseInt(cpu, 10),
      memory: memoryInBytes,
      storage: storageInBytes,
    };

    const url = 'https://api-sandbox.cloudmos.io/v1/pricing';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Pricing Data:', data);
      setPricingData(data);
    } catch (error) {
      console.error('There was an error fetching the pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <p className="text-4xl text-center mt-10 mb-6">Pricing Comparison</p>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cpu">
            CPU (milli-cores):
          </label>
          <input
            id="cpu"
            type="number"
            value={cpu}
            onChange={(e) => setCpu(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="memory">
            Memory (MB):
          </label>
          <input
            id="memory"
            type="number"
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="storage">
            Storage (MB):
          </label>
          <input
            id="storage"
            type="number"
            value={storage}
            onChange={(e) => setStorage(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'Loading...' : 'Get Pricing'}
          </button>
        </div>
      </form>
      {pricingData && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <p className="text-lg font-bold mb-2">Akash: ${pricingData.akash}</p>
          <p className="text-lg font-bold mb-2">AWS: ${pricingData.aws}</p>
          <p className="text-lg font-bold mb-2">GCP: ${pricingData.gcp}</p>
          <p className="text-lg font-bold mb-2">Azure: ${pricingData.azure}</p>
        </div>
      )}
    </div>
  );
}

export default Page;
