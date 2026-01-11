import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import './Auth.css';
import { get as httpGet } from '../shared/http';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            // Attempt to log in and get user details
            const user = await login({ username, password });
            //Determine which profile to check based on role
            let endpoint = '';
            
            if (user.role === 'Patient') {
                endpoint = `/api/patient/user/${user.sub}`;
            } else if (user.role === 'Employee') {
                endpoint = `/api/employee/user/${user.sub}`;
            }
            
            if (endpoint) {
                try {
                    //Check if user already has a profile using shared HTTP wrapper
                    const profileData = await httpGet(endpoint) as any;
                    const isProfileComplete = !!profileData.fullName && !!profileData.address;

                    if (!isProfileComplete) {
                        navigate('/profile-setup');
                        return;
                    }
                } catch (profileErr) {
                    console.error('Error checking profile:', profileErr);
                    // If profile check fails, redirect to profile setup
                    navigate('/profile-setup');
                    return;
                }
            }
            
            // Navigate to home page if profile is complete
            navigate('/');
            
        } catch (err) {
            //Invalid login credentials or login error
            setError('Invalid username or password.');
            console.error(err);
        }
    };

    return (
        <Container className="auth-container">
            <h2 className="auth-title">Login</h2>
            {error && <Alert variant="danger">{error}</Alert>} {/*Conditional rendering*/}
            <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label className="auth-label">Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="auth-input"
                        required/>
                </Form.Group>

                {/* Password field */}
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label className="auth-label">Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input"
                        required/>
                </Form.Group>
                <Button
                    type="submit"
                    className="btn btn-teal auth-submit"
                >
                    Login
                </Button>
            </Form>
        </Container>
    );
};

export default LoginPage;