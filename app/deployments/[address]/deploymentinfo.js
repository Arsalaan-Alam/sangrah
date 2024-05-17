import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DeploymentInfo = ({
  totalAmount,
  totalCPU,
  totalMemory,
  totalStorage,
  totalGPU,
  activeCount,
  pausedCount,
}) => {
  const priceThisMonth = (totalAmount / 1000000).toFixed(2);
  const pricePerDay = (totalAmount / 1000000 / 30).toFixed(2);
  const yearlyEstimate = (totalAmount / 1000000 * 12).toFixed(2);

  const chartData = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        label: 'Monthly Cost',
        data: [
          priceThisMonth,
          priceThisMonth,
          priceThisMonth,
          priceThisMonth,
          priceThisMonth,
          priceThisMonth,
          priceThisMonth,
          priceThisMonth,
          priceThisMonth,
          priceThisMonth,
          priceThisMonth,
          priceThisMonth,
        ],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Deployment Info</h2>
        <p className="text-lg">Price Estimate for the Entire Year: {yearlyEstimate} AKT</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-lg mb-2">Cost this month: {priceThisMonth} AKT</p>
          <p className="text-lg mb-2">Cost today: {pricePerDay} AKT</p>
          <p className="text-lg mb-2">Total CPU: {totalCPU} cores</p>
          <p className="text-lg mb-2">Total Memory: {totalMemory} MBs</p>
          <p className="text-lg mb-2">Total Storage: {totalStorage} MBs</p>
          <p className="text-lg mb-2">Total GPU: {totalGPU}</p>
          <p className="text-lg mb-2">Active Deployments: {activeCount}</p>
          <p className="text-lg mb-2">Paused Deployments: {pausedCount}</p>
        </div>
        <div>
          <Line data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default DeploymentInfo;