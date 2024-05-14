"use client";
import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.cloudmos.io/v1/dashboard-data');
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <p className='mt-4'>Loading...</p>;
  }

  if (!data) {
    return <p>No data available</p>;
  }

  return (
    <div className="container mx-auto p-4 mt-4">
     
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Chain Stats</h2>
        <div className="bg-white p-4 rounded shadow">
          <p><strong>Height:</strong> {data.chainStats.height}</p>
          <p><strong>Transaction Count:</strong> {data.chainStats.transactionCount}</p>
          <p><strong>Bonded Tokens:</strong> {data.chainStats.bondedTokens}</p>
          <p><strong>Total Supply:</strong> {data.chainStats.totalSupply}</p>
          <p><strong>Community Pool:</strong> {data.chainStats.communityPool}</p>
          <p><strong>Inflation:</strong> {data.chainStats.inflation}</p>
          <p><strong>Staking APR:</strong> {data.chainStats.stakingAPR}</p>
        </div>
      </section>


      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Current Stats</h2>
        <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Spending</h3>
            <p><strong>Total UAKT Spent:</strong> {data.now.totalUAktSpent / 1000000}</p>
            <p><strong>Total UUSDC Spent:</strong> {data.now.totalUUsdcSpent}</p>
            <p><strong>Total UUSD Spent:</strong> {data.now.totalUUsdSpent}</p>
            <p><strong>Daily UAKT Spent:</strong> {data.now.dailyUAktSpent / 1000000}</p>
            <p><strong>Daily UUSDC Spent:</strong> {data.now.dailyUUsdcSpent}</p>
            <p><strong>Daily UUSD Spent:</strong> {data.now.dailyUUsdSpent}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Leases</h3>
            <p><strong>Active Lease Count:</strong> {data.now.activeLeaseCount}</p>
            <p><strong>Total Lease Count:</strong> {data.now.totalLeaseCount}</p>
            <p><strong>Daily Lease Count:</strong> {data.now.dailyLeaseCount}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Hardware Utilization</h3>
            <p><strong>Active CPU:</strong> {data.now.activeCPU}</p>
            <p><strong>Active GPU:</strong> {data.now.activeGPU}</p>
            <p><strong>Active Memory:</strong> {data.now.activeMemory}</p>
            <p><strong>Active Storage:</strong> {data.now.activeStorage}</p>
          </div>
        </div>
      </section>


      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Network Capacity</h2>
        <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Active Resources</h3>
            <p><strong>Active Provider Count:</strong> {data.networkCapacity.activeProviderCount}</p>
            <p><strong>Active CPU:</strong> {data.networkCapacity.activeCPU}</p>
            <p><strong>Active GPU:</strong> {data.networkCapacity.activeGPU}</p>
            <p><strong>Active Memory:</strong> {data.networkCapacity.activeMemory}</p>
            <p><strong>Active Storage:</strong> {data.networkCapacity.activeStorage}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Pending Resources</h3>
            <p><strong>Pending CPU:</strong> {data.networkCapacity.pendingCPU}</p>
            <p><strong>Pending GPU:</strong> {data.networkCapacity.pendingGPU}</p>
            <p><strong>Pending Memory:</strong> {data.networkCapacity.pendingMemory}</p>
            <p><strong>Pending Storage:</strong> {data.networkCapacity.pendingStorage}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Available Resources</h3>
            <p><strong>Available CPU:</strong> {data.networkCapacity.availableCPU}</p>
            <p><strong>Available GPU:</strong> {data.networkCapacity.availableGPU}</p>
            <p><strong>Available Memory:</strong> {data.networkCapacity.availableMemory}</p>
            <p><strong>Available Storage:</strong> {data.networkCapacity.availableStorage}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Total Network Resources</h3>
            <p><strong>Total CPU:</strong> {data.networkCapacity.totalCPU}</p>
            <p><strong>Total GPU:</strong> {data.networkCapacity.totalGPU}</p>
            <p><strong>Total Memory:</strong> {data.networkCapacity.totalMemory}</p>
            <p><strong>Total Storage:</strong> {data.networkCapacity.totalStorage}</p>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Latest Blocks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.latestBlocks.map((block) => (
            <div key={block.height} className="bg-white p-4 rounded shadow">
              <p><strong>Height:</strong> {block.height}</p>
              <p><strong>Proposer:</strong> {block.proposer.moniker}</p>
              <p><strong>Transaction Count:</strong> {block.transactionCount}</p>
              <p><strong>Date:</strong> {new Date(block.datetime).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Latest Transactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.latestTransactions.map((transaction) => (
            <div key={transaction.hash} className="bg-white p-4 rounded shadow break-all">
              <p><strong>Height:</strong> {transaction.height}</p>
              <p><strong>Date:</strong> {new Date(transaction.datetime).toLocaleString()}</p>
              <p><strong>Hash:</strong> {transaction.hash}</p>
              <p><strong>Gas Used:</strong> {transaction.gasUsed}</p>
              <p><strong>Gas Wanted:</strong> {transaction.gasWanted}</p>
              <p><strong>Fee:</strong> {transaction.fee}</p>
              <p><strong>Memo:</strong> {transaction.memo}</p>
              <div>
                <strong>Messages:</strong>
                <ul>
                  {transaction.messages.map((message) => (
                    <li key={message.id}>{message.type} - Amount: {message.amount}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
