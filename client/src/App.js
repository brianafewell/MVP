import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import './App.css';

function App() {
    // ==========================================
    // STATE MANAGEMENT
    // ==========================================
    
    // User information
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    
    // UI state management
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
    const [isLoading, setIsLoading] = useState(false);
    
    // Check for saved session on load
    useEffect(() => {
        const savedUser = localStorage.getItem('pulseUser');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setName(userData.name);
                setEmail(userData.email);
                setIsVerified(true);
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('pulseUser');
            }
        }
    }, []);
    
    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    
    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Email validation
        const emailPattern = /@(spelman\.edu|morehouse\.edu)$/;
        if (!emailPattern.test(email)) {
            setMessage('Email must end with @spelman.edu or @morehouse.edu.');
            setMessageType('error');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('/register', { name, email, password });
            console.log("Registration API response:", response);
            setMessage(response.data.message || 'Verification code sent to your email!');
            setMessageType('success');
            setIsEmailSent(true);
        } catch (error) {
            setMessage('Error during registration: ' + (error.response?.data?.message || error.message));
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await axios.post('/login', { email, password });
            console.log("Login API response:", response);
            
            if (response.data.success) {
                // Store user data
                const userData = {
                    name: response.data.name || name || 'User',
                    email: email
                };
                
                setName(userData.name);
                setMessage('Login successful!');
                setMessageType('success');
                setIsVerified(true);
                
                // Save to localStorage for persistent session
                localStorage.setItem('pulseUser', JSON.stringify(userData));
            } else {
                setMessage(response.data.message || 'Login failed. Please check your credentials.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error during login: ' + (error.response?.data?.message || error.message));
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        setIsLoading(true);
        
        try {
            const response = await axios.post('/verify', { email, verificationCode });
            setMessage(response.data.message || 'Email verified successfully!');
            setMessageType('success');
            
            if (response.data.success) {
                // Store user data
                const userData = {
                    name: name,
                    email: email
                };
                
                setIsVerified(true);
                localStorage.setItem('pulseUser', JSON.stringify(userData));
            }
        } catch (error) {
            setMessage('Invalid verification code. Please try again.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        // Clear all user data
        setName('');
        setEmail('');
        setPassword('');
        setMessage('');
        setMessageType('');
        setVerificationCode('');
        setIsEmailSent(false);
        setIsVerified(false);
        
        // Remove from localStorage
        localStorage.removeItem('pulseUser');
    };

    const toggleAuthMode = () => {
        setAuthMode(authMode === 'register' ? 'login' : 'register');
        setMessage('');
        setMessageType('');
    };
    
    // Request a new verification code
    const handleResendCode = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('/resend-verification', { email });
            setMessage(response.data.message || 'New verification code sent!');
            setMessageType('success');
        } catch (error) {
            setMessage('Error sending verification code: ' + (error.response?.data?.message || error.message));
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // COMPONENT RENDERING FUNCTIONS
    // ==========================================
    
    const renderLoginForm = () => (
        <form onSubmit={handleLogin}>
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your university email"
                    disabled={isLoading}
                    required
                />
            </div>
            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    disabled={isLoading}
                    required
                />
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="auth-toggle">
                Don't have an account? <a href="#" onClick={toggleAuthMode}>Register</a>
            </div>
        </form>
    );

    const renderRegistrationForm = () => (
        <form onSubmit={handleRegister}>
            <div className="form-group">
                <label>Full Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    disabled={isLoading}
                    required
                />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your university email"
                    disabled={isLoading}
                    required
                />
                <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>
                    Must be a Spelman or Morehouse email
                </small>
            </div>
            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    disabled={isLoading}
                    required
                />
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register'}
            </button>
            
            <div className="auth-toggle">
                Already have an account? <a href="#" onClick={toggleAuthMode}>Login</a>
            </div>
        </form>
    );

    const renderVerificationForm = () => (
        <div className="verification-container">
            <h2>Verify Your Email</h2>
            <p>A verification code has been sent to {email}. Please enter it below:</p>
            
            <div className="form-group">
                <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter code"
                    disabled={isLoading}
                    maxLength={6}
                    required
                />
            </div>
            
            <button 
                type="button" 
                onClick={handleVerifyEmail}
                disabled={isLoading}
                style={{ marginBottom: '10px' }}
            >
                {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
            
            <div style={{ marginTop: '15px', fontSize: '0.9rem' }}>
                Didn't receive the code? <a href="#" onClick={handleResendCode}>Resend</a>
            </div>
        </div>
    );

    // ==========================================
    // MAIN RENDER FUNCTION
    // ==========================================
    return (
        <div className="App">
            {!isVerified ? (
                <div className="auth-container">
                    <div className="app-title">PULSE</div>
                    <div className="app-subtitle">Professor Undergrad Learning & Student Evaluations</div>
                    
                    {isEmailSent ? (
                        renderVerificationForm()
                    ) : (
                        <>
                            <div className="auth-tabs">
                                <button 
                                    className={`tab-btn ${authMode === 'register' ? 'active' : ''}`}
                                    onClick={() => setAuthMode('register')}
                                >
                                    Register
                                </button>
                                <button 
                                    className={`tab-btn ${authMode === 'login' ? 'active' : ''}`}
                                    onClick={() => setAuthMode('login')}
                                >
                                    Login
                                </button>
                            </div>
                            
                            {authMode === 'register' ? renderRegistrationForm() : renderLoginForm()}
                        </>
                    )}
                    
                    {message && (
                        <div className={`message ${messageType}`}>
                            {message}
                        </div>
                    )}
                </div>
            ) : (
                <Dashboard 
                    name={name} 
                    email={email} 
                    onLogout={handleLogout} 
                />
            )}
        </div>
    );
}

export default App;