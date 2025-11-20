import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';

interface PatientProfileData {
    fullName: string;
    address: string;
    dateOfBirth: string;
    phoneNumber: string;
    healthRelatedInfo: string;
}

interface EmployeeProfileData {
    fullName: string;
    address: string;
    department: string;
}

const ProfileSetupPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [patientData, setPatientData] = useState<PatientProfileData>({
        fullName: '',
        address: '',
        dateOfBirth: '',
        phoneNumber: '',
        healthRelatedInfo: ''
    });

    const [employeeData, setEmployeeData] = useState<EmployeeProfileData>({
        fullName: '',
        address: '',
        department: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPatientData({ ...patientData, [e.target.name]: e.target.value });
    };

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });
    };

    const submitPatientProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5090/api/Auth/complete-patient-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(patientData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create profile');
            }

            setSuccess('Patient profile created successfully!');
            setTimeout(() => navigate('/appointments'), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitEmployeeProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5090/api/Auth/complete-employee-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(employeeData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create profile');
            }

            setSuccess('Employee profile created successfully!');
            setTimeout(() => navigate('/appointments'), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <Container className="mt-5">
            <Card>
                <Card.Header>
                    <h3>Complete Your Profile</h3>
                    <p className="mb-0 text-muted">Please fill in your information to complete your registration as a {user.role}.</p>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    {user.role === 'Patient' && (
                        <Form onSubmit={submitPatientProfile}>
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    value={patientData.fullName}
                                    onChange={handlePatientChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Address *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={patientData.address}
                                    onChange={handlePatientChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Date of Birth *</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dateOfBirth"
                                    value={patientData.dateOfBirth}
                                    onChange={handlePatientChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phoneNumber"
                                    value={patientData.phoneNumber}
                                    onChange={handlePatientChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Health Related Information</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="healthRelatedInfo"
                                    value={patientData.healthRelatedInfo}
                                    onChange={handlePatientChange}
                                    placeholder="Any medical conditions, allergies, or health information we should know about..."
                                />
                            </Form.Group>

                            <Button className="btn btn-teal auth-submit" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating Profile...' : 'Complete Patient Profile'}
                            </Button>
                        </Form>
                    )}

                    {user.role === 'Employee' && (
                        <Form onSubmit={submitEmployeeProfile}>
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    value={employeeData.fullName}
                                    onChange={handleEmployeeChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Address *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={employeeData.address}
                                    onChange={handleEmployeeChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Department *</Form.Label>
                                <Form.Select
                                    name="department"
                                    value={employeeData.department}
                                    onChange={handleEmployeeChange}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="Nursing">Nursing</option>
                                    <option value="Physical Therapy">Physical Therapy</option>
                                    <option value="Occupational Therapy">Occupational Therapy</option>
                                    <option value="Social Work">Social Work</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Management">Management</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>

                            <Button className="btn btn-teal auth-submit" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating Profile...' : 'Complete Employee Profile'}
                            </Button>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfileSetupPage;