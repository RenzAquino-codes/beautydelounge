import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBook } from "react-icons/fa";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    
    // We only need the user object for displaying their name/role
    const user = JSON.parse(localStorage.getItem("user"));
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !user) {
            navigate("/");
        }
    }, [navigate, user]); 

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
  
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const allModules = [
        { title: "Stocks", path: "/dashboard/stocks" },
        { title: "Service Pricing", path: "/dashboard/service-pricing" },
        { title: "Transaction History", path: "/dashboard/transactions" },
        { title: "Analytics", path: "/dashboard/analytics", adminOnly: true }, 
    ];


    const modules = allModules.filter(module => {
        if (module.adminOnly) {
            return user?.role === 'admin' || user?.role === 'static-admin';
        }
        return true;
    });

    const handleModuleClick = (path) => {
        navigate(path);
    };

    if (!user) return null;

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <h2>BEA-UTY DE LOUNGE</h2>
                <nav>
                    <div className="nav-item" onClick={() => navigate("/dashboard/profile")}>
                        <FaUser /> <span>Profile</span>
                    </div>
                    <div className="nav-item logout" onClick={handleLogout}>
                        <HiArrowLeftEndOnRectangle /> <span>Logout</span>
                    </div>
                </nav>
            </aside>

            {/* Main Layout */}
            <main className="main-content">
                <header className="dashboard-header">
                    <div className="header-top">
                        <div>
                            <h1>Dashboard</h1>
                            <p>Welcome, <span className="highlight">{user?.firstName || "User"} {user?.lastName || ""}!</span></p>
                        </div>
                        <div className="datetime-display">
                            <div className="datetime-time">{formatTime(dateTime)}</div>
                            <div className="datetime-date">{formatDate(dateTime)}</div>
                        </div>
                    </div>
                </header>

                {/* module Tiles */}
                <div className="module-grid">
                    {modules.map((module, index) => (
                        <div
                            key={index}
                            className="module-card"
                            onClick={() => handleModuleClick(module.path)}
                        >
                            <FaBook className="module-icon" />
                            <h2>{module.title}</h2>
                            <p>Click to view</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;