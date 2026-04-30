import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";

function AuditLogs() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState("");
    
    // NEW: Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 15;

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

    // Filter logic
    const filteredLogs = logs.filter(log => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (log.action && log.action.toLowerCase().includes(searchLower)) ||
            (log.userName && log.userName.toLowerCase().includes(searchLower)) ||
            (log.role && log.role.toLowerCase().includes(searchLower)) ||
            (log.details && log.details.toLowerCase().includes(searchLower))
        );
    });

    // Reset to page 1 whenever they type in the search bar
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // NEW: Pagination Math
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

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
                
                {/* UPGRADED: Header Layout exactly matches Stocks */}
                <header className="dashboard-header">
                    <h1>System Audit Logs</h1>
                    <p>Track all critical actions performed by staff and admins.</p>
                    <div className="filter-controls">
                        <div className="search-container" style={{ minWidth: '280px' }}>
                            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c9a84c' }}/>
                            <input 
                                type="text" 
                                placeholder="Search user, action, or details..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="search-input"
                                style={{ paddingLeft: '35px', width: '100%' }}
                            />
                        </div>
                    </div>
                </header>

                <div style={{ marginTop: '20px' }}>
                    {loading ? (
                        <p style={{ color: '#8c7a60' }}>Loading security logs...</p>
                    ) : (
                        <div className="table-responsive" style={{ background: '#fff', borderRadius: '12px', padding: '15px', border: '1px solid #e8e0d4' }}>
                            <table className="data-table" style={{ border: 'none', background: 'transparent' }}>
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
                                    {currentLogs.length > 0 ? (
                                        currentLogs.map(log => (
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
                                            <td colSpan="5" className="no-results">
                                                {searchTerm ? `No logs found for "${searchTerm}"` : "No audit logs found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            
                            {/* NEW: Pagination Controls */}
                            {filteredLogs.length > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f0e0b0' }}>
                                    <span style={{ fontSize: '13px', color: '#8c7a60' }}>
                                        Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} entries
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                            disabled={currentPage === 1}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', border: '1px solid #dcd5c9', background: currentPage === 1 ? '#faf8f5' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#a89f91' : '#4a3f2f', fontWeight: 600, fontSize: '13px' }}
                                        >
                                            <FaChevronLeft style={{ fontSize: '10px' }}/> Prev
                                        </button>
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', border: '1px solid #dcd5c9', background: currentPage === totalPages || totalPages === 0 ? '#faf8f5' : 'white', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', color: currentPage === totalPages || totalPages === 0 ? '#a89f91' : '#4a3f2f', fontWeight: 600, fontSize: '13px' }}
                                        >
                                            Next <FaChevronRight style={{ fontSize: '10px' }}/>
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AuditLogs;