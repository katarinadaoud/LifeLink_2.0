import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';
import './ProfilePage.css';
import { post as httpPost } from '../shared/http';

interface PatientProfileData { //data structure for patient profile
    fullName: string;
    address: string;
    dateOfBirth: string;
    phoneNumber: string;
    healthRelatedInfo: string;
}

interface EmployeeProfileData { //data structure for employee profile
    fullName: string;
    address: string;
    department: string;
}

const ProfileSetupPage: React.FC = () => { //main functional component for profile setup
    
    const { user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [patientData, setPatientData] = useState<PatientProfileData>({ //state for patient profile data
        fullName: '',
        address: '',
        dateOfBirth: '',
        phoneNumber: '',
        healthRelatedInfo: ''
    });

    const [employeeData, setEmployeeData] = useState<EmployeeProfileData>({ //state for employee profile data
        fullName: '',
        address: '',
        department: ''
    });

    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    //client-side validation functions
    const validateFullName = (name: string): string | null => {
        if (name.trim().length < 2) return 'Full name must be at least 2 characters long';
        if (name && !/^[a-zA-ZæøåÆØÅ\s]+$/.test(name)) return 'Full name can only contain letters and spaces';
        return null;
    };

    //phone number validation
    const validatePhoneNumber = (phone: string): string | null => {
        if (!phone.trim()) {
            return 'Phone number is required';
        }
        if (phone && !/^\d{8}$/.test(phone.replace(/\s/g, ''))) {
            return 'Phone number must be 8 digits';
        }
        return null;
    };

    //  date of birth validation
    const validateDateOfBirth = (date: string): string | null => {
        if (!date.trim()) {
            return 'Date of birth is required';
        }
        if (date) {
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 0 || age > 120) return 'Please enter a valid date of birth';
        }
        return null;
    };

    const validateRequired = (value: string, fieldName: string): string | null => {
        if (!value.trim()) return `${fieldName} is required`;
        return null;
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    //handle input changes with validation
    const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPatientData({ ...patientData, [name]: value });
        
        //real-time validation
        let error = '';
        switch (name) {
            case 'fullName':
                error = validateFullName(value) || '';
                break;
            case 'phoneNumber':
                error = validatePhoneNumber(value) || '';
                break;
            case 'dateOfBirth':
                error = validateDateOfBirth(value) || '';
                break;
            case 'address':
                error = validateRequired(value, 'Address') || '';
                break;
        }
        
        setValidationErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEmployeeData({ ...employeeData, [name]: value });
        
        //real-time validation
        let error = '';
        switch (name) {
            case 'fullName':
                error = validateFullName(value) || '';
                break;
            case 'address':
                error = validateRequired(value, 'Address') || '';
                break;
            case 'department':
                error = validateRequired(value, 'Department') || '';
                break;
        }
        
        setValidationErrors(prev => ({ ...prev, [name]: error }));
    };

    //submit the patient profile
    const submitPatientProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        //validate all fields before submission
        const errors = {
            fullName: validateFullName(patientData.fullName) || '',
            address: validateRequired(patientData.address, 'Address') || '',
            dateOfBirth: validateDateOfBirth(patientData.dateOfBirth) || '',
            phoneNumber: validatePhoneNumber(patientData.phoneNumber) || ''
        };

        setValidationErrors(errors);
        
        //check if there are any validation errors
        const hasErrors = Object.values(errors).some(error => error !== '');
        if (hasErrors) {
            setError('Please fix the validation errors before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            const serverData = {
                fullName: patientData.fullName,
                address: patientData.address,
                dateOfBirth: patientData.dateOfBirth,
                phonenumber: patientData.phoneNumber,
                HealthRelated_info: patientData.healthRelatedInfo
            };

            await httpPost('/api/Auth/complete-patient-profile', serverData);
            setSuccess('Patient profile created successfully!');
            setTimeout(() => navigate('/appointments'), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    //submit the employee profile
    const submitEmployeeProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        //validate all fields before submission
        const errors = {
            fullName: validateFullName(employeeData.fullName) || '',
            address: validateRequired(employeeData.address, 'Address') || '',
            department: validateRequired(employeeData.department, 'Department') || ''
        };

        setValidationErrors(errors);
        
        //check if there are any validation errors
        const hasErrors = Object.values(errors).some(error => error !== '');
        if (hasErrors) {
            setError('Please fix the validation errors before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            await httpPost('/api/Auth/complete-employee-profile', employeeData);
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

    //the view for profile setup
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
                        <Form onSubmit={submitPatientProfile} noValidate>
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    value={patientData.fullName}
                                    onChange={handlePatientChange}
                                    isInvalid={!!validationErrors.fullName}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.fullName}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Address *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={patientData.address}
                                    onChange={handlePatientChange}
                                    isInvalid={!!validationErrors.address}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.address}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Date of Birth *</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dateOfBirth"
                                    value={patientData.dateOfBirth}
                                    onChange={handlePatientChange}
                                    max={new Date().toISOString().slice(0, 10)} /* Added: prevent selecting future dates */
                                    isInvalid={!!validationErrors.dateOfBirth}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.dateOfBirth}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phoneNumber"
                                    value={patientData.phoneNumber}
                                    onChange={handlePatientChange}
                                    isInvalid={!!validationErrors.phoneNumber}
                                    placeholder="12345678"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.phoneNumber}
                                </Form.Control.Feedback>
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
                        <Form onSubmit={submitEmployeeProfile} noValidate>
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    value={employeeData.fullName}
                                    onChange={handleEmployeeChange}
                                    isInvalid={!!validationErrors.fullName}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.fullName}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Address *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={employeeData.address}
                                    onChange={handleEmployeeChange}
                                    isInvalid={!!validationErrors.address}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.address}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Department *</Form.Label>
                                <Form.Select
                                    name="department"
                                    value={employeeData.department}
                                    onChange={handleEmployeeChange}
                                    isInvalid={!!validationErrors.department}
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
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.department}
                                </Form.Control.Feedback>
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