"use client";
import React, { useState, useEffect } from 'react';
import { SigningCosmosClient } from '@cosmjs/launchpad';
import { useRouter } from 'next/navigation';
import Dashboard from './dashboard/page';

const Home = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedIsConnected = localStorage.getItem('isConnected');
    const storedAddress = localStorage.getItem('address');
    if (storedIsConnected === 'true' && storedAddress) {
      setIsConnected(true);
      setAddress(storedAddress);
    }
  }, []);

  const initializeKeplr = async () => {
    if (!window.keplr) {
      alert("Please install Keplr extension");
    } else {
      const chainId = "akashnet-2";
      await window.keplr.enable(chainId);
      try {
        const keyInfo = await window.keplr.getKey(chainId);
        console.log("Address:", keyInfo.bech32Address);
        setAddress(keyInfo.bech32Address);
        localStorage.setItem('address', keyInfo.bech32Address);
        const offlineSigner = window.keplr.getOfflineSigner(chainId);
        const accounts = await offlineSigner.getAccounts();
        const cosmJS = new SigningCosmosClient(
          "https://lcd-cosmoshub.keplr.app",
          accounts[0].address,
          offlineSigner,
        );
        setIsConnected(true);
        localStorage.setItem('isConnected', 'true');
      } catch (error) {
        console.error("Error getting key info:", error);
      }
    }
  };

  const disconnectKeplr = () => {
    localStorage.removeItem('isConnected');
    localStorage.removeItem('address');
    setIsConnected(false);
    setAddress('');
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-4xl font-bold text-center mt-10">Akash Dashboard</p>
      <div className="mt-8 flex justify-center">
        {!isConnected ? (
          <button
            onClick={initializeKeplr}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2"
              onClick={() => router.push(`/deployments/${address}`)}
            >
              Deployments Data
            </button>
            <a href="/providers">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2">
                Providers Data
              </button>
            </a>
            <a href="/pricing">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2">
                Pricing Data
              </button>
            </a>
           
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2"
              onClick={() => router.push(`/info/${address}`)} >
                Your Info
              </button>
         
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-2"
              onClick={disconnectKeplr}
            >
              Disconnect Wallet
            </button>
            <a href="/benchmarking">
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mx-2">
                Run Benchmarks
              </button>
            </a>
          </>
        )}
      </div>
      <Dashboard />
    </div>
  );
};

export default Home;