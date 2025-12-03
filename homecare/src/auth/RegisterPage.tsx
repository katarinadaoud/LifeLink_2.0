import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import * as authService from './AuthService';
import './Auth.css';

const RegisterPage: React.FC = () => { // Registration page component
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'Patient' as 'Patient' | 'Employee',
    });
    // State for error and success messages
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    //Update form data state on input change
        const handleChange = (
            e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
        ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            //Attempt to register user
            await authService.register(formData);
            setSuccess('Registration successful! Please complete your profile.');
            setTimeout(() => navigate('/profile-setup'), 2000); // Redirect to profile setup
        } catch (err) {
            //Display error message if available
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
            console.error(err);
        }
    };

    return (
        // Registration form UI
        <Container className="auth-container">
            <h2 className="auth-title">Register</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label className="auth-label">Username</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        className="auth-input"
                        required 
                    />
                </Form.Group>
            {/* Email field */}
                <Form.Group className="mb-3">
                    <Form.Label className="auth-label">Email</Form.Label>
                    <Form.Control 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className="auth-input"
                        required 
                    />
                </Form.Group>
                {/* Password field */}
                <Form.Group className="mb-3">
                    <Form.Label className="auth-label">Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        className="auth-input"
                        required 
                    />
                </Form.Group>

                {/* Role selection field */}
                <Form.Group className="mb-3">
                    <Form.Label className="auth-label">I am a:</Form.Label>
                    <Form.Select 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        className="auth-input"
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