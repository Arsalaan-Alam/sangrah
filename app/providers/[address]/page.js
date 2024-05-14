"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ProviderInfoPage = ({ params }) => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerAddress, setProviderAddress] = useState(params.address);


  useEffect(() => {
    if (providerAddress) {
      const fetchData = async () => {
        try {
          const response = await fetch(`https://api.cloudmos.io/v1/providers/${providerAddress}`);
          if (!response.ok) {
            throw new Error('Failed to fetch provider data');
          }
          const data = await response.json();
          setProvider(data);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [providerAddress]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6">Error: {error}</div>;
  }

  if (!provider) {
    return <div className="p-6">No provider data found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Provider Info</h1>
      <div className="bg-white shadow-md p-4 rounded-lg break-words">
        <h2 className="text-lg font-semibold mb-2">Address: {providerAddress}</h2>
        <p><strong>Owner:</strong> {provider.owner}</p>
        <p><strong>Name:</strong> {provider.name}</p>
        <p><strong>Host URI:</strong> {provider.hostUri}</p>
        <p><strong>Lease Count:</strong> {provider.leaseCount}</p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <h3 className="text-md font-semibold">Active Stats</h3>
            <p><strong>CPU:</strong> {provider.activeStats.cpu || 'N/A'}</p>
            <p><strong>GPU:</strong> {provider.activeStats.gpu || 'N/A'}</p>
            <p><strong>Memory:</strong> {provider.activeStats.memory || 'N/A'}</p>
            <p><strong>Storage:</strong> {provider.activeStats.storage || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-md font-semibold">Pending Stats</h3>
            <p><strong>CPU:</strong> {provider.pendingStats.cpu || 'N/A'}</p>
            <p><strong>GPU:</strong> {provider.pendingStats.gpu || 'N/A'}</p>
            <p><strong>Memory:</strong> {provider.pendingStats.memory || 'N/A'}</p>
            <p><strong>Storage:</strong> {provider.pendingStats.storage || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-md font-semibold">Available Stats</h3>
            <p><strong>CPU:</strong> {provider.availableStats.cpu || 'N/A'}</p>
            <p><strong>GPU:</strong> {provider.availableStats.gpu || 'N/A'}</p>
            <p><strong>Memory:</strong> {provider.availableStats.memory || 'N/A'}</p>
            <p><strong>Storage:</strong> {provider.availableStats.storage || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderInfoPage;
