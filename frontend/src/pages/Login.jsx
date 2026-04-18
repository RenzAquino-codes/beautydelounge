import React, { useState } from 'react';
import "./Login.css";
import { useNavigate } from 'react-router-dom';
import logo1 from '../assets/images/logo.jpg'
import loungeBg from '../assets/images/lounge.png';
import logo2 from '../assets/images/Groom1.png';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [loginSuccess, setLoginSuccess] = useState(false);

    // Forgot
    const [forgotStep, setForgotStep] = useState(0); // 0=login, 1=email, 2=code+newpass
    const [resetEmail, setResetEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("https://beautydelounge-backend.onrender.com/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resetEmail })
            });
            const data = await res.json();
            if (res.ok) {
                setForgotStep(2);
            } else {
                showToast(data.error, "error");
            }
        } catch {
            showToast("Server error.", "error");
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword)
            return showToast("Passwords do not match.", "error");
        if (newPassword.length < 8)
            return showToast("Password must be at least 8 characters.", "error");
        setLoading(true);
        try {
            const res = await fetch("https://beautydelounge-backend.onrender.com/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: resetEmail, 
                    code: resetCode, newPassword 
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Password reset! Please sign in.", "success");
                setTimeout(() => {
                    setForgotStep(0);
                    setResetEmail('');
                    setResetCode('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                }, 2000);
            } else {
                showToast(data.error, "error");
            }
        } catch {
            showToast("Server error.", "error");
        }
        setLoading(false);
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("https://beautydelounge-backend.onrender.com/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                setEmail('');
                setPassword('');
                setLoginSuccess(true); 

                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            } else {
                showToast(data.error, "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Server Error", "error");
        }
        setLoading(false);
    };

    if (loginSuccess) {
        return (
            <div className="login-success-screen">
                <div className="success-content">
                    <div className="success-logo">
                        <img src={logo1} alt="Beauty De Lounge" />
                    </div>
                    <div className="success-spinner"></div>
                    <h2>Welcome to Bea-uty De Lounge!</h2>
                    <p>Taking you to your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-split-container">
            <div className="login-left">
                <img src={logo2} alt="Beauty De Lounge" className="hero-logo" />
            </div>

            <div className="login-right" style={{ backgroundImage: `url(${loungeBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="form-container">

                    {/* Normal Login */}
                    {forgotStep === 0 && (
                        <>
                            <h2>Sign In Po</h2>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" required />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
                                </div>
                                <button type="submit" disabled={loading}>
                                    {loading ? "Signing in..." : "Sign In →"}
                                </button>
                            </form>
                            {/* <p className="register-link">
                                New here? <Link to="/register">Create an account</Link>
                            </p> */}

                            {/* Forgot password link */}
                            <p className="register-link" style={{ marginTop: '8px' }}>
                                <button
                                    onClick={() => setForgotStep(1)}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#4a3f2f', 
                                        cursor: 'pointer', 
                                        fontSize: '14px', 
                                        padding: 0, 
                                        width: 'auto', 
                                        textDecoration: 'underline' 
                                    }}
                                >
                                    Forgot your password?
                                </button>
                            </p>
                        </>
                    )}

                    {/* STEP 1 — Enter Email */}
                    {forgotStep === 1 && (
                        <>
                            <h2>Reset Your Password</h2>
                            <p className="subtitle">Enter your email and we'll send you a reset code.</p>
                            <form onSubmit={handleForgotPassword}>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={e => setResetEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={loading}>
                                    {loading ? "Sending..." : "Send Reset Code →"}
                                </button>
                            </form>
                            <p className="register-link" style={{ marginTop: '16px' }}>
                                <button
                                    onClick={() => setForgotStep(0)}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#4a3f2f', 
                                        cursor: 'pointer', 
                                        fontSize: '14px', 
                                        padding: 0, 
                                        width: 'auto', 
                                        textDecoration: 'underline' 
                                    }}
                                >
                                    ← Back to Sign in
                                </button>
                            </p>
                        </>
                    )}

                    {/* Enter Code + New Password */}
                    {forgotStep === 2 && (
                        <>
                            <h2>Enter Reset Code</h2>
                            <p className="subtitle">We sent a code to <strong>{resetEmail}</strong></p>
                            <form onSubmit={handleResetPassword}>
                                <div className="form-group">
                                    <label>Verification Code</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={resetCode}
                                        onChange={e => setResetCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmNewPassword}
                                        onChange={e => setConfirmNewPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={loading}>
                                    {loading ? "Resetting..." : "Reset Password →"}
                                </button>
                            </form>
                            <p className="register-link" style={{ marginTop: '16px' }}>
                                <button
                                    onClick={() => setForgotStep(1)}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#4a3f2f', 
                                        cursor: 'pointer', 
                                        fontSize: '14px', 
                                        padding: 0, 
                                        width: 'auto', 
                                        textDecoration: 'underline' 
                                    }}
                                >
                                    ← Wrong email?
                                </button>
                            </p>
                        </>
                    )}

                </div>
            </div>

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

export default Login;