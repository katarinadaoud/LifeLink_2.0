import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HomePage.css';

const HomePage: React.FC = () => {

  //navigation properties
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
    <div className="text-center bg-white homepage-container">
      <h1 className="fw-bold mb-3 homepage-title">
        Welcome to LifeLink
      </h1>

      <p className="homepage-description">
        At LifeLink, you can easily book appointments for the support you need — whether it’s
        assistance with daily living, medication reminders, shopping, or household chores.
        We’re here to make life at home easier, safer, and more comfortable.
      </p>

      
      {/*main features section */}
      <Container className="px-4 homepage-main-section">
        <div className="text-center mb-4">
          <h2 className="fw-semibold mb-3 homepage-section-title">
            What do you want to do?
          </h2>
        </div>

        <Row className="justify-content-center g-4">
          <Col md={4} sm={6} className="d-flex justify-content-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAppointmentsClick}
              className="d-flex justify-content-center align-items-center w-100 homepage-action-button"
            >
              <span className="homepage-button-text">
                Book Appointment
              </span>
            </Button>
          </Col>

          <Col md={4} sm={6} className="d-flex justify-content-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleMedicationsClick}
              className="d-flex justify-content-center align-items-center w-100 homepage-action-button"
            >
              <span className="homepage-button-text">
                Manage Medications
              </span>
            </Button>
          </Col>

          <Col md={4} sm={6} className="d-flex justify-content-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleInboxClick}
              className="d-flex justify-content-center align-items-center w-100 homepage-action-button"
            >
              <span className="homepage-button-text">
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
