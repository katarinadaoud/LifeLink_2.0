import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Alert, Form, Modal } from 'react-bootstrap';
import '../appointments/AppointmentCalendar.css';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage: React.FC = () => { 
    //component state management, handles variables that change over time
    const { user, deleteAccount, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

    //form for editing
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        department: '',
        email: '',
        phonenumber: '',
        healthRelated_info: '',
        dateOfBirth: ''
    });

    //client-side validation functions
    const validatePhoneNumber = (phone: string): string | null => {
        if (!phone.trim()) {
            return 'Phone number is required';
        }

        if (phone && !/^\d{8}$/.test(phone.replace(/\s/g, ''))) {
            return 'Phone number must be 8 digits';
        }
        return null;    
    };

    const validateFullName = (name: string): string | null => {
        if (name.trim().length < 2) {
            return 'Full name must be at least 2 characters long';
        }
        if (name && !/^[a-zA-ZæøåÆØÅ\s]+$/.test(name)) {
            return 'Full name can only contain letters and spaces';
        }
        return null;
    };

    const validateDateOfBirth = (date: string): string | null => {
        if (!date.trim()) {
            return 'Date of birth is required';
        }
        if (date) {
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 0 || age > 120) {
                return 'Please enter a valid date of birth';
            }
        }
        return null;
    };

    const validateRequired = (value: string, fieldName: string): string | null => {
        if (!value.trim()) return `${fieldName} is required`;
        return null;
    };

    const validateField = (name: string, value: string): string | null => {
        switch (name) {
            case 'fullName':
                return validateFullName(value);
            case 'phonenumber':
                return validatePhoneNumber(value);
            case 'dateOfBirth':
                return validateDateOfBirth(value);
            case 'address':
                return validateRequired(value, 'Address');
            case 'department':
                return validateRequired(value, 'Department');
            case 'healthRelated_info':
                return validateRequired(value, 'Health Related Information');
            default:
                return null;
            
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [user]);

    //find user profile
    const fetchUserProfile = async () => {
        if (!user) {
            return;
        }
        
        try {
            setLoading(true);
            let endpoint = '';
            
            //try multiple ways to get user id
            const userId = user.sub || user.nameid;
            
            //determine which endpoint to use based on user role
            if (user.role === 'Patient') {
                endpoint = `/api/patient/user/${userId}`;
            } else if (user.role === 'Employee') {
                endpoint = `/api/employee/user/${userId}`;
            }
            
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUserInfo(data);
                setFormData({
                    fullName: data.fullName || '',
                    address: data.address || '',
                    department: data.department || '',
                    email: user.email || '',
                    phonenumber: data.phonenumber || '',
                    healthRelated_info: data.healthRelated_info || '', // Match backend casing
                    dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : ''
                });
            } else if (response.status === 404) {
                // Profile not found: redirect to profile setup so the user can complete their profile
                navigate('/profile-setup');
                return;
            } else if (response.status === 401) {
                // Handle expired or invalid token: logout and redirect to login
                setError('Your session has expired. Please log in again.');
                logout(); // Clear user session
                navigate('/login'); // Redirect to login page
                return;
            } else {
                const errorText = await response.text();
                setError(`Failed to load profile information: ${response.status} - ${errorText}`);
            }
        } catch (err) {
            setError('Error loading profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        //real-time validation
        const validationError = validateField(name, value);
        setValidationErrors(prev => ({
            ...prev,
            [name]: validationError || ''
        }));
    };

    const handleSave = async () => {
        try {
            setError(null);
            setSuccess(null);
            
            //validate all fields before saving
            const errors: {[key: string]: string} = {};
            
            const fullNameError = validateFullName(formData.fullName);
            if (fullNameError) errors.fullName = fullNameError;

            const addressError = validateRequired(formData.address, 'Address');
            if (addressError) errors.address = addressError;  

            // Role-specific validation
            if (user?.role === 'Patient') {
                const phoneError = validatePhoneNumber(formData.phonenumber);
                if (phoneError) errors.phonenumber = phoneError;
                
                const dateError = validateDateOfBirth(formData.dateOfBirth);
                if (dateError) errors.dateOfBirth = dateError;

                const healthInfoError = validateRequired(formData.healthRelated_info, 'Health Related Information');
                if (healthInfoError) errors.healthRelated_info = healthInfoError;
            } else if (user?.role === 'Employee') {
                const departmentError = validateRequired(formData.department, 'Department');
                if (departmentError) errors.department = departmentError;
            }
            
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                setError('Please fix the validation errors before saving');
                return;
            }
            
            setValidationErrors({});
            
            let endpoint = '';
            if (user?.role === 'Patient') {
                endpoint = `/api/patient/${userInfo.patientId}`;
            } else if (user?.role === 'Employee') {
                endpoint = `/api/employee/${userInfo.employeeId}`;
            }
            
            const token = localStorage.getItem('token');
            const payload = user?.role === 'Employee' ? {
                EmployeeId: userInfo?.employeeId,
                FullName: formData.fullName,
                Address: formData.address,
                Department: formData.department,
                UserId: userInfo?.userId
            } : {
                ...userInfo,
                fullName: formData.fullName,
                address: formData.address,
                phonenumber: formData.phonenumber,
                healthRelated_info: formData.healthRelated_info,
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : userInfo.dateOfBirth
            };

            console.log('Profile update payload', payload);
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                setSuccess('Profile updated successfully!');
                setIsEditing(false);
                await fetchUserProfile();
            } else {
                const errorText = await response.text();
                setError(`Failed to update profile: ${response.status} - ${errorText}`);
            }
        } catch (err) {
            setError('Error updating profile');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        //reset form data to original values
        setFormData({
            fullName: userInfo?.fullName || '',
            address: userInfo?.address || '',
            department: userInfo?.department || '',
            email: user?.email || '',
            phonenumber: userInfo?.phonenumber || '',
            healthRelated_info: userInfo?.healthRelated_info ||'',
            dateOfBirth: userInfo?.dateOfBirth ? userInfo.dateOfBirth.split('T')[0] : ''
        });
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);
            setError(null);
            
            //first delete the patient/employee record if it exists
            if (userInfo) {
                let endpoint = '';
                if (user?.role === 'Patient' && userInfo.patientId) {
                    endpoint = `/api/patient/${userInfo.patientId}`;
                } else if (user?.role === 'Employee' && userInfo.employeeId) {
                    endpoint = `/api/employee/${userInfo.employeeId}`;
                }
                
                if (endpoint) {
                    const token = localStorage.getItem('token');
                    await fetch(`${API_URL}${endpoint}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                }
            }
            //then delete the user account
            await deleteAccount();
            
            //navigate to home page
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete account');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <Container className="mt-4">
                <div className="text-center">
                    <p>Loading profile...</p>
                </div>
            </Container>
        );
    }

    //the profile page view
    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header className="profile-card-header">
                            <h3 className="mb-0">My Profile</h3>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            
                            <Row>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <strong>Username:</strong>
                                        <p className="mt-1">{user?.username}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <strong>Role:</strong>
                                        <p className="mt-1">{user?.role}</p>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <strong>Email:</strong>
                                        <p className="mt-1">{user?.email}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <strong>User ID:</strong>
                                        <p className="mt-1">{user?.nameid}</p>
                                    </div>
                                </Col>
                            </Row>

                            {userInfo && (
                                <>
                                    <hr />
                                    <h5 className="mb-3">Personal Information</h5>
                                    
                                    <Form>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label><strong>Full Name:</strong></Form.Label>
                                                    {isEditing ? (
                                                        <>
                                                            <Form.Control
                                                                type="text"
                                                                name="fullName"
                                                                value={formData.fullName}
                                                                onChange={handleInputChange}
                                                                isInvalid={!!validationErrors.fullName}
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {validationErrors.fullName}
                                                            </Form.Control.Feedback>
                                                        </>
                                                    ) : (
                                                        <p className="mt-1">{userInfo.fullName}</p>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label><strong>Address:</strong></Form.Label>
                                                    {isEditing ? (
                                                        <>
                                                            <Form.Control
                                                                type="text"
                                                                name="address"
                                                                value={formData.address}
                                                                onChange={handleInputChange}
                                                                isInvalid={!!validationErrors.address}
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {validationErrors.address}
                                                            </Form.Control.Feedback>
                                                        </>
                                                    ) : (
                                                        <p className="mt-1">{userInfo.address}</p>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            {user?.role === 'Employee' && (
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label><strong>Department:</strong></Form.Label>
                                                        {isEditing ? (
                                                            <>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="department"
                                                                    value={formData.department}
                                                                    onChange={handleInputChange}
                                                                    isInvalid={!!validationErrors.department}
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {validationErrors.department}
                                                                </Form.Control.Feedback>
                                                            </>
                                                        ) : (
                                                            <p className="mt-1">{userInfo.department}</p>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {user?.role === 'Patient' && userInfo.patientId && (
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <strong>Patient ID:</strong>
                                                        <p className="mt-1">{userInfo.patientId}</p>
                                                    </div>
                                                </Col>
                                            )}
                                            {user?.role === 'Employee' && userInfo.employeeId && (
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <strong>Employee ID:</strong>
                                                        <p className="mt-1">{userInfo.employeeId}</p>
                                                    </div>
                                                </Col>
                                            )}
                                        </Row>

                                        {user?.role === 'Patient' && (
                                            <>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label><strong>Phone Number:</strong></Form.Label>
                                                            {isEditing ? (
                                                                <>
                                                                    <Form.Control
                                                                        type="text"
                                                                        name="phonenumber"
                                                                        value={formData.phonenumber}
                                                                        onChange={handleInputChange}
                                                                        placeholder="12345678"
                                                                        isInvalid={!!validationErrors.phonenumber}
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {validationErrors.phonenumber}
                                                                    </Form.Control.Feedback>
                                                                </>
                                                            ) : (
                                                                <p className="mt-1">{userInfo.phonenumber}</p>
                                                            )}
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label><strong>Date of Birth:</strong></Form.Label>
                                                            {isEditing ? (
                                                                <>
                                                                    <Form.Control
                                                                        type="date"
                                                                        name="dateOfBirth"
                                                                        value={formData.dateOfBirth}
                                                                        onChange={handleInputChange}
                                                                        isInvalid={!!validationErrors.dateOfBirth}
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {validationErrors.dateOfBirth}
                                                                    </Form.Control.Feedback>
                                                                </>
                                                            ) : (
                                                                <p className="mt-1">{userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toLocaleDateString() : ''}</p>
                                                            )}
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={12}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label><strong>Health Related Information:</strong></Form.Label>
                                                            {isEditing ? (
                                                                <>
                                                                <Form.Control
                                                                    as="textarea"
                                                                    rows={3}
                                                                    name="healthRelated_info"
                                                                    value={formData.healthRelated_info}
                                                                    onChange={handleInputChange}
                                                                    isInvalid={!!validationErrors.healthRelated_info}
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {validationErrors.healthRelated_info}
                                                                </Form.Control.Feedback>
                                                                </>
                                                            ) : (
                                                                <p className="mt-1">{userInfo.healthRelated_info}</p>
                                                            )}
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </>
                                        )}
                                    </Form>
                                </>
                            )}
                            
                            <div className="mt-4">
                                {isEditing ? (
                                    <div>
                                        <Button 
                                            onClick={handleSave} 
                                            className="btn btn-teal me-2"
                                        >
                                            Save Changes
                                        </Button>
                                        <Button 
                                            className="btn btn-delete"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <Button 
                                            className="me-2 btn btn-teal"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Edit Profile
                                        </Button>
                                        <Button 
                                            className="btn btn-delete"
                                            onClick={() => setShowDeleteModal(true)}
                                        >
                                            Delete Account
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/*delete account confirmation*/}
                            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Delete Account</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Alert variant="warning">
                                        <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
                                    </Alert>
                                    <p>Are you sure you want to delete your account?</p>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        className="btn btn-delete"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;