import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Nav, Dropdown } from 'react-bootstrap';

const AuthSection: React.FC = () => {
    const { user, logout } = useAuth(); //get current user and logout function from context

    return (
        <Nav>
            {user ? (
                // If user is logged in, show user menu
                <Dropdown align="end">
                    <Dropdown.Toggle as={Nav.Link} id="dropdown-user">
                        Welcome, {user.role} {user.username}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item as={Link} to="/profile">My Profile</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            ) : (
                // If no user is logged in, show login/register links
                <>
                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                    <Nav.Link as={Link} to="/register">Register</Nav.Link>  
                </>
            )}
        </Nav>
    );
};

export default AuthSection;