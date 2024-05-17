"use client"
import React, { useEffect, useState, useParams } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const Page = ({ params }) => {
  const [groups, setGroups] = useState([]);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState(params.address);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCPU, setTotalCPU] = useState(0);
  const [totalMemory, setTotalMemory] = useState(0);
  const [totalStorage, setTotalStorage] = useState(0);
  const [totalGPU, setTotalGPU] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [pausedCount, setPausedCount] = useState(0);
  const [deployments, setDeployments] = useState([]);


  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const fetchLeaseInfo = async () => {
      const url = new URL('https://api.sandbox-01.aksh.pw/akash/market/v1beta4/leases/list');
      const params = { 'filters.owner': address };
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data); // Log the lease data
        setLeases(data.leases); // Assuming 'leases' is the key in the response
        return data.leases.map(lease => lease.lease.lease_id.dseq); // Extracting dseq values
      } catch (error) {
        console.error('There was an error fetching the lease info:', error);
        setLoading(false);
        return [];
      }
    };


    const fetchDeploymentsData = async () => {
      const response = await fetch(`https://api.sandbox-01.aksh.pw/akash/deployment/v1beta3/deployments/list?filters.owner=${address}`);
      const data = await response.json();

      if (data.deployments) {
          setDeployments(data.deployments);
      }
    };

    const fetchDeploymentInfo = async (dseq) => {
      const url = new URL('https://api.sandbox-01.aksh.pw:443/akash/deployment/v1beta3/deployments/info');
      const params = { 'id.owner': address, 'id.dseq': dseq };
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("hey", data.escrow_account.balance.amount); // Log the deployment data
        return data;
      } catch (error) {
        console.error('There was an error fetching the deployment info:', error);
        return null;
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      const dseqs = await fetchLeaseInfo();
      if (!Array.isArray(dseqs)) {
        console.error('Invalid dseqs data:', dseqs);
        setLoading(false);
        return;
      }

      const deploymentData = await Promise.all(dseqs.map(dseq => fetchDeploymentInfo(dseq)));
      const filteredDeploymentData = deploymentData.filter(data => data !== null);

      if (!Array.isArray(filteredDeploymentData)) {
        console.error('Invalid filteredDeploymentData data:', filteredDeploymentData);
        setLoading(false);
        return;
      }

      const totalAmount = filteredDeploymentData.reduce((sum, data) => sum + parseInt(data.escrow_account.balance.amount), 0);
      setTotalAmount(totalAmount);

      // Calculate total CPU, Memory, Storage, and GPU
      let totalCPU = 0, totalMemory = 0, totalStorage = 0, totalGPU = 0;
      filteredDeploymentData.forEach(data => {
        if (Array.isArray(data.groups)) {
          data.groups.forEach(group => {
            if (Array.isArray(group.group_spec.resources)) {
              group.group_spec.resources.forEach(resource => {
                totalCPU += resource.resource.cpu.units.val * 0.001;
                totalMemory += resource.resource.memory.quantity.val / 1000000;
                totalStorage += resource.resource.storage[0].quantity.val / 1000000;
                totalGPU += resource.resource.gpu.units.val;
              });
            } else {
              console.error('Invalid group.group_spec.resources data:', group.group_spec.resources);
            }
          });
        } else {
          console.error('Invalid data.groups data:', data.groups);
        }
      });
      setTotalCPU(totalCPU.toFixed(2));
      setTotalMemory(totalMemory.toFixed(2));
      setTotalStorage(totalStorage.toFixed(2));
      setTotalGPU(totalGPU);

      // Count active and paused deployments
      let activeCount = 0, pausedCount = 0;
      filteredDeploymentData.forEach(data => {
        if (Array.isArray(data.groups)) {
          data.groups.forEach(group => {
            if (group.state === 'open') {
              activeCount++;
            } else if (group.state === 'paused'){
              pausedCount++;
            }

          });
        } else {
          console.error('Invalid data.groups data:', data.groups);
        }
      });
      setActiveCount(activeCount);
      setPausedCount(pausedCount);

      setGroups(filteredDeploymentData.flatMap(data => data.groups));
      setLoading(false);
    };

    fetchAllData();
    fetchDeploymentsData();
  }, [address]);

  const generateChartData = () => {
    const labels = deployments.map(deployment => deployment.deployment.deployment_id.dseq);
    const data = {
        labels,
        datasets: [
            {
                label: 'Cost (AKT)',
                data: deployments.map(deployment => parseFloat(deployment.escrow_account.balance.amount) / 1000000),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }
        ]
    };
    console.log(data);
    return data;
};
  if (loading) {
    return <div className="p-6"><p className="text-center">Loading...</p></div>;
  }

  return (
    <div className="p-6">
      {/* <div className="mb-6">
      <Bar data={generateChartData()}
        options={{
           responsive: true, plugins: { legend: { position: 'top' }, title: { display: false, text: 'Costs per Deployment' } } }}
      />

      </div> */}

      <p className="text-4xl text-center mt-10 mb-6">Your Deployments</p>
      {groups.length === 0 ? (
        <p className="text-center">No deployments found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <p className="text-lg font-bold mb-2">DSEQ: {group.group_id.dseq}</p>
                <p className="text-lg font-bold mb-2">State: {group.state}</p>
              </div>
              <div className="bg-gray-100 p-6">
                <p className="text-md font-semibold mb-2">Resources:</p>
                {group.group_spec.resources.map((resource, resIndex) => (
                  <div key={resIndex} className="border p-4 rounded-lg mb-4 bg-white">
                    <p>CPU: {0.001 * resource.resource.cpu.units.val} cores</p>
                    <p>Memory: {(resource.resource.memory.quantity.val / 1000000).toFixed(2)} MBs</p>
                    <p>Storage: {(resource.resource.storage[0].quantity.val / 1000000).toFixed(2)} MBs</p>
                    <p>GPU: {resource.resource.gpu.units.val}</p>
                    <p>Endpoints: {resource.resource.endpoints.map(endpoint => endpoint.kind).join(', ')}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-gray-200">
                <p className="text-sm text-gray-600">Created at: {group.created_at}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;