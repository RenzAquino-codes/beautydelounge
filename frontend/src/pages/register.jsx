import React, { useState } from 'react';
import "./Register.css";
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import logo1 from '../assets/images/logo.jpg'
import loungeBg from '../assets/images/lounge.png';
import logo2 from '../assets/images/Groom1.png';

function Register() {
    const [firstname, setFirstname] = useState('');
    const [middlename, setMiddlename] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');
    const [pendingEmail, setPendingEmail] = useState('');
    const [adminCode, setAdminCode] = useState('');
    // const [showAdminField, setShowAdminField] = useState(false);
    const [errors, setErrors] = useState({});
    const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!isValidName(firstname)) newErrors.firstname = "Letters only, no numbers or special characters.";
        if (middlename && !isValidName(middlename)) newErrors.middlename = "Letters only, no numbers or special characters.";
        if (!isValidName(lastname)) newErrors.lastname = "Letters only, no numbers or special characters.";
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
            {/* LEFT SIDE - Branding */}
            <div className="register-left">
                <img src={logo1} alt="Beauty De Lounge" className="hero-logo" />
            </div>

            {/* RIGHT SIDE - Form */}
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
                                                setFirstname(val);
                                                if (val && !isValidName(val)) {
                                                    setErrors(prev => ({ ...prev, firstname: "Letters only, no numbers or special characters." }));
                                                } else {
                                                    setErrors(prev => ({ ...prev, firstname: '' }));
                                                }
                                            }}
                                            placeholder="First name"
                                            style={{ borderColor: errors.firstname ? '#e74c3c' : '' }}
                                            required
                                        />
                                        {errors.firstname && <span className="field-error">{errors.firstname}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Middle Name</label>
                                        <input
                                            type="text"
                                            value={middlename}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setMiddlename(val);
                                                if (val && !isValidName(val)) {
                                                    setErrors(prev => ({ ...prev, middlename: "Letters only, no numbers or special characters." }));
                                                } else {
                                                    setErrors(prev => ({ ...prev, middlename: '' }));
                                                }
                                            }}
                                            placeholder="Middle name"
                                            style={{ borderColor: errors.middlename ? '#e74c3c' : '' }}
                                        />
                                        {errors.middlename && <span className="field-error">{errors.middlename}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={lastname}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setLastname(val);
                                            if (val && !isValidName(val)) {
                                                setErrors(prev => ({ ...prev, lastname: "Letters only, no numbers or special characters." }));
                                            } else {
                                                setErrors(prev => ({ ...prev, lastname: '' }));
                                            }
                                        }}
                                        placeholder="Last name"
                                        style={{ borderColor: errors.lastname ? '#e74c3c' : '' }}
                                        required
                                    />
                                    {errors.lastname && <span className="field-error">{errors.lastname}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" required />
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setPasswordFocused(true)}
                                        placeholder="Enter password"
                                        style={{ borderColor: errors.password ? '#e74c3c' : passwordFocused && isPasswordValid() ? '#c9a84c' : '' }}
                                        required
                                    />
                                    {/* Hidden admin code toggle */}
                                    {/* <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowAdminField(!showAdminField)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '12px',
                                                color: '#8c7a60',
                                                cursor: 'pointer',
                                                padding: 0,
                                                width: 'auto',
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            {showAdminField ? 'Hide admin code' : 'Have an admin code?'}
                                        </button>
                                    </div> */}


                                    {/* {showAdminField && (
                                        <div className="form-group">
                                            <label>Admin Code</label>
                                            <input
                                                type="password"
                                                value={adminCode}
                                                onChange={(e) => setAdminCode(e.target.value)}
                                                placeholder="Enter admin code"
                                            />
                                        </div>
                                    )} */}
                                    <div className="form-group">
                                        <label>Access Code</label>
                                        <input
                                            type="password"
                                            value={adminCode}
                                            onChange={(e) => setAdminCode(e.target.value)}
                                            placeholder="Enter your Staff or Admin code"
                                            required
                                            style={{ borderColor: '#c9a84c' }} // Highlight it in gold to show importance
                                        />
                                        <p style={{ fontSize: '11px', color: '#8c7a60', marginTop: '4px' }}>
                                            *A valid authorization code is required to register.
                                        </p>
                                    </div>
                                    {/* {(passwordFocused || password) && (
                                        <ul className="password-rules">
                                            {passwordRules.map((rule, i) => (
                                                <li key={i} className={rule.test(password) ? 'rule-pass' : 'rule-fail'}>
                                                    {rule.test(password)
                                                        ? <FaCheckCircle style={{ marginRight: '8px' }} />
                                                        : <FaTimesCircle style={{ marginRight: '8px' }} />
                                                    }
                                                    {rule.label}
                                                </li>
                                            ))}
                                        </ul>
                                    )} */}
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
                                        background: 'none',
                                        border: 'none',
                                        color: '#4a3f2f',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        marginLeft: '5px',
                                        padding: 0,
                                        fontSize: '14px',
                                        width: 'auto'
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