"use client";
import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page = ({ params }) => {
    const [userAddress, setUserAddress] = useState(params.address);
    const [deployments, setDeployments] = useState([]);
    const [timeRange, setTimeRange] = useState('This Month');
    const [isLoading, setIsLoading] = useState(true);
    const [noDeployments, setNoDeployments] = useState(false);

    useEffect(() => {
        const fetchDeploymentData = async () => {
            try {
                const response = await fetch(`https://api.sandbox-01.aksh.pw/akash/deployment/v1beta3/deployments/list?filters.owner=${userAddress}`);
                const data = await response.json();

                if (data.deployments) {
                    setDeployments(data.deployments);
                    setNoDeployments(data.deployments.length === 0);
                }
            } catch (error) {
                console.error("Error fetching deployment data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDeploymentData();
    }, [userAddress]);

    const handleExportInvoice = () => {
        const doc = new jsPDF();
        const tableColumn = ["Deployment ID", "Cost", "CPU", "Memory (mbs)", "GPU", "Status"];
        const tableRows = [];
    
        deployments.forEach(deployment => {
            const deploymentData = [
                deployment.deployment.deployment_id.dseq,
                (parseFloat(deployment.escrow_account.balance.amount) / 1000000).toFixed(7) + " AKT",
                (deployment.groups[0]?.group_spec.resources[0].resource.cpu.units.val / 1000 || "N/A"),
                (deployment.groups[0]?.group_spec.resources[0].resource.memory.quantity.val / (1024 * 1024) || "N/A"),
                (deployment.groups[0]?.group_spec.resources[0].resource.gpu.units.val || "N/A"),
                deployment.deployment.state || "N/A"
            ];
            tableRows.push(deploymentData);
        });

        // Add final totals
        tableRows.push([
            "Total",
            deployments.reduce((acc, deployment) => acc + parseFloat(deployment.escrow_account.balance.amount), 0) / 1000000 + " AKT",
            deployments.reduce((acc, deployment) => acc + parseFloat(deployment.groups[0]?.group_spec.resources[0].resource.cpu.units.val), 0) / 1000,
            deployments.reduce((acc, deployment) => acc + parseFloat(deployment.groups[0]?.group_spec.resources[0].resource.memory.quantity.val), 0) / (1024 * 1024),
            deployments.reduce((acc, deployment) => acc + parseFloat(deployment.groups[0]?.group_spec.resources[0].resource.gpu.units.val), 0),
            ""
        ]);
    
        doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20, 
            didDrawCell: (data) => {
                if (data.row.index === tableRows.length - 1) {
                    doc.setFontStyle('bold');
                }
            }
        });
        doc.text("Deployment Invoice", 14, 15);
        doc.save("invoice.pdf");
    };

    const filterDeployments = () => {
        let filteredDeployments = deployments;
        const now = moment();

        if (timeRange === 'This Month') {
            filteredDeployments = deployments.filter(deployment => moment(deployment.creation_time).isSame(now, 'month'));
        } else if (timeRange === 'Last Three Months') {
            filteredDeployments = deployments.filter(deployment => moment(deployment.creation_time).isAfter(now.subtract(3, 'months')));
        } else if (timeRange === 'This Year') {
            filteredDeployments = deployments.filter(deployment => moment(deployment.creation_time).isSame(now, 'year'));
        }
        console.log(filteredDeployments);

        return filteredDeployments;
    };

    const TableTimeOptions = () => {
        const options = [
            { id: 'This Month', value: 'This Month' },
            { id: 'Last Three Months', value: 'Last Three Months' },
            { id: 'This Year', value: 'This Year' }
        ];
        return (
            options.map((option, index) => (
                <option key={index} value={option.value} defaultValue={timeRange === option.value}>{option.id}</option>
            ))
        );
    };

    const generateChartData = () => {
        const filteredDeployments = filterDeployments();

        const labels = filteredDeployments.map(deployment => deployment.deployment.deployment_id.dseq);
        const data = {
            labels,
            datasets: [
                {
                    label: 'Cost (AKT)',
                    data: filteredDeployments.map(deployment => parseFloat(deployment.escrow_account.balance.amount) / 1000000),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2
                }
            ]
        };

        return data;
    };

    return (
        <div className="container mx-auto mt-4 p-4">
            <h1 className="text-2xl font-bold mb-4">Billing Insights</h1>
            <div className="mb-4">
                <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700">Select Time Range:</label>
                <select
                    id="timeRange"
                    // className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-indigo-500 sm:text-sm rounded-md"
                    defaultValue={timeRange}
                    key={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                >
                    <TableTimeOptions />
                </select>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <span>Loading...</span>
                </div>
            ) : noDeployments ? (
                <div className="text-center text-gray-500">No deployments found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border">Deployment ID</th>
                                <th className="px-4 py-2 border">Cost</th>
                                <th className="px-4 py-2 border">CPU</th>
                                <th className="px-4 py-2 border">Memory (mbs)</th>
                                <th className="px-4 py-2 border">GPU</th>
                                <th className="px-4 py-2 border">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filterDeployments().map((deployment) => 
                            {
                                console.log(">>>>> Deployment")
                            console.log(deployment)    
                            return (
                                <tr key={deployment.deployment_id}>
                                    <td className="px-4 py-2 border">{deployment.deployment.deployment_id.dseq}</td>
                                    <td className="px-4 py-2 border">{(parseFloat(deployment.escrow_account.balance.amount) / 1000000).toFixed(7)} AKT</td>
                                    <td className="px-4 py-2 border">{deployment.groups[0]?.group_spec.resources[0].resource.cpu.units.val / 1000 || "N/A"}</td>
                                    <td className="px-4 py-2 border">{deployment.groups[0]?.group_spec.resources[0].resource.memory.quantity.val / (1024 * 1024) || "N/A"}</td>
                                    <td className="px-4 py-2 border">{deployment.groups[0]?.group_spec.resources[0].resource.gpu.units.val || "N/A"}</td>
                                    <td className="px-4 py-2 border">{deployment.deployment.state || "N/A"}</td>
                                </tr>
                            )
                            }
                        )}
                        </tbody>
                        <tfoot>
                            <tr className='font-medium'>
                                <td className="px-4 py-2 border">Total</td>
                                <td className="px-4 py-2 border">{deployments.reduce((acc, deployment) => acc + parseFloat(deployment.escrow_account.balance.amount), 0) / 1000000} AKT</td>
                                <td className="px-4 py-2 border">{deployments.reduce((acc, deployment) => acc + parseFloat(deployment.groups[0]?.group_spec.resources[0].resource.cpu.units.val), 0) / 1000}</td>
                                <td className="px-4 py-2 border">{deployments.reduce((acc, deployment) => acc + parseFloat(deployment.groups[0]?.group_spec.resources[0].resource.memory.quantity.val), 0) / (1024 * 1024)}</td>
                                <td className="px-4 py-2 border">{deployments.reduce((acc, deployment) => acc + parseFloat(deployment.groups[0]?.group_spec.resources[0].resource.gpu.units.val), 0)}</td>
                                <td className="px-4 py-2 border"></td>
                            </tr>
                        </tfoot>
                    </table>
                    <button className="mt-4 px-4 mb-5 py-2 bg-blue-600 text-white rounded-md" onClick={handleExportInvoice}>
                Export Invoice
            </button>
            <h1 className="text-2xl mt-5 font-bold mb-4">Costs per Deployment</h1>
                    <div className="mt-4">
                        <Bar data={generateChartData()} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: false, text: 'Costs per Deployment' } } }} />
                    </div>
                </div>
            )}

        </div>
    );
};

export default Page;
