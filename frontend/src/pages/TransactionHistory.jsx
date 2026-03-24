
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaCheckSquare, FaSquare, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function TransactionHistory() {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ client: "", service: [], amount: "", date: "", time: "", status: "Paid" });
    const [transactions, setTransactions] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [services, setServices] = useState([]);
    const [clientError, setClientError] = useState('');
    const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
    };

    // Fetch transactions
    // Fetch transactions
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("https://beautydelounge-backend.onrender.com/api/transactions", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setTransactions(data))
            .catch(err => console.error(err));
    }, []);

    // Fetch services from Service Pricing
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("https://beautydelounge-backend.onrender.com/api/services", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error(err));
    }, []);

    // Handle service checkbox — only one can be selected at a time
    const handleServiceSelect = (serviceName, servicePrice) => {
        const alreadySelected = form.service.includes(serviceName);

        let updatedServices;
        if (alreadySelected) {
            // Uncheck — remove from array
            updatedServices = form.service.filter(s => s !== serviceName);
        } else {
            // Check — add to array
            updatedServices = [...form.service, serviceName];
        }

        // Recalculate total from selected services
        const newTotal = updatedServices.reduce((sum, name) => {
            const found = services.find(s => s.name === name);
            return sum + (found ? Number(found.price) : 0);
        }, 0);

        setForm({ ...form, service: updatedServices, amount: newTotal });
    };

    const handleSave = async () => {
        if (!form.client || form.service.length === 0 || !form.amount)
            return showToast("Please fill in all fields.");
        if (!isValidName(form.client))
            return showToast("Client name must contain letters only.");
        setIsSaving(true);
        try {
            const token = localStorage.getItem("token");

            if (editingItem) {
                const res = await fetch(`https://beautydelounge-backend.onrender.com/api/transactions/${editingItem}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(form)
                });
                const updated = await res.json();
                setTransactions(transactions.map(t => t._id === editingItem ? updated : t));
                showToast("Transaction updated.", "success");
            } else {
                const res = await fetch("https://beautydelounge-backend.onrender.com/api/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(form)
                });
                const created = await res.json();
                setTransactions([created, ...transactions]);
                showToast("Transaction saved.", "success");
            }

            setShowForm(false);
            setForm({ client: "", service: [], amount: "", date: "", time: "", status: "Paid" });
            setEditingItem(null);
        } catch (err) {
            showToast("Failed to save transaction.");
        } finally {
            setIsSaving(false);
        }
    };
    const openEdit = (transaction) => {
        setForm({
            client: transaction.client,
            service: Array.isArray(transaction.service) ? transaction.service : [transaction.service],
            amount: transaction.amount,
            date: transaction.date,
            time: transaction.time || '',
            status: transaction.status
        });
        setEditingItem(transaction._id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        setConfirmDelete(id);
    };

    const confirmDeleteAction = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://beautydelounge-backend.onrender.com/api/transactions/${confirmDelete}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                // Only remove from UI if the database actually deleted it!
                setTransactions(transactions.filter(t => t._id !== confirmDelete));
                showToast("Transaction deleted.", "success");
            } else {
                showToast("Failed to delete from server.");
            }
        } catch (err) {
            showToast("Network error.");
        } finally {
            setConfirmDelete(null);
        }
    };

    const formatTime = (time) => {
        if (!time) return '—';
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const filteredTransactions = transactions.filter(t =>
        t.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(t.service) ? t.service.join(" ") : t.service).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            {isSaving && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p className="loading-text">RECORDING TRANSACTION...</p>
                </div>
            )}
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
                    <h1>Transaction History</h1>
                    <p>Total collected: <strong>₱{total.toLocaleString()}</strong></p>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by client or service..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                </header>

                <button className="add-btn" onClick={() => {
                    const now = new Date();
                    const today = now.toISOString().split('T')[0];
                    const currentTime = now.toTimeString().slice(0, 5);
                    setForm({ client: "", service: [], amount: "", date: today, time: currentTime, status: "Paid" });
                    setEditingItem(null);
                    setShowForm(true);
                }}>
                    <FaPlus /> Add Transaction
                </button>

                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>{editingItem ? "Edit Transaction" : "Add Transaction"}</h3>

                            <input
                                placeholder="Client Name"
                                value={form.client}
                                onChange={e => {
                                    const val = e.target.value;
                                    setForm({ ...form, client: val });
                                    if (val && !isValidName(val)) {
                                        setClientError("Letters only, no numbers or special characters.");
                                    } else {
                                        setClientError('');
                                    }
                                }}
                                style={{ borderColor: clientError ? '#e74c3c' : '' }}
                            />
                            {clientError && <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '-8px' }}>{clientError}</span>}

                            {/* Service Checklist */}
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b5c45', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Select Service
                            </label>
                            <div className="service-checklist">
                                {services.length === 0 ? (
                                    <p style={{ fontSize: '13px', color: '#8c7a60' }}>No services available.</p>
                                ) : (
                                    services.map(service => (
                                        <div
                                            key={service._id}
                                            className={`service-check-item ${form.service.includes(service.name) ? 'selected' : ''}`}
                                            onClick={() => handleServiceSelect(service.name, service.price)}
                                        >
                                            <div className="service-check-box">
                                                {form.service.includes(service.name)
                                                    ? <FaCheckSquare style={{ color: '#c9a84c', fontSize: '18px' }} />
                                                    : <FaSquare style={{ color: '#dcd5c9', fontSize: '18px' }} />
                                                }
                                            </div>
                                            <div className="service-check-info">
                                                <span className="service-check-name">{service.name}</span>
                                                <span className="service-check-price">₱{service.price}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Amount auto-filled but editable */}
                            <input
                                placeholder="Amount (₱)"
                                type="number"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                            />

                            <input
                                placeholder="Date"
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />

                            <input
                                placeholder="Time"
                                type="time"
                                value={form.time}
                                onChange={e => setForm({ ...form, time: e.target.value })}
                            />

                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                            >
                                <option>Paid</option>
                                <option>Pending</option>
                            </select>

                            <div className="modal-actions">
                                <button onClick={handleSave}>Save</button>
                                <button className="cancel-btn" onClick={() => {
                                    setShowForm(false);
                                    setForm({ client: "", service: [], amount: "", date: "", time: "", status: "Paid" });
                                    setClientError('');
                                }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Service</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map(t => (
                                <tr key={t._id}>
                                    <td>{t.client}</td>
                                    {/* join(",") turns the array of services into a nice readable list */}
                                    <td>{Array.isArray(t.service) ? t.service.join(", ") : t.service}</td>
                                    <td>₱{Number(t.amount).toLocaleString()}</td>
                                    <td>{t.date}</td>
                                    <td>{formatTime(t.time)}</td>
                                    <td>
                                        <span className={`status-badge ${t.status.toLowerCase()}`}>
                                            {t.status}
                                        </span>
                                    </td>

                                    <td>
                                        <button className="icon-btn edit" onClick={() => openEdit(t)}>
                                            <FaEdit />
                                        </button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(t._id)}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-results">
                                    No transactions found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </main>
            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '360px', textAlign: 'center' }}>
                        <FaTimesCircle style={{ fontSize: '40px', color: '#e74c3c', marginBottom: '12px' }} />
                        <h3 style={{ marginBottom: '8px' }}>Delete Transaction?</h3>
                        <p style={{ color: '#8c7a60', fontSize: '14px', marginBottom: '20px' }}>
                            This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button onClick={confirmDeleteAction} style={{ background: '#e74c3c' }}>
                                Yes, Delete
                            </button>
                            <button className="cancel-btn" onClick={() => setConfirmDelete(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast.show && (
                <div className={`toast toast-${toast.type}`}>
                    <span className="toast-icon">
                        {toast.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
                    </span>
                    <span className="toast-message">{toast.message}</span>
                </div>
            )}

        </div>
    );
}

export default TransactionHistory;