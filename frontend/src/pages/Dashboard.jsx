// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaBoxes, FaTags, FaHistory, FaChartPie, FaUser, FaExclamationTriangle, FaUsers } from "react-icons/fa";
// import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
// import "./Dashboard.css";

// function Dashboard() {
//     const navigate = useNavigate();
//     const user = JSON.parse(localStorage.getItem("user"));
//     const [dateTime, setDateTime] = useState(new Date());
//     const [lowStockCount, setLowStockCount] = useState(0);

//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         fetch("https://beautydelounge-backend.onrender.com/api/stocks/low-stock", {
//             headers: { "Authorization": `Bearer ${token}` }
//         })
//             .then(res => res.json())
//             .then(data => setLowStockCount(data.length))
//             .catch(err => console.error(err));
//     }, []);

//     useEffect(() => {
//         const timer = setInterval(() => setDateTime(new Date()), 1000);
//         return () => clearInterval(timer);
//     }, []);

//     const formatDate = (date) => date.toLocaleDateString('en-PH', {
//         weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
//     });

//     const formatTime = (date) => date.toLocaleTimeString('en-PH', {
//         hour: '2-digit', minute: '2-digit', second: '2-digit'
//     });

//     const handleLogout = () => {
//         localStorage.clear();
//         navigate("/");
//     };

//     const allModules = [
//         { title: "Stocks", path: "/dashboard/stocks", icon: <FaBoxes /> },
//         { title: "Service Pricing", path: "/dashboard/service-pricing", icon: <FaTags /> },
//         { title: "Transaction History", path: "/dashboard/transactions", icon: <FaHistory /> },
//         { title: "Analytics", path: "/dashboard/analytics", icon: <FaChartPie />, adminOnly: true },
//         { title: "Manage Users", path: "/dashboard/manage-users", icon: <FaUsers />, adminOnly: true },
//     ];

//     const modules = allModules.filter(module => {
//         if (module.adminOnly) return user?.role === 'admin' || user?.role === 'static-admin';
//         return true;
//     });

//     const handleModuleClick = (path) => {
//         navigate(path);
//     };

//     if (!user) return null;

//    return (
//         <div className="dashboard-container">
//             {/* Sidebar */}
//             <aside className="sidebar">
//                 <h2>BEA-UTY DE LOUNGE</h2>
//                 <nav>
//                     <div className="nav-item" onClick={() => navigate("/dashboard/profile")}>
//                         <FaUser /> <span>Profile</span>
//                     </div>
//                     <div className="nav-item logout" onClick={handleLogout}>
//                         <HiArrowLeftEndOnRectangle /> <span>Logout</span>
//                     </div>
//                 </nav>
//             </aside>

//             {/* Main Layout */}
//             <main className="main-content">
//                 <header className="dashboard-header">
//                     <div className="header-top">
//                         <div>
//                             <h1>Dashboard</h1>
//                             <p>Welcome, <span className="highlight">{user?.firstName || "User"} {user?.lastName || ""}!</span></p>
//                         </div>
//                         <div className="datetime-display">
//                             <div className="datetime-time">{formatTime(dateTime)}</div>
//                             <div className="datetime-date">{formatDate(dateTime)}</div>
//                         </div>
//                     </div>
//                 </header>

//                 {lowStockCount > 0 && (
//                     <div className="alert-banner" onClick={() => navigate("/dashboard/stocks", { state: { filterLowStock: true } })}>
//                         <FaExclamationTriangle className="alert-icon" />
//                         <span>You have <strong>{lowStockCount}</strong> items low on stock!</span>
//                         <button className="view-btn">Check Now</button>
//                     </div>
//                 )}

//                 {/* module Tiles */}
//                 <div className="module-grid">
//                     {modules.map((module, index) => (
//                         <div
//                             key={index}
//                             className="module-card"
//                             onClick={() => handleModuleClick(module.path)}
//                         >
//                             <div className="module-icon">{module.icon}</div>
//                             <h2>{module.title}</h2>
//                             <p>Click to view</p>
//                         </div>
//                     ))}
//                 </div>
//             </main>
//         </div>
//     );
// }

// export default Dashboard;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBoxes, FaTags, FaHistory, FaChartPie, FaUser, FaExclamationTriangle, FaUsers, FaHome } from "react-icons/fa";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import { jwtDecode } from "jwt-decode";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [dateTime, setDateTime] = useState(new Date());
    const [lowStockCount, setLowStockCount] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    let isAdmin = false;
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            isAdmin = decoded.role === 'admin' || decoded.role === 'static-admin';
        }
    } catch (e) {
        console.error("Invalid token");
    }
    // Fetch Low Stock
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("https://beautydelounge-backend.onrender.com/api/stocks/low-stock", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setLowStockCount(data.length))
            .catch(err => console.error(err));
    }, []);

    // Fetch Transactions for Quick Stats & Recent Activity
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("https://beautydelounge-backend.onrender.com/api/transactions", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoadingStats(false);
            })
            .catch(err => {
                console.error("Failed to fetch transactions", err);
                setLoadingStats(false);
            });
    }, []);

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => date.toLocaleDateString('en-PH', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatTime = (date) => date.toLocaleTimeString('en-PH', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    // --- DATA CALCULATIONS ---
    const todayStr = new Date().toISOString().split('T')[0]; // Gets YYYY-MM-DD
    
    const todaysEarnings = transactions
        .filter(t => t.status === 'Paid' && t.date === todayStr)
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalTransactions = transactions.length;

    const serviceCount = transactions.reduce((acc, t) => {
        const serviceList = Array.isArray(t.service) ? t.service : [t.service];
        serviceList.forEach(s => {
            if (s) acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
    }, {});
    
    // Sort to find the most popular
    const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // Get the 5 most recent transactions
    const recentTransactions = transactions.slice(0, 5);


    // --- SIDEBAR NAVIGATION ---
    const allModules = [
        { title: "Stocks", path: "/dashboard/stocks", icon: <FaBoxes /> },
        { title: "Service Pricing", path: "/dashboard/service-pricing", icon: <FaTags /> },
        { title: "Transactions", path: "/dashboard/transactions", icon: <FaHistory /> },
        { title: "Analytics", path: "/dashboard/analytics", icon: <FaChartPie />, adminOnly: true },
        { title: "Manage Users", path: "/dashboard/manage-users", icon: <FaUsers />, adminOnly: true },
    ];

    const modules = allModules.filter(module => {
        if (module.adminOnly) return isAdmin; 
        return true;
    });

    if (!user) return null;

    return (
        <div className="dashboard-container">
            {/* Upgraded Sidebar */}
            <aside className="sidebar">
                <h2>BEA-UTY DE LOUNGE</h2>
                <nav style={{ flex: 1 }}>
                    <div className="nav-item" style={{ background: 'rgba(201, 168, 76, 0.15)', color: '#4a3f2f' }}>
                        <FaHome /> <span>Home</span>
                    </div>
                    {modules.map((module, index) => (
                        <div key={index} className="nav-item" onClick={() => navigate(module.path)}>
                            {module.icon} <span>{module.title}</span>
                        </div>
                    ))}
                </nav>
                
                {/* Pushed to the bottom */}
                <div style={{ borderTop: '1px solid #d9cfc0', paddingTop: '15px', marginTop: 'auto' }}>
                    <div className="nav-item" onClick={() => navigate("/dashboard/profile")}>
                        <FaUser /> <span>Profile</span>
                    </div>
                    <div className="nav-item logout" onClick={handleLogout}>
                        <HiArrowLeftEndOnRectangle /> <span>Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Layout */}
            <main className="main-content">
                <header className="dashboard-header">
                    <div className="header-top">
                        <div>
                            <h1>Dashboard</h1>
                            {/* Added textTransform: 'capitalize' to the span! */}
                            <p>Welcome, <span className="highlight" style={{ textTransform: 'capitalize' }}>{user?.firstName || "User"} {user?.lastName || ""}!</span></p>
                        </div>
                        <div className="datetime-display">
                            <div className="datetime-time">{formatTime(dateTime)}</div>
                            <div className="datetime-date">{formatDate(dateTime)}</div>
                        </div>
                    </div>
                </header>

                {lowStockCount > 0 && (
                    <div className="alert-banner" style={{ background: '#fff0f0', borderColor: '#ffcdd2' }} onClick={() => navigate("/dashboard/stocks", { state: { filterLowStock: true } })}>
                        <FaExclamationTriangle className="alert-icon" />
                        <span style={{ color: '#b71c1c' }}>You have <strong>{lowStockCount}</strong> items low on stock!</span>
                        <button className="view-btn">Check Now</button>
                    </div>
                )}

                {loadingStats ? (
                    <p style={{ color: '#8c7a60', marginTop: '20px' }}>Loading business data...</p>
                ) : (
                    <>
                        {/* Quick Stats Grid */}
                        <div className="analytics-summary" style={{ marginTop: '30px' }}>
                            <div className="summary-card">
                                <p className="summary-label">Today's Earnings</p>
                                <h3 className="summary-value">₱{todaysEarnings.toLocaleString()}</h3>
                            </div>
                            <div className="summary-card">
                                <p className="summary-label">Total Transactions</p>
                                <h3 className="summary-value">{totalTransactions}</h3>
                            </div>
                            <div className="summary-card">
                                <p className="summary-label">Most Popular Service</p>
                                <h3 className="summary-value" style={{ fontSize: '18px' }}>{topService}</h3>
                            </div>
                        </div>

                        {/* Recent Activity Table */}
                        <div style={{ marginTop: '40px' }}>
                            <h3 style={{ color: '#3a3020', marginBottom: '15px', fontSize: '20px', fontWeight: 500 }}>Recent Transactions</h3>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Client</th>
                                            <th>Service</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransactions.length > 0 ? (
                                            recentTransactions.map(t => (
                                                <tr key={t._id}>
                                                    <td style={{ fontWeight: 500 }}>{t.client}</td>
                                                    <td>{Array.isArray(t.service) ? t.service.join(", ") : t.service}</td>
                                                    <td style={{ color: '#c9a84c', fontWeight: 600 }}>₱{Number(t.amount).toLocaleString()}</td>
                                                    <td>{t.date}</td>
                                                    <td>
                                                        <span className={`status-badge ${t.status.toLowerCase()}`}>
                                                            {t.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="no-results">No recent transactions.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default Dashboard;