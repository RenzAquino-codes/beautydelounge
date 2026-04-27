import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMoneyBillWave, FaChartLine, FaStar } from "react-icons/fa";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, LabelList, LineChart, Line 
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const title = label || payload[0].payload.name || payload[0].name;
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

// Dynamic Y-Axis: Shortens text drastically on mobile so charts don't overflow
const CustomYAxisTick = ({ x, y, payload, isMobile }) => {
    const MAX_CHARS = isMobile ? 10 : 28;
    const text = payload.value.length > MAX_CHARS ? payload.value.substring(0, MAX_CHARS) + "..." : payload.value;
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={4} textAnchor="end" fill="#6b5c45" fontSize={11} fontWeight={500}>
                {text}
            </text>
        </g>
    );
};

function Analytics() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // NEW: View Mode State (Dropdown)
    const [selectedChart, setSelectedChart] = useState("All");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 1. Most Availed Services
    const serviceCount = transactions.reduce((acc, t) => {
        const serviceList = Array.isArray(t.service) ? t.service : [t.service];
        serviceList.forEach(s => { if (s) acc[s] = (acc[s] || 0) + 1; });
        return acc;
    }, {});
    const serviceData = Object.entries(serviceCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.count - b.count); 

    // 2. Earnings per Service
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

    // 3. Paid vs Pending
    const statusCount = transactions.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});
    const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    // 4. Monthly Earnings
    const monthlyEarnings = transactions.reduce((acc, t) => {
        if (!t.date || t.status !== 'Paid') return acc;
        const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + Number(t.amount);
        return acc;
    }, {});
    const monthlyData = Object.entries(monthlyEarnings)
        .map(([name, earnings]) => ({ name, earnings }))
        .sort((a, b) => new Date(a.name) - new Date(b.name));

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
                    <div style={{ flex: 1 }}>
                        <h1>Analytics Insight</h1>
                        <p>Track your salon's growth and most profitable services.</p>
                    </div>
                    
                    {/* UPGRADED: Dropdown Chart Selector */}
                    <div className="filter-controls" style={{ marginTop: isMobile ? '15px' : '0' }}>
                        <div className="category-filter" style={{ minWidth: isMobile ? '100%' : '250px' }}>
                            <select 
                                value={selectedChart} 
                                onChange={(e) => setSelectedChart(e.target.value)} 
                                className="filter-select"
                            >
                                <option value="All">All Analytics</option>
                                <option value="Monthly Revenue">Monthly Revenue</option>
                                <option value="Most Availed Services">Most Availed Services</option>
                                <option value="Earnings By Service">Earnings By Service</option>
                                <option value="Payment Status">Payment Status</option>
                            </select>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '80px', color: '#8c7a60' }}>Loading analytics...</div>
                ) : (
                    <>
                        <div className="analytics-summary">
                            <div className="summary-card" style={{ borderLeft: '4px solid #c9a84c' }}>
                                <p className="summary-label"><FaMoneyBillWave style={{ marginRight: '6px' }} />Total Earnings</p>
                                <h3 className="summary-value">₱{totalEarned.toLocaleString()}</h3>
                            </div>
                            <div className="summary-card" style={{ borderLeft: '4px solid #8c7a60' }}>
                                <p className="summary-label"><FaChartLine style={{ marginRight: '6px' }} />Total Transactions</p>
                                <h3 className="summary-value" style={{ color: '#8c7a60' }}>{transactions.length}</h3>
                            </div>
                            <div className="summary-card" style={{ borderLeft: '4px solid #d4b870' }}>
                                <p className="summary-label"><FaStar style={{ marginRight: '6px' }} />Top Ranked Service</p>
                                <h3 className="summary-value" style={{ fontSize: '16px', lineHeight: '1.4' }}>{topService}</h3>
                            </div>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="no-results" style={{ marginTop: '40px', padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px' }}>
                                No analytical data found yet. Add some transactions!
                            </div>
                        ) : (
                            <div className="analytics-grid">
                                
                                {/* 1. Monthly Revenue */}
                                {(selectedChart === "All" || selectedChart === "Monthly Revenue") && (
                                    <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                                        <h3 className="chart-title">Monthly Revenue</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={monthlyData} margin={{ top: 20, right: isMobile ? 10 : 30, left: isMobile ? -10 : 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e0b0" />
                                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b5c45' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 11, fill: '#6b5c45' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₱${val.toLocaleString()}`} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="earnings" stroke="#c9a84c" strokeWidth={3} dot={{ r: 5, fill: '#c9a84c' }} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* 2. Most Availed Services */}
                                {(selectedChart === "All" || selectedChart === "Most Availed Services") && (
                                    <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                                        <h3 className="chart-title">Most Availed Services</h3>
                                        <ResponsiveContainer width="100%" height={Math.max(300, serviceData.length * 45)}>
                                            <BarChart data={serviceData} layout="vertical" margin={{ top: 5, right: isMobile ? 30 : 40, left: isMobile ? 80 : 200, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0e0b0" />
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" width={isMobile ? 75 : 190} tick={<CustomYAxisTick isMobile={isMobile}/>} axisLine={false} tickLine={false} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201, 168, 76, 0.05)' }} />
                                                <Bar dataKey="count" fill="#c9a84c" radius={[0, 4, 4, 0]} barSize={isMobile ? 16 : 22}>
                                                    <LabelList dataKey="count" position="right" style={{ fill: '#8c7a60', fontSize: '12px', fontWeight: 600 }} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* 3. Earnings By Service */}
                                {(selectedChart === "All" || selectedChart === "Earnings By Service") && (
                                    <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                                        <h3 className="chart-title">Earnings By Service</h3>
                                        <ResponsiveContainer width="100%" height={Math.max(300, earningsData.length * 45)}>
                                            <BarChart data={earningsData} layout="vertical" margin={{ top: 5, right: isMobile ? 50 : 90, left: isMobile ? 80 : 200, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0e0b0" />
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" width={isMobile ? 75 : 190} tick={<CustomYAxisTick isMobile={isMobile}/>} axisLine={false} tickLine={false} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201, 168, 76, 0.05)' }} />
                                                <Bar dataKey="earnings" fill="#a07830" radius={[0, 4, 4, 0]} barSize={isMobile ? 16 : 22}>
                                                    <LabelList dataKey="earnings" position="right" formatter={(val) => `₱${val.toLocaleString()}`} style={{ fill: '#8c7a60', fontSize: '11px', fontWeight: 600 }} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* 4. Payment Status */}
                                {(selectedChart === "All" || selectedChart === "Payment Status") && (
                                    <div className="chart-card" style={selectedChart === "Payment Status" ? { gridColumn: '1 / -1' } : {}}>
                                        <h3 className="chart-title">Payment Status</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie 
                                                    data={statusData} cx="50%" cy="50%" 
                                                    innerRadius={isMobile ? 50 : 70} outerRadius={isMobile ? 80 : 100} 
                                                    paddingAngle={4} dataKey="value" stroke="none"
                                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                    labelLine={false}
                                                >
                                                    {statusData.map((entry, index) => (
                                                        <Cell key={index} fill={entry.name === 'Paid' ? '#c9a84c' : '#e74c3c'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend iconType="circle" iconSize={12} formatter={(value) => <span style={{ color: '#3a3020', fontWeight: 500 }}>{value}</span>} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default Analytics;