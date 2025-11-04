import React from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
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
          
          {/* Show appointments for all authenticated users */}
          {user && <Nav.Link href="/appointments">Appointments</Nav.Link>}
          
          {/* Employee-specific navigation */}
          {user?.role === 'Employee' && (
            <NavDropdown title="Management" id="employee-nav-dropdown">
              <NavDropdown.Item href="/patients">Patients</NavDropdown.Item>
              <NavDropdown.Item href="/employees">Staff</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/appointments/new">New Appointment</NavDropdown.Item>
            </NavDropdown>
          )}
          
          {/* Patient-specific navigation */}
          {user?.role === 'Patient' && (
            <Nav.Link href="/my-appointments">My Appointments</Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
      <AuthSection />
  </Navbar>
  );
};

export default NavMenu;