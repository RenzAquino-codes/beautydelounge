import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";


const COLORS = ['#c9a84c', '#e8d5a3', '#a07830', '#f0e0b0', '#7a5c28', '#d4b870', '#8c6820'];
// const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//         return (
//             <div style={{
//                 background: 'rgba(255,255,255,0.95)',
//                 border: '1px solid rgba(201,168,76,0.3)',
//                 borderRadius: '10px',
//                 padding: '12px 16px',
//                 fontSize: '13px',
//                 color: '#3a3020',
//                 boxShadow: '0 4px 12px rgba(74,63,47,0.1)'
//             }}>
//                 <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name}</p>
//                 <p style={{ margin: '4px 0 0', color: '#c9a84c' }}>{payload[0].value}</p>
//             </div>
//         );
//     }
//     return null;
// };


const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Line charts pass the x-axis name as 'label', Pie charts pass it inside 'payload[0].name'
        const title = label || payload[0].name;

        return (
            <div style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '13px',
                color: '#3a3020',
                boxShadow: '0 4px 12px rgba(74,63,47,0.1)'
            }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{title}</p>
                <p style={{ margin: '4px 0 0', color: '#c9a84c' }}>
                    ₱{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};


function Analytics() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("https://beautydelounge-backend.onrender.com/api/transactions", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch analytics data", err);
                setLoading(false);
            });
    }, []);

    // Most availed services (count per service)
    const serviceCount = transactions.reduce((acc, t) => {
        const serviceList = Array.isArray(t.service) ? t.service : [t.service];
        serviceList.forEach(s => {
            if (s) acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
    }, {});
    const serviceData = Object.entries(serviceCount).map(([name, value]) => ({ name, value }));

    // Earnings per service
    const serviceEarnings = transactions.reduce((acc, t) => {
        const serviceList = Array.isArray(t.service) ? t.service : [t.service];
        const primaryService = serviceList[0];
        if (primaryService) {
            acc[primaryService] = (acc[primaryService] || 0) + Number(t.amount);
        }
        return acc;
    }, {})
    const earningsData = Object.entries(serviceEarnings).map(([name, value]) => ({ name, value }));

    // Monthly earnings
    const monthlyEarnings = transactions.reduce((acc, t) => {
        if (!t.date) return acc;
        const month = new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        acc[month] = (acc[month] || 0) + Number(t.amount);
        return acc;
    }, {});
    const monthlyData = Object.entries(monthlyEarnings).map(([name, value]) => ({ name, value }));

    // Paid vs Pending
    const statusCount = transactions.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});
    const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    // Summary totals
    const totalEarned = transactions
        .filter(t => t.status === 'Paid')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalTransactions = transactions.length;
    const topService = serviceData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A';

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text x={x} y={y} fill="#3a3020" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <h2>BEA-UTY DE LOUNGE</h2>
                <nav>
                    <div className="nav-item" onClick={() => navigate("/dashboard")}>
                        <FaArrowLeft /> <span>Back</span>
                    </div>
                    <div className="nav-item logout" onClick={handleLogout}>
                        <HiArrowLeftEndOnRectangle /> <span>Logout</span>
                    </div>
                </nav>
            </aside>

            <main className="main-content">
                <header className="dashboard-header">
                    <h1>Analytics</h1>
                    <p>Overview of your salon's performance</p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '80px', color: '#8c7a60' }}>
                        Loading analytics...
                    </div>
                ) : (
                    <>
                        {/* SUMMARY CARDS */}
                        <div className="analytics-summary">
                            <div className="summary-card">
                                <p className="summary-label">Total Earned</p>
                                <h3 className="summary-value">₱{totalEarned.toLocaleString()}</h3>
                            </div>
                            <div className="summary-card">
                                <p className="summary-label">Total Transactions</p>
                                <h3 className="summary-value">{totalTransactions}</h3>
                            </div>
                            <div className="summary-card">
                                <p className="summary-label">Top Service</p>
                                <h3 className="summary-value" style={{ fontSize: '18px' }}>{topService}</h3>
                            </div>
                        </div>

                        {/* CHARTS GRID */}
                        <div className="analytics-grid">

                            {/* Most Availed Services */}
                            <div className="chart-card">
                                <h3 className="chart-title">Most Availed Services</h3>
                                {serviceData.length === 0 ? (
                                    <p className="no-data">No data available</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={serviceData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={4}
                                                dataKey="value"
                                                labelLine={false}
                                                label={renderCustomLabel}
                                            >
                                                {serviceData.map((_, index) => (
                                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend
                                                iconType="circle"
                                                iconSize={10}
                                                formatter={(value) => (
                                                    <span style={{ color: '#3a3020', fontSize: '12px' }}>{value}</span>
                                                )}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Earnings per Service */}
                            <div className="chart-card">
                                <h3 className="chart-title">Earnings per Service</h3>
                                {earningsData.length === 0 ? (
                                    <p className="no-data">No data available</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={earningsData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={4}
                                                dataKey="value"
                                                labelLine={false}
                                                label={renderCustomLabel}
                                            >
                                                {earningsData.map((_, index) => (
                                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend
                                                iconType="circle"
                                                iconSize={10}
                                                formatter={(value) => (
                                                    <span style={{ color: '#3a3020', fontSize: '12px' }}>
                                                        {value} — ₱{earningsData.find(d => d.name === value)?.value?.toLocaleString()}
                                                    </span>
                                                )}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Monthly Earnings */}
                            <div className="chart-card">
                                <h3 className="chart-title">Monthly Earnings</h3>
                                {monthlyData.length === 0 ? (
                                    <p className="no-data">No data available</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                            {/* Adds horizontal grid lines for readability */}
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />

                                            {/* X-Axis shows the month names */}
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: '#8c7a60', fontSize: 12 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />

                                            {/* Y-Axis shows the earnings amounts */}
                                            <YAxis
                                                tick={{ fill: '#8c7a60', fontSize: 12 }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(value) => `₱${value.toLocaleString()}`}
                                            />

                                            <Tooltip content={<CustomTooltip />} />

                                            {/* The actual line graph */}
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#c9a84c"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#ffffff', stroke: '#c9a84c', strokeWidth: 2 }}
                                                activeDot={{ r: 6, fill: '#c9a84c', stroke: '#ffffff' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Paid vs Pending */}
                            <div className="chart-card">
                                <h3 className="chart-title">Paid vs Pending</h3>
                                {statusData.length === 0 ? (
                                    <p className="no-data">No data available</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={4}
                                                dataKey="value"
                                                labelLine={false}
                                                label={renderCustomLabel}
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={entry.name === 'Paid' ? '#c9a84c' : '#d4c0a8'}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend
                                                iconType="circle"
                                                iconSize={10}
                                                formatter={(value) => (
                                                    <span style={{ color: '#3a3020', fontSize: '12px' }}>{value}</span>
                                                )}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default Analytics;