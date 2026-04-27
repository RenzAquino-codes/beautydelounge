import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMoneyBillWave, FaChartLine, FaStar } from "react-icons/fa";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
    BarChart, Bar
} from "recharts";


const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const title = label || payload[0].payload.name;
        const value = payload[0].value;
        const isMoney = payload[0].dataKey === 'earnings';

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
                <p style={{ margin: '4px 0 0', color: '#c9a84c', fontSize: '15px', fontWeight: 600 }}>
                    {isMoney ? `₱${value.toLocaleString()}` : `${value} transactions`}
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
        localStorage.clear();
        navigate("/");
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("https://beautydelounge-backend.onrender.com/api/transactions", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // 1. Most Availed Services (Sorted for Bar Chart)
    const serviceCount = transactions.reduce((acc, t) => {
        const serviceList = Array.isArray(t.service) ? t.service : [t.service];
        serviceList.forEach(s => { if (s) acc[s] = (acc[s] || 0) + 1; });
        return acc;
    }, {});
    const serviceData = Object.entries(serviceCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.count - b.count); // Sort ascending so highest is at top of vertical chart

    // 2. Earnings per Service (Sorted for Bar Chart)
    const serviceEarnings = transactions.reduce((acc, t) => {
        const serviceList = Array.isArray(t.service) ? t.service : [t.service];
        const primaryService = serviceList[0];
        if (primaryService && t.status === 'Paid') {
            acc[primaryService] = (acc[primaryService] || 0) + Number(t.amount);
        }
        return acc;
    }, {})
    const earningsData = Object.entries(serviceEarnings)
        .map(([name, earnings]) => ({ name, earnings }))
        .sort((a, b) => a.earnings - b.earnings); 

    // 3. Monthly Earnings


    // 4. Paid vs Pending
    const statusCount = transactions.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});
    const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    const totalEarned = transactions.filter(t => t.status === 'Paid').reduce((sum, t) => sum + Number(t.amount), 0);
    const topService = serviceData[serviceData.length - 1]?.name || 'N/A';

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <h2>BEA-UTY DE LOUNGE</h2>
                <nav>
                    <div className="nav-item" onClick={() => navigate("/dashboard")}><FaArrowLeft /> <span>Back</span></div>
                    <div className="nav-item logout" onClick={handleLogout}><HiArrowLeftEndOnRectangle /> <span>Logout</span></div>
                </nav>
            </aside>

            <main className="main-content">
                <header className="dashboard-header">
                    <h1>Analytics Insight</h1>
                    <p>Track your salon's growth and most profitable services.</p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '80px', color: '#8c7a60' }}>Loading analytics...</div>
                ) : (
                    <>
                        <div className="analytics-summary">
                            <div className="summary-card" style={{ borderLeft: '4px solid #c9a84c' }}>
                                <p className="summary-label"><FaMoneyBillWave style={{ marginRight: '6px' }} />Total Earned</p>
                                <h3 className="summary-value">₱{totalEarned.toLocaleString()}</h3>
                            </div>
                            <div className="summary-card" style={{ borderLeft: '4px solid #8c7a60' }}>
                                <p className="summary-label"><FaChartLine style={{ marginRight: '6px' }} />Total Transactions</p>
                                <h3 className="summary-value" style={{ color: '#8c7a60' }}>{transactions.length}</h3>
                            </div>
                            <div className="summary-card" style={{ borderLeft: '4px solid #d4b870' }}>
                                <p className="summary-label"><FaStar style={{ marginRight: '6px' }} />Top Performing Service</p>
                                <h3 className="summary-value" style={{ fontSize: '16px', lineHeight: '1.4' }}>{topService}</h3>
                            </div>
                        </div>

                        <div className="analytics-grid">
                            
                            {/* UPGRADED: Horizontal Bar Chart for Services */}
                            <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                                <h3 className="chart-title">Most Availed Services</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={serviceData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0e0b0" />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12, fill: '#6b5c45' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201, 168, 76, 0.05)' }} />
                                        <Bar dataKey="count" fill="#c9a84c" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* UPGRADED: Horizontal Bar Chart for Earnings */}
                            <div className="chart-card">
                                <h3 className="chart-title">Earnings By Service</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={earningsData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0e0b0" />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: '#6b5c45' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201, 168, 76, 0.05)' }} />
                                        <Bar dataKey="earnings" fill="#a07830" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* CLEANED UP: Donut Chart instead of Pie */}
                            <div className="chart-card">
                                <h3 className="chart-title">Payment Status</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none">
                                            {statusData.map((entry, index) => (
                                                <Cell key={index} fill={entry.name === 'Paid' ? '#c9a84c' : '#e74c3c'} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconType="circle" iconSize={12} formatter={(value) => <span style={{ color: '#3a3020', fontWeight: 500 }}>{value}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default Analytics;