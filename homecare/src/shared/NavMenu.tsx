import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import AuthSection from '../auth/AuthSection';
import { useAuth } from '../auth/AuthContext';


const NavMenu: React.FC = () => {
  const { user } = useAuth();

  return (
    <Navbar expand="lg">
      <Navbar.Brand href="/">Lifelink</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/">Home</Nav.Link>
          
          {/* Profile link for all authenticated users */}
          {user && <Nav.Link href="/profile">My Profile</Nav.Link>
          }
          
          {/* Employee-specific navigation */}
          {user?.role === 'Employee' && (
            <>
            <Nav.Link href="/appointments">Appointments</Nav.Link>
            <Nav.Link href="/medications">Medications</Nav.Link>
            </>
          )}
          {/* Patient-specific navigation */}
          {user?.role === 'Patient' && (
            <>
            <Nav.Link href="/appointments">My Appointments</Nav.Link>
            <Nav.Link href="/medications">My Medications</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
      <AuthSection />
  </Navbar>
  );
};

export default NavMenu;