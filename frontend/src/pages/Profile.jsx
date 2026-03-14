import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";

function Profile() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        middleName: user?.middleName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [loading, setLoading] = useState(false);

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        navigate("/");
    };

    const handleSave = async () => {
        if (form.password && form.password !== form.confirmPassword)
            return showToast("Passwords do not match.");
        if (form.password && form.password.length < 8)
            return showToast("Password must be at least 8 characters.");

        setLoading(true);
        try {
            const body = {
                firstName: form.firstName,
                middleName: form.middleName,
                lastName: form.lastName,
            };
            if (form.password) body.password = form.password;

            const res = await fetch(`http://127.0.0.1:5000/api/users/${user._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("user", JSON.stringify({ ...user, ...body }));
                showToast("Profile updated successfully!", "success");
            } else {
                showToast(data.error);
            }
        } catch (err) {
            showToast("Server error.");
        }
        setLoading(false);
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
                    <h1>My Profile</h1>
                    <p>View and update your account information</p>
                </header>

                <div className="profile-card">
                    {/* Avatar */}
                    <div className="profile-avatar">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <div className="profile-role">{user?.role === 'admin' || user?.role === 'static-admin' ? '👑 Admin' : '💼 Staff'}</div>

                    <div className="profile-form">
                        <div className="form-row">
                            <div className="profile-field">
                                <label>First Name</label>
                                <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                            <div className="profile-field">
                                <label>Middle Name</label>
                                <input value={form.middleName} onChange={e => setForm({ ...form, middleName: e.target.value })} />
                            </div>
                        </div>
                        <div className="profile-field">
                            <label>Last Name</label>
                            <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                        </div>
                        <div className="profile-field">
                            <label>Email</label>
                            <input value={form.email} disabled style={{ background: '#f0ebe1', cursor: 'not-allowed' }} />
                        </div>
                        <div className="profile-field">
                            <label>New Password <span style={{ color: '#b5a898', fontWeight: 400 }}>(leave blank to keep current)</span></label>
                            <input type="password" placeholder="Enter new password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                        <div className="profile-field">
                            <label>Confirm New Password</label>
                            <input type="password" placeholder="Confirm new password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                        </div>

                        <button className="add-btn" onClick={handleSave} disabled={loading} style={{ marginTop: '8px' }}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </main>

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

export default Profile;