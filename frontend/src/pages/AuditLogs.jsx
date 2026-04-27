import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";

function AuditLogs() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("https://beautydelounge-backend.onrender.com/api/audit-logs", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setLogs(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-PH', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
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
                    <h1>System Audit Logs</h1>
                    <p>Track all critical actions performed by staff and admins.</p>
                </header>

                <div style={{ marginTop: '20px' }}>
                    {loading ? (
                        <p style={{ color: '#8c7a60' }}>Loading security logs...</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length > 0 ? (
                                        logs.map(log => (
                                            <tr key={log._id}>
                                                <td style={{ fontSize: '13px', color: '#6b5c45' }}>{formatDateTime(log.timestamp)}</td>
                                                <td style={{ fontWeight: 500, textTransform: 'capitalize' }}>{log.userName}</td>
                                                <td>
                                                    <span className={`status-badge ${log.role === 'admin' || log.role === 'static-admin' ? 'paid' : 'pending'}`} style={{ fontSize: '11px' }}>
                                                        {log.role}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600, color: '#3a3020' }}>{log.action}</td>
                                                <td style={{ color: '#8c7a60', fontSize: '13px' }}>{log.details || '—'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="no-results">No audit logs found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AuditLogs;