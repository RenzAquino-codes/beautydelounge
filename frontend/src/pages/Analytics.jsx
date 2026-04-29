import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMoneyBillWave, FaChartLine, FaStar, FaSearch } from "react-icons/fa";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, LabelList, LineChart, Line 
} from "recharts";
import "./Analytics.css"; // Ensure you import the new CSS file!

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const title = label || payload[0].payload.name || payload[0].name;
        const value = payload[0].value;
        const isMoney = payload[0].dataKey === 'earnings';

        return (
            <div className="custom-tooltip">
                <p className="custom-tooltip-title">{title}</p>
                <p className="custom-tooltip-value">
                    {isMoney ? `₱${value.toLocaleString()}` : `${value} transactions`}
                </p>
            </div>
        );
    }
    return null;
};

// Fixed truncating to ensure it fits mobile screens perfectly
const CustomYAxisTick = ({ x, y, payload, isMobile }) => {
    const MAX_CHARS = isMobile ? 12 : 22;
    const text = payload.value.length > MAX_CHARS ? payload.value.substring(0, MAX_CHARS) + "..." : payload.value;
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={4} textAnchor="end" fill="#6b5c45" fontSize={isMobile ? 10 : 12} fontWeight={500}>
                {text}
            </text>
        </g>
    );
};

function Analytics() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedChart, setSelectedChart] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
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

    const filteredTransactions = transactions.filter(t => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const clientMatch = t.client?.toLowerCase().includes(searchLower);
        const serviceMatch = Array.isArray(t.service) 
            ? t.service.some(s => s?.toLowerCase().includes(searchLower))
            : t.service?.toLowerCase().includes(searchLower);
        return clientMatch || serviceMatch;
    });

    const serviceCount = filteredTransactions.reduce((acc, t) => {
        const serviceList = Array.isArray(t.service) ? t.service : [t.service];
        serviceList.forEach(s => { if (s) acc[s] = (acc[s] || 0) + 1; });
        return acc;
    }, {});
    const serviceData = Object.entries(serviceCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.count - b.count); 

    const serviceEarnings = filteredTransactions.reduce((acc, t) => {
        const serviceList = Array.isArray(t.service) ? t.service : [t.service];
        const primaryService = serviceList[0];
        if (primaryService && t.status !== 'Pending') {
            acc[primaryService] = (acc[primaryService] || 0) + Number(t.amount);
        }
        return acc;
    }, {})
    const earningsData = Object.entries(serviceEarnings)
        .map(([name, earnings]) => ({ name, earnings }))
        .sort((a, b) => a.earnings - b.earnings); 

    const statusCount = filteredTransactions.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});
    const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    const monthlyEarnings = filteredTransactions.reduce((acc, t) => {
        if (!t.date || t.status === 'Pending') return acc;
        const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + Number(t.amount);
        return acc;
    }, {});
    const monthlyData = Object.entries(monthlyEarnings)
        .map(([name, earnings]) => ({ name, earnings }))
        .sort((a, b) => new Date(a.name) - new Date(b.name));

    const totalEarned = filteredTransactions.filter(t => t.status !== 'Pending').reduce((sum, t) => sum + Number(t.amount), 0);
    const topService = serviceData[serviceData.length - 1]?.name || 'N/A';

    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'cash': return '#2ecc71';
            case 'gcash': return '#3498db';
            case 'maya': return '#9b59b6';
            case 'bank transfer': return '#f1c40f';
            case 'pending': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

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
                    
                    <div className="filter-controls">
                        <div className="search-container">
                            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c9a84c' }}/>
                            <input 
                                type="text" 
                                placeholder="Search client or service..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="search-input"
                                style={{ paddingLeft: '35px' }}
                            />
                        </div>
                        <div className="category-filter">
                            <select 
                                value={selectedChart} 
                                onChange={(e) => setSelectedChart(e.target.value)} 
                                className="filter-select"
                            >
                                <option value="All">All Analytics</option>
                                <option value="Monthly Revenue">Monthly Revenue</option>
                                <option value="Most Availed Services">Most Availed Services</option>
                                <option value="Earnings By Service">Earnings By Service</option>
                                <option value="Payment Method">Payment Method</option>
                            </select>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '80px', color: '#8c7a60' }}>Loading analytics...</div>
                ) : (
                    <>
                        <div className="analytics-summary">
                            <div className="summary-card card-earnings">
                                <p className="summary-label"><FaMoneyBillWave />Total Earnings</p>
                                <h3 className="summary-value">₱{totalEarned.toLocaleString()}</h3>
                            </div>
                            <div className="summary-card card-transactions">
                                <p className="summary-label"><FaChartLine />Total Transactions</p>
                                <h3 className="summary-value secondary">{filteredTransactions.length}</h3>
                            </div>
                            <div className="summary-card card-top-service">
                                <p className="summary-label"><FaStar />Top Ranked Service</p>
                                <h3 className="summary-value text-small">{topService}</h3>
                            </div>
                        </div>

                        {filteredTransactions.length === 0 ? (
                            <div className="no-data-card">
                                No analytical data found for "{searchTerm}".
                            </div>
                        ) : (
                            <div className="analytics-grid">
                                
                                {(selectedChart === "All" || selectedChart === "Monthly Revenue") && (
                                    <div className="chart-card full-width">
                                        <h3 className="chart-title">Monthly Revenue</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={monthlyData} margin={{ top: 20, right: isMobile ? 10 : 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e0b0" />
                                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b5c45' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 11, fill: '#6b5c45' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₱${val.toLocaleString()}`} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="earnings" stroke="#c9a84c" strokeWidth={3} dot={{ r: 5, fill: '#c9a84c' }} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* FIX: Adjusted left margin to 0 and explicitly set YAxis width. Prevents the bars from shrinking to 0 width. */}
                                {(selectedChart === "All" || selectedChart === "Most Availed Services") && (
                                    <div className={`chart-card ${selectedChart === "Most Availed Services" ? "full-width" : ""}`}>
                                        <h3 className="chart-title">Most Availed Services</h3>
                                        <ResponsiveContainer width="100%" height={Math.max(300, serviceData.length * 45)}>
                                            <BarChart data={serviceData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0e0b0" />
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" width={isMobile ? 100 : 160} tick={<CustomYAxisTick isMobile={isMobile}/>} axisLine={false} tickLine={false} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201, 168, 76, 0.05)' }} />
                                                <Bar dataKey="count" fill="#c9a84c" radius={[0, 4, 4, 0]} barSize={isMobile ? 16 : 22}>
                                                    <LabelList dataKey="count" position="right" style={{ fill: '#8c7a60', fontSize: '12px', fontWeight: 600 }} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* FIX: Adjusted left margin to 0 and explicitly set YAxis width. */}
                                {(selectedChart === "All" || selectedChart === "Earnings By Service") && (
                                    <div className={`chart-card ${selectedChart === "Earnings By Service" ? "full-width" : ""}`}>
                                        <h3 className="chart-title">Earnings By Service</h3>
                                        <ResponsiveContainer width="100%" height={Math.max(300, earningsData.length * 45)}>
                                            <BarChart data={earningsData} layout="vertical" margin={{ top: 5, right: 50, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0e0b0" />
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" width={isMobile ? 100 : 160} tick={<CustomYAxisTick isMobile={isMobile}/>} axisLine={false} tickLine={false} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201, 168, 76, 0.05)' }} />
                                                <Bar dataKey="earnings" fill="#a07830" radius={[0, 4, 4, 0]} barSize={isMobile ? 16 : 22}>
                                                    <LabelList dataKey="earnings" position="right" formatter={(val) => `₱${val.toLocaleString()}`} style={{ fill: '#8c7a60', fontSize: '11px', fontWeight: 600 }} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {(selectedChart === "All" || selectedChart === "Payment Method") && (
                                    <div className={`chart-card ${selectedChart === "Payment Method" ? "full-width" : ""}`}>
                                        <h3 className="chart-title">Payment Method</h3>
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
                                                        <Cell key={index} fill={getStatusColor(entry.name)} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend iconType="circle" iconSize={12} formatter={(value) => <span style={{ color: '#3a3020', fontWeight: 500, textTransform: 'capitalize' }}>{value}</span>} />
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