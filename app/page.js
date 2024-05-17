"use client";
import React from 'react';
import Header from './Header';
import Dashboard from './dashboard/page';
import { Router, Routes, Route, BrowserRouter } from 'react-router-dom';

const HomeComponent = () => {
  return (

    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <main className="flex flex-col items-center w-full">
        <p className="text-6xl font-semibold text-center mt-10 text-blue-500">Sangrah</p>
        <p className="text-2xl font-semibold text-center mt-2">Datahub for Deployments & Providers on Akash Network</p>
        <div className="mt-8 w-full max-w-4xl">
          <Dashboard />
        </div>
      </main>
    </div>
    
  );
};

const Home = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomeComponent />} />
    </Routes>
    </BrowserRouter>
  );
}


export default Home;
