import React, { useState, useEffect } from 'react';
import { Nav, Navbar, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { NotificationService } from '../notifications/NotificationService';
import './NavMenu.css';

const NavMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Load unread notification count
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Refresh count every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Navigate to a search results page with the query
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery(''); // Clear search after navigation
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="lifelink-nav-wrapper">
      <div className="lifelink-nav-inner">
        <Navbar
          expand="lg"
          className="px-0 d-flex align-items-center lifelink-navbar"
        >
          {/* Logo */}
          <Navbar.Brand
            as={Link}
            to="/"
            className="fw-bold d-flex align-items-center lifelink-navbar-brand"
          >
            <span className="lifelink-logo-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" role="presentation" focusable="false" aria-hidden="true">
                {/* House – a little lifted inside heart */}
                <path
                  d="M16 32 L32 16 L48 32 V48 H40 V36 H24 V48 H16 Z"
                  className="lifelink-logo-house"
                />
                {/* Broad, clear heart around the house – slightly lower */}
                <path
                  d="
                    M32 8
                    C22 0, 2 4, 2 20
                    C2 36, 18 48, 32 58
                    C46 48, 62 36, 62 20
                    C62 4, 42 0, 32 8
                    Z
                  "
                  className="lifelink-logo-heart"
                />
              </svg>
            </span>
            <span className="lifelink-logo-text">
              <span className="lifelink-logo-text-life">Life</span>
              <span className="lifelink-logo-text-link">Link</span>
            </span>
          </Navbar.Brand>

          {/* Right side content for mobile - shown before hamburger */}
          <div className="d-flex d-lg-none align-items-center lifelink-mobile-right">
            {user ? (
              <>
                {/* Notifications for mobile */}
                <Button
                  variant="outline-secondary"
                  onClick={handleNotificationClick}
                  className="position-relative me-2 lifelink-bell-btn"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                  <i className="bi bi-bell lifelink-bell-icon" aria-hidden="true"></i>
                  {unreadCount > 0 && (
                    <Badge
                      bg="danger"
                      className="position-absolute top-0 start-100 translate-middle lifelink-bell-badge"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </>
            ) : null}
          </div>

          {/* Hamburger Menu */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                as={Link}
                to="/"
                className="lifelink-nav-link-main"
              >
                Home
              </Nav.Link>

              {/* Profile link for all authenticated users */}
              {user && (
                <Nav.Link
                  as={Link}
                  to="/profile"
                  className="lifelink-nav-link"
                >
                  My Profile
                </Nav.Link>
              )}

              {/* Employee-specific navigation */}
              {user?.role === 'Employee' && (
                <>
                  <Nav.Link
                    as={Link}
                    to="/appointments"
                    className="lifelink-nav-link"
                  >
                    Appointments
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/medications"
                    className="lifelink-nav-link"
                  >
                    Medications
                  </Nav.Link>
                </>
              )}

              {/* Patient-specific navigation */}
              {user?.role === 'Patient' && (
                <>
                  <Nav.Link
                    as={Link}
                    to="/appointments"
                    className="lifelink-nav-link"
                  >
                    Appointments
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/medications"
                    className="lifelink-nav-link"
                  >
                    Medications
                  </Nav.Link>
                </>
              )}

              {/* Mobile-only items */}
              <div className="d-lg-none lifelink-mobile-menu">
                {user && (
                  <>
                    <hr className="my-2" />
                    <Nav.Link
                      as={Link}
                      to="/profile"
                      className="lifelink-mobile-nav-link lifelink-mobile-nav-link-primary"
                    >
                      Welcome, {user.username}
                    </Nav.Link>
                    <Nav.Link
                      onClick={handleLogout}
                      className="lifelink-mobile-nav-link lifelink-mobile-nav-link-logout"
                    >
                      Log out
                    </Nav.Link>
                  </>
                )}
                {!user && (
                  <>
                    <hr className="my-2" />
                    <Nav.Link
                      as={Link}
                      to="/login"
                      className="lifelink-mobile-nav-link lifelink-mobile-nav-link-primary"
                    >
                      Login
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/register"
                      className="lifelink-mobile-nav-link lifelink-mobile-nav-link-primary"
                    >
                      Register
                    </Nav.Link>
                  </>
                )}
              </div>
            </Nav>

            {/* Right side content for desktop */}
            <div className="d-none d-lg-flex align-items-center gap-4 lifelink-desktop-right">
              {user ? (
                // Logged in state
                <>
                  {/* Search bar */}
                  <Form
                    onSubmit={handleSearch}
                    className="d-none d-md-block lifelink-search-form"
                  >
                    <InputGroup className="lifelink-search-group">
                      <Form.Control
                        type="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="lifelink-search-input"
                      />
                      <Button
                        variant="outline-secondary"
                        type="submit"
                        className="lifelink-search-button"
                        aria-label="Search"
                      >
                        ⌕
                      </Button>
                    </InputGroup>
                  </Form>

                  {/* Notifications */}
                  <Button
                    variant="outline-secondary"
                    onClick={handleNotificationClick}
                    className="position-relative lifelink-bell-btn"
                  >
                    <i className="bi bi-bell lifelink-bell-icon"></i>
                    {unreadCount > 0 && (
                      <Badge
                        bg="danger"
                        className="position-absolute top-0 start-100 translate-middle lifelink-bell-badge"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Welcome message - clickable */}
                  <Link
                    to="/profile"
                    className="text-decoration-none d-none d-lg-block lifelink-welcome-link"
                  >
                    <span className="text-muted lifelink-welcome-text">
                      Welcome,<br />{user.username}
                    </span>
                  </Link>

                  {/* Logout button */}
                  <Button
                    variant="outline-danger"
                    onClick={handleLogout}
                    className="lifelink-logout-btn"
                  >
                    Log out
                  </Button>
                </>
              ) : (
                // Not logged in state
                <>
                  <Link to="/login">
                    <Button
                      variant="outline-primary"
                      className="lifelink-auth-btn"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      variant="outline-primary"
                      className="lifelink-auth-btn"
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </Navbar.Collapse>
        </Navbar>
      </div>
    </div>
  );
};

export default NavMenu;
