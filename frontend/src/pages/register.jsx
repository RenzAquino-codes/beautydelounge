import React, { useState } from 'react';
import "./Register.css";
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from "react-icons/fa"; // Imported Eye icons
import logo1 from '../assets/images/logo.jpg'
import loungeBg from '../assets/images/lounge.png';
import logo2 from '../assets/images/Groom1.png';

function Register() {
    const [firstname, setFirstname] = useState('');
    const [middlename, setMiddlename] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminCode, setAdminCode] = useState('');
    
    // NEW: Visibility toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showAdminCode, setShowAdminCode] = useState(false);

    const [loading, setLoading] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');
    const [pendingEmail, setPendingEmail] = useState('');
    
    const [errors, setErrors] = useState({});
    // Allow empty string to pass validation during typing, but enforce letters when characters exist
    const isValidName = (name) => name === "" || /^[a-zA-Z\s]+$/.test(name);
    
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!firstname.trim()) newErrors.firstname = "First name is required.";
        if (!lastname.trim()) newErrors.lastname = "Last name is required.";
        if (!isPasswordValid()) newErrors.password = "Password does not meet all requirements.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const passwordRules = [
        { label: "Minimum 8 characters", test: (p) => p.length >= 8 },
        { label: "At least 1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
        { label: "At least 1 number", test: (p) => /[0-9]/.test(p) },
        { label: "At least 1 special character (!@#$...)", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    ];

    const isPasswordValid = () => passwordRules.every(rule => rule.test(password));

    const handlesubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return; 
        if (!adminCode) {
            return showToast("Authorization code is required.", "error");
        }
        setLoading(true);
        try {
            const response = await fetch("https://beautydelounge-backend.onrender.com/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: firstname,
                    middleName: middlename,
                    lastName: lastname,
                    email,
                    password,
                    adminCode
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setPendingEmail(email);
                setStep(2);
                showToast("Verification code sent to your email!", "success");
            } else {
                showToast(data.error, "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Server Error", "error");
        }
        setLoading(false);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("https://beautydelounge-backend.onrender.com/api/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: pendingEmail, code }),
            });
            const data = await response.json();
            if (response.ok) {
                setRegisterSuccess(true);
                setTimeout(() => {
                    navigate("/");
                }, 2500);
            } else {
                showToast(data.error, "error");
            }
        } catch (error) {
            showToast("Server Error", "error");
        }
        setLoading(false);
    };

    if (registerSuccess) {
        return (
            <div className="login-success-screen">
                <div className="success-content">
                    <div className="success-logo">
                        <img src={logo2} alt="Beauty De Lounge" />
                    </div>
                    <div className="success-spinner"></div>
                    <h2>Account Created!</h2>
                    <p>Redirecting you to sign in...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="register-split-container">
            <div className="register-left">
                <img src={logo1} alt="Beauty De Lounge" className="hero-logo" />
            </div>

            <div className="register-right" style={{ backgroundImage: `url(${loungeBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="form-container">

                    {step === 1 && (
                        <>
                            <h2>Create Account</h2>
                            <p className="subtitle">Fill in your details to get started.</p>

                            <form onSubmit={handlesubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            value={firstname}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (isValidName(val)) {
                                                    setFirstname(val);
                                                    setErrors(prev => ({ ...prev, firstname: '' }));
                                                } else {
                                                    // NEW: Visual feedback in placeholder
                                                    setFirstname('');
                                                    setErrors(prev => ({ ...prev, firstname: 'Letters only allowed!' }));
                                                }
                                            }}
                                            placeholder={errors.firstname || "First name"}
                                            className={errors.firstname ? 'input-error-placeholder' : ''}
                                            style={{ borderColor: errors.firstname ? '#e74c3c' : '' }}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Middle Name</label>
                                        <input
                                            type="text"
                                            value={middlename}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (isValidName(val)) {
                                                    setMiddlename(val);
                                                    setErrors(prev => ({ ...prev, middlename: '' }));
                                                } else {
                                                    setMiddlename('');
                                                    setErrors(prev => ({ ...prev, middlename: 'Letters only allowed!' }));
                                                }
                                            }}
                                            placeholder={errors.middlename || "Middle name"}
                                            className={errors.middlename ? 'input-error-placeholder' : ''}
                                            style={{ borderColor: errors.middlename ? '#e74c3c' : '' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={lastname}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (isValidName(val)) {
                                                setLastname(val);
                                                setErrors(prev => ({ ...prev, lastname: '' }));
                                            } else {
                                                setLastname('');
                                                setErrors(prev => ({ ...prev, lastname: 'Letters only allowed!' }));
                                            }
                                        }}
                                        placeholder={errors.lastname || "Last name"}
                                        className={errors.lastname ? 'input-error-placeholder' : ''}
                                        style={{ borderColor: errors.lastname ? '#e74c3c' : '' }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" required />
                                </div>

                                <div className="form-group" style={{ position: 'relative' }}>
                                    <label>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setPasswordFocused(true)}
                                            placeholder="Enter password"
                                            style={{ 
                                                borderColor: errors.password ? '#e74c3c' : passwordFocused && isPasswordValid() ? '#c9a84c' : '',
                                                paddingRight: '40px' // Make room for the eye icon
                                            }}
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', color: '#8c7a60', cursor: 'pointer',
                                                padding: '0', display: 'flex', alignItems: 'center'
                                            }}
                                        >
                                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                        </button>
                                    </div>
                                    
                                    {/* RESTORED: Password Rules */}
                                    {(passwordFocused || password) && (
                                        <ul className="password-rules" style={{ marginTop: '8px', paddingLeft: 0, listStyle: 'none', fontSize: '12px' }}>
                                            {passwordRules.map((rule, i) => (
                                                <li key={i} style={{ color: rule.test(password) ? '#2ecc71' : '#8c7a60', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                                                    {rule.test(password) ? <FaCheckCircle style={{ marginRight: '6px' }} /> : <FaTimesCircle style={{ marginRight: '6px' }} />}
                                                    {rule.label}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="form-group" style={{ position: 'relative' }}>
                                    <label>Access Code</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showAdminCode ? "text" : "password"}
                                            value={adminCode}
                                            onChange={(e) => setAdminCode(e.target.value)}
                                            placeholder="Enter your Staff or Admin code"
                                            required
                                            style={{ borderColor: '#c9a84c', paddingRight: '40px' }} 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowAdminCode(!showAdminCode)}
                                            style={{
                                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', color: '#8c7a60', cursor: 'pointer',
                                                padding: '0', display: 'flex', alignItems: 'center'
                                            }}
                                        >
                                            {showAdminCode ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#8c7a60', marginTop: '4px' }}>
                                        *A valid authorization code is required to register.
                                    </p>
                                </div>

                                <button type="submit" disabled={loading}>
                                    {loading ? "Sending code..." : "Send Verification Code →"}
                                </button>
                            </form>

                            <p className="login-link">
                                Already have an account? <Link to="/">Sign in</Link>
                            </p>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2>Check your email</h2>
                            <p className="subtitle">We sent a 6-digit code to <strong>{pendingEmail}</strong></p>

                            <form onSubmit={handleVerify}>
                                <div className="form-group">
                                    <label>Verification Code</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter 6-digit code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" disabled={loading}>
                                    {loading ? "Verifying..." : "Verify & Create Account →"}
                                </button>
                            </form>

                            <p className="login-link">
                                Wrong email?
                                <button
                                    onClick={() => setStep(1)}
                                    style={{
                                        background: 'none', border: 'none', color: '#4a3f2f', fontWeight: 'bold',
                                        cursor: 'pointer', marginLeft: '5px', padding: 0, fontSize: '14px', width: 'auto'
                                    }}
                                >
                                    Go back
                                </button>
                            </p>
                        </>
                    )}

                </div>
            </div>
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

export default Register;