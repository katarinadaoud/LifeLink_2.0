import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import * as authService from './AuthService';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'Patient' as 'Patient' | 'Employee',
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await authService.register(formData);
            setSuccess('Registration successful! Please complete your profile.');
            setTimeout(() => navigate('/profile-setup'), 2000); // Redirect to profile setup
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
            console.error(err);
        }
    };

    return (
        <Container className="mt-5">
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#177e8b' }}>Register</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '1.1rem', fontWeight: '500' }}>Username</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        style={{ 
                            fontSize: '1.1rem', 
                            padding: '0.75rem' 
                        }}
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '1.1rem', fontWeight: '500' }}>Email</Form.Label>
                    <Form.Control 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        style={{ 
                            fontSize: '1.1rem', 
                            padding: '0.75rem' 
                        }}
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '1.1rem', fontWeight: '500' }}>Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        style={{ 
                            fontSize: '1.1rem', 
                            padding: '0.75rem' 
                        }}
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '1.1rem', fontWeight: '500' }}>I am a:</Form.Label>
                    <Form.Select 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        style={{ 
                            fontSize: '1.1rem', 
                            padding: '0.75rem' 
                        }}
                        required
                    >
                        <option value="Patient">Patient</option>
                        <option value="Employee">Employee</option>
                    </Form.Select>
                </Form.Group>

                <Button
                    type="submit"
                    className="btn btn-teal auth-submit"
                >
                    Register
                </Button>
            </Form>
        </Container>
    );
};

export default RegisterPage;