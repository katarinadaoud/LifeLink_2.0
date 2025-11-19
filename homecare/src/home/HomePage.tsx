import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleAppointmentsClick = () => {
    navigate('/appointments');
  };

  const handleMedicationsClick = () => {
    navigate('/medications');
  };

  const handleInboxClick = () => {
    navigate('/notifications');
  };

  return (
    <div
      className="text-center bg-white"
      style={{
        paddingTop: '2.5rem',   // var py-5 ≈ 3rem
        paddingBottom: '2.75rem'
      }}
    >
      <h1
        className="fw-bold mb-3"
        style={{
          color: '#111827',
          fontSize: '2.25rem',   // litt ned fra 2.5rem
          letterSpacing: '0.04em'
        }}
      >
        Welcome to LifeLink
      </h1>

      <p
        style={{
          maxWidth: '60ch',      // heller tegnbredde enn px
          margin: '0 auto 1.75rem auto',
          color: '#374151',
          fontSize: '1.1rem',    // litt ned fra 1.3rem
          lineHeight: '1.7',
          padding: '0 1rem'
        }}
      >
        At LifeLink, you can easily book appointments for the support you need — whether it’s
        assistance with daily living, medication reminders, shopping, or household chores.
        We’re here to make life at home easier, safer, and more comfortable.
      </p>

      {/* Hovedfunksjoner seksjon */}
      <Container
        className="px-4"
        style={{
          paddingTop: '1.5rem',   // var py-5
          paddingBottom: '2.5rem'
        }}
      >
        <div className="text-center mb-4">
          <h2
            className="fw-semibold mb-3"
            style={{
              color: '#111827',
              fontSize: '1.7rem'   // tydelig mindre enn H1
            }}
          >
            What do you want to do?
          </h2>
        </div>

        <Row className="justify-content-center g-4">
          <Col md={4} sm={6} className="d-flex justify-content-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAppointmentsClick}
              className="d-flex justify-content-center align-items-center w-100"
              style={{
                backgroundColor: '#177e8b',
                borderColor: '#177e8b',
                borderRadius: '12px',
                height: '130px',        // litt lavere
                maxWidth: '340px',
                minWidth: '260px',
                padding: '1.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#177e8b';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#177e8b';
                e.currentTarget.style.color = 'white';
              }}
            >
              <span style={{ fontSize: '1.3rem', fontWeight: 600, textAlign: 'center' }}>
                Book Appointment
              </span>
            </Button>
          </Col>

          <Col md={4} sm={6} className="d-flex justify-content-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleMedicationsClick}
              className="d-flex justify-content-center align-items-center w-100"
              style={{
                backgroundColor: '#177e8b',
                borderColor: '#177e8b',
                borderRadius: '12px',
                height: '130px',
                maxWidth: '340px',
                minWidth: '260px',
                padding: '1.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#177e8b';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#177e8b';
                e.currentTarget.style.color = 'white';
              }}
            >
              <span style={{ fontSize: '1.3rem', fontWeight: 600, textAlign: 'center' }}>
                Manage Medications
              </span>
            </Button>
          </Col>

          <Col md={4} sm={6} className="d-flex justify-content-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleInboxClick}
              className="d-flex justify-content-center align-items-center w-100"
              style={{
                backgroundColor: '#177e8b',
                borderColor: '#177e8b',
                borderRadius: '12px',
                height: '130px',
                maxWidth: '340px',
                minWidth: '260px',
                padding: '1.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#177e8b';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#177e8b';
                e.currentTarget.style.color = 'white';
              }}
            >
              <span style={{ fontSize: '1.3rem', fontWeight: 600, textAlign: 'center' }}>
                Messages
              </span>
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
