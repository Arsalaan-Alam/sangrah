"use client";
import React, { useState, useEffect } from 'react';
import { SigningCosmosClient } from '@cosmjs/launchpad';
import { useRouter } from 'next/navigation';

const Header = () => {
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
    <header className="bg-white shadow">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
       <a href='/'> <div className="text-3xl font-bold text-blue-500 mr-4">Sangrah</div></a>
        <div className="flex items-center justify-center flex-grow">
          <nav className="flex space-x-16">
           
           
            {/* <a href="/pricing" className="text-gray-700 hover:text-blue-500">Pricing Data</a> */}
            <a href={`/deployments/${address}`} className="text-gray-700 hover:text-blue-500">Your Deployments</a>
            <a href={`/info/${address}`} className="text-gray-700 hover:text-blue-500">Billing Insights</a>
            <a href="/benchmarking" className="text-gray-700 hover:text-blue-500">Run Benchmarks</a>
            <a href="/providers" className="text-gray-700 hover:text-blue-500">Providers</a>
          </nav>
        </div>
        <div>
          {isConnected ? (
            <button
              onClick={disconnectKeplr}
              className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Disconnect Wallet
            </button>
          ) : (
            <button
              onClick={initializeKeplr}
              className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;