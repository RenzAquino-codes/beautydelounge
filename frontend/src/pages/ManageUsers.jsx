import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import { FaCheckCircle as FaCheck, FaTimesCircle as FaTimes } from "react-icons/fa";

function ManageUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [pendingEmail, setPendingEmail] = useState('');
    const [code, setCode] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [form, setForm] = useState({
        firstName: '', middleName: '', lastName: '',
        email: '', password: '', role: 'staff'
    });
    const [errors, setErrors] = useState({});

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
    };

    const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name);

    const passwordRules = [
        { label: "Minimum 8 characters", test: (p) => p.length >= 8 },
        { label: "At least 1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
        { label: "At least 1 number", test: (p) => /[0-9]/.test(p) },
        { label: "At least 1 special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    ];
    const isPasswordValid = () => passwordRules.every(rule => rule.test(form.password));

    // Fetch all users
    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("https://beautydelounge-backend.onrender.com/api/users", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!isValidName(form.firstName)) newErrors.firstName = "Letters only.";
        if (form.middleName && !isValidName(form.middleName)) newErrors.middleName = "Letters only.";
        if (!isValidName(form.lastName)) newErrors.lastName = "Letters only.";
        if (!isPasswordValid()) newErrors.password = "Password does not meet requirements.";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://beautydelounge-backend.onrender.com/api/admin/create-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                setPendingEmail(form.email);
                setStep(2);
                showToast("Verification code sent!", "success");
            } else {
                showToast(data.error);
            }
        } catch (err) {
            showToast("Server error.");
        }
        setLoading(false);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://beautydelounge-backend.onrender.com/api/verify-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ email: pendingEmail, code })
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Account created successfully!", "success");
                setShowForm(false);
                setStep(1);
                setCode('');
                setForm({ firstName: '', middleName: '', lastName: '', email: '', password: '', role: 'staff' });
                // Refresh users list
                const token2 = localStorage.getItem("token");
                fetch("https://beautydelounge-backend.onrender.com/api/users", {
                    headers: { "Authorization": `Bearer ${token2}` }
                }).then(r => r.json()).then(d => setUsers(d));
            } else {
                showToast(data.error);
            }
        } catch (err) {
            showToast("Server error.");
        }
        setLoading(false);
    };

    const handleDelete = (id) => setConfirmDelete(id);

    const confirmDeleteAction = async () => {
        try {
            const token = localStorage.getItem("token");
            await fetch(`https://beautydelounge-backend.onrender.com/api/users/${confirmDelete}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setUsers(users.filter(u => u._id !== confirmDelete));
            setConfirmDelete(null);
            showToast("User deleted.", "success");
        } catch (err) {
            showToast("Failed to delete user.");
        }
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
                    <h1>Manage Users</h1>
                    <p>Create and manage staff accounts</p>
                </header>

                <button className="add-btn" onClick={() => { setShowForm(true); setStep(1); }}>
                    <FaPlus /> Create Account
                </button>

                {/* Create Account Modal */}
                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            {step === 1 ? (
                                <>
                                    <h3>Create Account</h3>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    placeholder="First Name"
                                                    value={form.firstName}
                                                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                                                    style={{ borderColor: errors.firstName ? '#e74c3c' : '' }}
                                                    required
                                                />
                                                {errors.firstName && <span style={{ fontSize: '11px', color: '#e74c3c' }}>{errors.firstName}</span>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    placeholder="Middle Name"
                                                    value={form.middleName}
                                                    onChange={e => setForm({ ...form, middleName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <input
                                            placeholder="Last Name"
                                            value={form.lastName}
                                            onChange={e => setForm({ ...form, lastName: e.target.value })}
                                            style={{ borderColor: errors.lastName ? '#e74c3c' : '' }}
                                            required
                                        />
                                        {errors.lastName && <span style={{ fontSize: '11px', color: '#e74c3c' }}>{errors.lastName}</span>}
                                        <input
                                            placeholder="Email"
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            required
                                        />
                                        <input
                                            placeholder="Password"
                                            type="password"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            style={{ borderColor: errors.password ? '#e74c3c' : '' }}
                                            required
                                        />
                                        {/* Password rules */}
                                        {form.password && (
                                            <ul className="password-rules">
                                                {passwordRules.map((rule, i) => (
                                                    <li key={i} className={rule.test(form.password) ? 'rule-pass' : 'rule-fail'}>
                                                        {rule.test(form.password)
                                                            ? <FaCheckCircle style={{ marginRight: '6px' }} />
                                                            : <FaTimesCircle style={{ marginRight: '6px' }} />
                                                        }
                                                        {rule.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {/* Role selector */}
                                        <select
                                            value={form.role}
                                            onChange={e => setForm({ ...form, role: e.target.value })}
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>

                                        <div className="modal-actions">
                                            <button type="submit" disabled={loading}>
                                                {loading ? "Sending code..." : "Send Verification →"}
                                            </button>
                                            <button type="button" className="cancel-btn" onClick={() => {
                                                setShowForm(false);
                                                setForm({ firstName: '', middleName: '', lastName: '', email: '', password: '', role: 'staff' });
                                                setErrors({});
                                            }}>Cancel</button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <h3>Verify Email</h3>
                                    <p style={{ fontSize: '13px', color: '#8c7a60' }}>
                                        We sent a 6-digit code to <strong>{pendingEmail}</strong>
                                    </p>
                                    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <input
                                            placeholder="Enter 6-digit code"
                                            maxLength={6}
                                            value={code}
                                            onChange={e => setCode(e.target.value)}
                                            required
                                        />
                                        <div className="modal-actions">
                                            <button type="submit" disabled={loading}>
                                                {loading ? "Verifying..." : "Verify & Create →"}
                                            </button>
                                            <button type="button" className="cancel-btn" onClick={() => setStep(1)}>
                                                Back
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`status-badge ${user.role === 'admin' ? 'paid' : 'pending'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <button className="icon-btn delete" onClick={() => handleDelete(user._id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>

            {/* Confirm Delete */}
            {confirmDelete && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '360px', textAlign: 'center' }}>
                        <FaTimesCircle style={{ fontSize: '40px', color: '#e74c3c', marginBottom: '12px' }} />
                        <h3>Delete User?</h3>
                        <p style={{ color: '#8c7a60', fontSize: '14px', marginBottom: '20px' }}>This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button onClick={confirmDeleteAction} style={{ background: '#e74c3c' }}>Yes, Delete</button>
                            <button className="cancel-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

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

export default ManageUsers;