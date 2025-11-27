import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';

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
            const token = localStorage.getItem('token');
            let endpoint = '';
            
            if (user.role === 'Patient') {
                endpoint = `/api/patient/user/${user.sub}`;
            } else if (user.role === 'Employee') {
                endpoint = `/api/employee/user/${user.sub}`;
            }
            
            if (endpoint) {
                try {
                    //Check if user already has a profile
                    const profileResponse = await fetch(`http://localhost:5090${endpoint}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (profileResponse.status === 404) {
                        // Profile not complete, redirect to profile setup
                        navigate('/profile-setup');
                        return;
                    } else if (profileResponse.ok) {
                        const profileData = await profileResponse.json();
                        // Check if profile has minimal required data
                        const isProfileComplete = profileData.fullName && 
                                                profileData.fullName !== user.username &&
                                                profileData.address;
                        
                        if (!isProfileComplete) {
                            navigate('/profile-setup');
                            return;
                        }
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
        <Container className="mt-5">
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#177e8b' }}>Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label style={{ fontSize: '1.1rem', fontWeight: '500' }}>Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ 
                            fontSize: '1.1rem', 
                            padding: '0.75rem' 
                        }}
                        required/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label style={{ fontSize: '1.1rem', fontWeight: '500' }}>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ 
                            fontSize: '1.1rem', 
                            padding: '0.75rem' 
                        }}
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