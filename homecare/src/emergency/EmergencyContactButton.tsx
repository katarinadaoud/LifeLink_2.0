import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';
import './EmergencyContactButton.css';

const EMERGENCY_PHONE_DISPLAY = '+47 12 34 56 78';  // bytt til ditt nr i demo
const EMERGENCY_PHONE_TEL = 'tel:+4712345678';      // samme nr uten mellomrom

const EmergencyContactButton: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Kun pasienter skal se knappen
  if (!user || user.role !== 'Patient') {
    return null;
  }

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  // Use a plain link on the call button (Button with `href`) so the
  // browser/OS handles dialing natively. This is better for accessibility
  // and for apps that intercept `tel:` links. Also provide copy/Teams
  // options for desktop users who may prefer Teams or copying the number.

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMERGENCY_PHONE_DISPLAY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy phone number', err);
    }
  };

  // Generic Teams call link — Teams usually prefers an email, but some
  // clients accept phone number in the users param. This is best-effort;
  // if Teams cannot initiate the call it will open the Teams web/app.
  const TEAMS_CALL_URL = `https://teams.microsoft.com/l/call/0/0?users=${encodeURIComponent(
    EMERGENCY_PHONE_DISPLAY
  )}`;

  return (
    <>
      {/* Flytende knapp nederst til høyre */}
      <Button
        type="button"
        className="lifelink-emergency-btn"
        onClick={handleOpen}
        aria-label="Contact home care"
      >
        <span className="lifelink-emergency-icon">☏</span>
        <span className="lifelink-emergency-label d-none d-sm-inline">
          Home care
        </span>
      </Button>

      {/* Modal med bekreftelse */}
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
