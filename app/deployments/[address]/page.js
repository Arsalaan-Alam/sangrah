"use client"
import React, { useEffect, useState, useParams } from 'react';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Router } from "next/router";

const Page = ({params}) => {
  const [groups, setGroups] = useState([]);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState(params.address)


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
        return data.groups;
      } catch (error) {
        console.error('There was an error fetching the deployment info:', error);
        return [];
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      const dseqs = await fetchLeaseInfo();
      const groupsData = await Promise.all(dseqs.map(dseq => fetchDeploymentInfo(dseq)));
      setGroups(groupsData.flat()); // Flattening the array of arrays
      setLoading(false);
    };

    fetchAllData();
  }, [address]);

  if (loading) {
    return <div className="p-6"><p className="text-center">Loading...</p></div>;
  }

  return (
    <div className="p-6">
      <p className="text-4xl text-center mt-10 mb-6">Your Deployments</p>
      {groups.length === 0 ? (
        <p className="text-center">No deployments found.</p>
      ) : (
        groups.map((group, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <p className="text-lg font-bold mb-2">Owner: {group.group_id.owner}</p>
            <p className="text-lg font-bold mb-2">State: {group.state}</p>
            <p className="text-lg font-bold mb-2">Name: {group.group_spec.name}</p>
            <div className="mb-4">
              <p className="text-md font-semibold">Resources:</p>
              {group.group_spec.resources.map((resource, resIndex) => (
                <div key={resIndex} className="border p-4 rounded-lg mt-2">
                  <p>CPU: {0.001 * resource.resource.cpu.units.val} cores</p>
                  <p>Memory: {resource.resource.memory.quantity.val / 1000000} MBs</p>
                  <p>Storage: {resource.resource.storage[0].quantity.val / 1000000} MBs</p>
                  <p>GPU: {resource.resource.gpu.units.val}</p>
                  <p>Endpoints: {resource.resource.endpoints.map(endpoint => endpoint.kind).join(', ')}</p>
                  <p>Price: {resource.price.amount} {resource.price.denom}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">Created at: {group.created_at}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Page;
