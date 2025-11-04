import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Alert, Form } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state for editing
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        department: '',
        email: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, [user]);

    const fetchUserProfile = async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            let endpoint = '';
            
            // Determine which endpoint to use based on user role
            if (user.role === 'Patient') {
                endpoint = `/api/patient/user/${user.nameid}`;
            } else if (user.role === 'Employee') {
                endpoint = `/api/employee/user/${user.nameid}`;
            }
            
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5090${endpoint}`, {
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
                    email: user.email || ''
                });
            } else {
                setError('Failed to load profile information');
            }
        } catch (err) {
            setError('Error loading profile');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    department: formData.department
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
            email: user?.email || ''
        });
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
                        <Card.Header className="bg-primary text-white">
                            <h3 className="mb-0">My Profile</h3>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            
                            <Row>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <strong>Username:</strong>
                                        <p className="mt-1">{user?.sub}</p>
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
                                    <Button 
                                        variant="primary" 
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;