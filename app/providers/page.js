"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [providers, setProviders] = useState([]);
  const [searchAddress, setSearchAddress] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://ih7flrjj5haktfm78vg4udl7j4.ingress.akashprovid.com/https://api.cloudmos.io/v1/providers');
        const data = await response.json();
        // Filter providers where hostingProvider is not null and isOnline is true
        const filteredProviders = data.filter(provider => provider.hostingProvider !== null && provider.isOnline === true);
        // Reverse the array to display in LIFO manner
        setProviders(filteredProviders.reverse());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchAddress) {
      router.push(`/providers/${searchAddress}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Online Providers Data</h1>
      <form onSubmit={handleSearchSubmit} className="mb-6 flex">
        <input
          type="text"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          placeholder="Enter provider address"
          className="border p-2 rounded-l-md flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 transition-colors duration-200">
          Submit
        </button>
      </form>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {providers.map(provider => (
          <div key={provider.owner} className="bg-white shadow-md p-4 rounded-lg break-words">
            <h2 className="text-lg font-semibold mb-2">{provider.hostUri}</h2>
            <p><strong>Owner:</strong> {provider.owner}</p>
            <p><strong>Active Stats:</strong></p>
            <ul>
              <li><strong>CPU:</strong> {provider.activeStats.cpu || 'N/A'}</li>
              <li><strong>GPU:</strong> {provider.activeStats.gpu || 'N/A'}</li>
              <li><strong>Memory:</strong> {provider.activeStats.memory || 'N/A'}</li>
              <li><strong>Storage:</strong> {provider.activeStats.storage || 'N/A'}</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
