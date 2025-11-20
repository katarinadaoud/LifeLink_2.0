import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Alert, Form, Modal } from 'react-bootstrap';
import '../appointments/AppointmentCalendar.css';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const { user, deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state for editing
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        department: '',
        email: '',
        phonenumber: '',
        healthRelated_info: '',
        dateOfBirth: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, [user]);

    const fetchUserProfile = async () => {
        if (!user) {
            console.log('No user found');
            return;
        }
        
        try {
            setLoading(true);
            let endpoint = '';
            
            console.log('User object:', user);
            console.log('User role:', user.role);
            console.log('User sub:', user.sub);
            console.log('All user properties:', Object.keys(user));
            
            // Try multiple ways to get user ID - check what's actually available
            const userId = user.sub || user.nameid;
            
            console.log('Resolved userId:', userId);
            
            // Determine which endpoint to use based on user role
            if (user.role === 'Patient') {
                endpoint = `/api/patient/user/${userId}`;
            } else if (user.role === 'Employee') {
                endpoint = `/api/employee/user/${userId}`;
            }
            
            console.log('Endpoint:', endpoint);
            
            const token = localStorage.getItem('token');
            console.log('Token exists:', !!token);
            
            const response = await fetch(`http://localhost:5090${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (response.ok) {
                const data = await response.json();
                setUserInfo(data);
                setFormData({
                    fullName: data.fullName || '',
                    address: data.address || '',
                    department: data.department || '',
                    email: user.email || '',
                    phonenumber: data.phonenumber || '',
                    healthRelated_info: data.healthRelated_info || '',
                    dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : ''
                });
            } else if (response.status === 404) {
                // Profile not found - try to create it
                console.log('Profile not found, attempting to create profile...');
                try {
                    const createResponse = await fetch(`http://localhost:5090/api/Auth/create-profile`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (createResponse.ok) {
                        console.log('Profile created successfully, refetching...');
                        // Retry fetching the profile
                        await fetchUserProfile();
                        return;
                    } else {
                        const createErrorText = await createResponse.text();
                        console.log('Failed to create profile:', createResponse.status, createErrorText);
                        setError(`Failed to create profile: ${createResponse.status} - ${createErrorText}`);
                    }
                } catch (createErr) {
                    console.error('Error creating profile:', createErr);
                    setError('Error creating profile');
                }
            } else {
                const errorText = await response.text();
                console.log('Error response:', response.status, errorText);
                setError(`Failed to load profile information: ${response.status} - ${errorText}`);
            }
        } catch (err) {
            setError('Error loading profile');
            console.error('Error fetching profile:', err);
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
    };

    const handleSave = async () => {
        try {
            setError(null);
            setSuccess(null);
            
            let endpoint = '';
            if (user?.role === 'Patient') {
                endpoint = `/api/patient/${userInfo.patientId}`;
            } else if (user?.role === 'Employee') {
                endpoint = `/api/employee/${userInfo.employeeId}`;
            }
            
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5090${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...userInfo,
                    fullName: formData.fullName,
                    address: formData.address,
                    department: formData.department,
                    phonenumber: formData.phonenumber,
                    healthRelated_info: formData.healthRelated_info,
                    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : userInfo.dateOfBirth
                })
            });
            
            if (response.ok) {
                setSuccess('Profile updated successfully!');
                setIsEditing(false);
                await fetchUserProfile(); // Refresh data
            } else {
                setError('Failed to update profile');
            }
        } catch (err) {
            setError('Error updating profile');
            console.error('Error updating profile:', err);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data to original values
        setFormData({
            fullName: userInfo?.fullName || '',
            address: userInfo?.address || '',
            department: userInfo?.department || '',
            email: user?.email || '',
            phonenumber: userInfo?.phonenumber || '',
            healthRelated_info: userInfo?.healthRelated_info || '',
            dateOfBirth: userInfo?.dateOfBirth ? userInfo.dateOfBirth.split('T')[0] : ''
        });
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);
            setError(null);
            
            // First delete the patient/employee record if it exists
            if (userInfo) {
                let endpoint = '';
                if (user?.role === 'Patient' && userInfo.patientId) {
                    endpoint = `/api/patient/${userInfo.patientId}`;
                } else if (user?.role === 'Employee' && userInfo.employeeId) {
                    endpoint = `/api/employee/${userInfo.employeeId}`;
                }
                
                if (endpoint) {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:5090${endpoint}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (!response.ok) {
                        console.warn('Failed to delete patient/employee record, proceeding with account deletion');
                    }
                }
            }
            
            // Then delete the user account
            await deleteAccount();
            
            // Navigate to home page
            navigate('/');
        } catch (err) {
            console.error('Error deleting account:', err);
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

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header style={{ backgroundColor: '#177e8b', color: 'white' }}>
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
                                                        <Form.Control
                                                            type="text"
                                                            name="fullName"
                                                            value={formData.fullName}
                                                            onChange={handleInputChange}
                                                        />
                                                    ) : (
                                                        <p className="mt-1">{userInfo.fullName}</p>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label><strong>Address:</strong></Form.Label>
                                                    {isEditing ? (
                                                        <Form.Control
                                                            type="text"
                                                            name="address"
                                                            value={formData.address}
                                                            onChange={handleInputChange}
                                                        />
                                                    ) : (
                                                        <p className="mt-1">{userInfo.address}</p>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label><strong>Department:</strong></Form.Label>
                                                    {isEditing ? (
                                                        <Form.Control
                                                            type="text"
                                                            name="department"
                                                            value={formData.department}
                                                            onChange={handleInputChange}
                                                        />
                                                    ) : (
                                                        <p className="mt-1">{userInfo.department}</p>
                                                    )}
                                                </Form.Group>
                                            </Col>
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
                                                                <Form.Control
                                                                    type="text"
                                                                    name="phonenumber"
                                                                    value={formData.phonenumber}
                                                                    onChange={handleInputChange}
                                                                    placeholder="+47xxxxxxxx"
                                                                />
                                                            ) : (
                                                                <p className="mt-1">{userInfo.phonenumber}</p>
                                                            )}
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label><strong>Date of Birth:</strong></Form.Label>
                                                            {isEditing ? (
                                                                <Form.Control
                                                                    type="date"
                                                                    name="dateOfBirth"
                                                                    value={formData.dateOfBirth}
                                                                    onChange={handleInputChange}
                                                                />
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
                                                                <Form.Control
                                                                    as="textarea"
                                                                    rows={3}
                                                                    name="healthRelated_info"
                                                                    value={formData.healthRelated_info}
                                                                    onChange={handleInputChange}
                                                                />
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
                                            variant="success" 
                                            onClick={handleSave} 
                                            className="me-2"
                                        >
                                            Save Changes
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <Button 
                                            style={{ 
                                                backgroundColor: '#177e8b', 
                                                borderColor: '#177e8b',
                                                color: 'white'
                                            }}
                                            onClick={() => setIsEditing(true)}
                                            className="me-2"
                                        >
                                            Edit Profile
                                        </Button>
                                        <Button 
                                            className="btn appointment-grid-btn-delete"
                                            onClick={() => setShowDeleteModal(true)}
                                        >
                                            Delete Account
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Delete Account Confirmation Modal */}
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
                                        className="btn appointment-grid-btn-delete"
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