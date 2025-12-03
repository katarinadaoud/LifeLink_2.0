import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';
import './EmergencyContactButton.css';

const EMERGENCY_PHONE_DISPLAY = '+47 12 34 56 78';  //LifeLink number
const EMERGENCY_PHONE_TEL = 'tel:+4712345678';     

const EmergencyContactButton: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // only patients can see button
  if (!user || user.role !== 'Patient') {
    return null;
  }

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMERGENCY_PHONE_DISPLAY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy phone number', err);
    }
  };

  // if Teams cannot initiate the call it will open the Teams web/app.
  const TEAMS_CALL_URL = `https://teams.microsoft.com/l/call/0/0?users=${encodeURIComponent(
    EMERGENCY_PHONE_DISPLAY
  )}`;

  return (
    <>
      {/* Floating button at bottom right */}
      <Button
        type="button"
        className="lifelink-emergency-btn"
        onClick={handleOpen}
        aria-label="Contact home care"
      > {/* Icon and label */}
        <span className="lifelink-emergency-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
            <path fill="currentColor" d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1v3.5a1 1 0 01-1 1C7.61 21 3 16.39 3 9.62a1 1 0 011-1H7.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57.14.45.03.94-.24 1.02l-2.2 2.2z" />
          </svg>
        </span> 
        {/* Label hidden on small screens */}
        <span className="lifelink-emergency-label d-none d-sm-inline">
          Home care
        </span>
      </Button>

      {/* Modal for emergency contact */}
      <Modal
        show={showModal}
        onHide={handleClose}
        centered
        aria-labelledby="lifelink-emergency-modal-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="lifelink-emergency-modal-title">
            Contact home care
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-2">
            Use this if you need urgent help related to your home care,
            but it is <strong>not</strong> a life-threatening emergency.
          </p>
          <p className="mb-3">
            If you have a medical emergency, call <strong>113</strong>.
          </p>
          <p className="mb-0">
            Do you want to call home care now?
          </p>
        </Modal.Body>

        {/* Modal footer with action buttons */}
        <Modal.Footer className="justify-content-between">
          <div>
            <Button variant="outline-secondary" href={TEAMS_CALL_URL} target="_blank" rel="noreferrer" className="me-2">
              Open in Teams
            </Button>
            <Button variant="outline-secondary" onClick={handleCopy} className="me-2">
              {copied ? 'Copied' : 'Copy number'}
            </Button>
            <Button variant="outline-secondary" onClick={handleClose}>
              Cancel
            </Button>
          </div>

          <Button
            variant="primary"
            className="lifelink-emergency-call-btn"
            href={EMERGENCY_PHONE_TEL}
          >
            Call {EMERGENCY_PHONE_DISPLAY}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EmergencyContactButton;
