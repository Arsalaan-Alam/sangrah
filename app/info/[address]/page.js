"use client";
import React, { useEffect, useState } from 'react';

const Page = ({ params }) => {
    const [userAddress, setUserAddress] = useState(params.address);
    const [balanceSum, setBalanceSum] = useState(0);
    const [activeDeployments, setActiveDeployments] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        const fetchDeploymentData = async () => {
            try {
                const response = await fetch(`https://api.sandbox-01.aksh.pw/akash/deployment/v1beta3/deployments/list?filters.owner=${userAddress}`);
                const data = await response.json();
                
                if (data.deployments) {
                    let sum = 0;
                    let activeCount = 0;

                    data.deployments.forEach(deployment => {
                        // Calculate the sum of escrow account balances
                        const balance = parseFloat(deployment.escrow_account.balance.amount);
                        sum += isNaN(balance) ? 0 : balance;

                        // Count active deployments
                        deployment.groups.forEach(group => {
                            if (["paused", "active", "open"].includes(group.state)) {
                                console.log(group.state);
                                activeCount++;
                            }
                        });
                    });

                    setBalanceSum(sum);
                    setActiveDeployments(activeCount);
                }
            } catch (error) {
                console.error("Error fetching deployment data:", error);
            }
        };

        const fetchWalletData = async () => {
            try {
                const response = await fetch(`https://api-sandbox.cloudmos.io/v1/addresses/${userAddress}`);
                const data = await response.json();

                if (data.assets && data.assets.length > 0) {
                    const aktAsset = data.assets.find(asset => asset.symbol === "AKT");
                    if (aktAsset) {
                        setWalletBalance(aktAsset.amount);
                    }
                }
            } catch (error) {
                console.error("Error fetching wallet data:", error);
            }
        };

        fetchDeploymentData();
        fetchWalletData();
    }, [userAddress]);

    return (
        <div>
            <h1>Billing Insights</h1>
            <p>Total Deployment Price: {(balanceSum / 1000000).toFixed(2)} Aakt</p>
            <p>Number of Active Deployments: {activeDeployments}</p>
            <p>Wallet Balance: {walletBalance.toFixed(2)} AKT</p>
        </div>
    );
};

export default Page;
