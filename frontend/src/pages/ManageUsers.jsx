import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaTrash, FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";

function ManageUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [pendingEmail, setPendingEmail] = useState('');
    const [code, setCode] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [showPassword, setShowPassword] = useState(false);

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
        localStorage.clear();
        navigate("/");
    };

    const isValidName = (name) => name === "" || /^[a-zA-Z\s]+$/.test(name);

    const passwordRules = [
        { label: "Minimum 8 characters", test: (p) => p.length >= 8 },
        { label: "At least 1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
        { label: "At least 1 number", test: (p) => /[0-9]/.test(p) },
        { label: "At least 1 special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    ];
    const isPasswordValid = () => passwordRules.every(rule => rule.test(form.password));

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

                fetch("https://beautydelounge-backend.onrender.com/api/users", {
                    headers: { "Authorization": `Bearer ${token}` }
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

                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            {step === 1 ? (
                                <>
                                    <h3>Create Account</h3>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    type="text"
                                                    value={form.firstName}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setForm({ ...form, firstName: val });
                                                        if (!isValidName(val)) setErrors(prev => ({ ...prev, firstName: 'Letters only allowed.' }));
                                                        else setErrors(prev => ({ ...prev, firstName: '' }));
                                                    }}
                                                    placeholder="First Name"
                                                    style={{ borderColor: errors.firstName ? '#e74c3c' : '', width: '100%', marginBottom: '4px' }}
                                                    required
                                                />
                                                {errors.firstName && <span style={{ color: '#e74c3c', fontSize: '12px', display: 'block' }}>{errors.firstName}</span>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    type="text"
                                                    value={form.middleName}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setForm({ ...form, middleName: val });
                                                        if (!isValidName(val)) setErrors(prev => ({ ...prev, middleName: 'Letters only allowed.' }));
                                                        else setErrors(prev => ({ ...prev, middleName: '' }));
                                                    }}
                                                    placeholder="Middle Name"
                                                    style={{ borderColor: errors.middleName ? '#e74c3c' : '', width: '100%', marginBottom: '4px' }}
                                                />
                                                {errors.middleName && <span style={{ color: '#e74c3c', fontSize: '12px', display: 'block' }}>{errors.middleName}</span>}
                                            </div>
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="text"
                                                value={form.lastName}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setForm({ ...form, lastName: val });
                                                    if (!isValidName(val)) setErrors(prev => ({ ...prev, lastName: 'Letters only allowed.' }));
                                                    else setErrors(prev => ({ ...prev, lastName: '' }));
                                                }}
                                                placeholder="Last Name"
                                                style={{ borderColor: errors.lastName ? '#e74c3c' : '', width: '100%', marginBottom: '4px' }}
                                                required
                                            />
                                            {errors.lastName && <span style={{ color: '#e74c3c', fontSize: '12px', display: 'block' }}>{errors.lastName}</span>}
                                        </div>

                                        <input
                                            placeholder="Email"
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            required
                                        />

                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })}
                                                placeholder="Password"
                                                style={{
                                                    borderColor: errors.password ? '#e74c3c' : '',
                                                    paddingRight: '45px',
                                                    width: '100%',
                                                    margin: 0
                                                }}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    height: '100%',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#8c7a60',
                                                    cursor: 'pointer',
                                                    padding: '0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    outline: 'none'
                                                }}
                                            >
                                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                            </button>
                                        </div>

                                        {form.password && (
                                            <ul className="password-rules" style={{ margin: '-5px 0 0 0', paddingLeft: 0, listStyle: 'none', fontSize: '12px', textAlign: 'left' }}>
                                                {passwordRules.map((rule, i) => (
                                                    <li key={i} style={{ color: rule.test(form.password) ? '#2ecc71' : '#8c7a60', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                                                        {rule.test(form.password) ? <FaCheckCircle style={{ marginRight: '6px' }} /> : <FaTimesCircle style={{ marginRight: '6px' }} />}
                                                        {rule.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <select
                                            value={form.role}
                                            onChange={e => setForm({ ...form, role: e.target.value })}
                                            style={{ marginTop: '5px' }}
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>

                                        <div className="modal-actions" style={{ marginTop: '5px' }}>
                                            <button type="submit" disabled={loading}>
                                                {loading ? "Sending code..." : "Send Verification →"}
                                            </button>
                                            <button type="button" className="cancel-btn" onClick={() => {
                                                setShowForm(false);
                                                setShowPassword(false);
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

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '360px', textAlign: 'center' }}>
                        <FaTimesCircle style={{ fontSize: '40px', color: '#e74c3c', margin: '0 auto 12px' }} />
                        <h3 style={{ marginBottom: '8px' }}>Delete User?</h3>
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