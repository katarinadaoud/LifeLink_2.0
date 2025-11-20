import React from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import type { Medication } from '../types/medication';

interface MedicationGridProps {
  medications: Medication[];
  onDelete?: (medicationName: string) => void;
  onEdit?: (medicationName: string) => void;
  userRole?: string;
}

const MedicationGrid: React.FC<MedicationGridProps> = ({ medications, onDelete, onEdit, userRole }) => {

  return (
    <div>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {medications.map(medication => (
          <Col key={medication.medicationName}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title>{medication.medicationName}</Card.Title>
                <Card.Text>
                  <strong>Patient:</strong> {medication.patientName || `Patient ID: ${medication.patientId}`}
                </Card.Text>
                <Card.Text>
                  <strong>Indication:</strong> {medication.indication || 'N/A'}
                </Card.Text>
                <Card.Text>
                  <strong>Dosage:</strong> {medication.dosage || 'N/A'}
                </Card.Text>
                <Card.Text>
                  <strong>Start Date:</strong> {medication.startDate ? new Date(medication.startDate).toLocaleDateString() : 'N/A'}
                </Card.Text>
                <Card.Text>
                  <strong>End Date:</strong> {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : 'N/A'}
                </Card.Text>
                <div className="mt-auto d-flex justify-content-end gap-2">
                  {userRole === 'Employee' && (
                    <>
                      {onEdit && (
                        <Button onClick={() => onEdit(medication.medicationName)} className="btn btn-teal">Update</Button>
                      )}
                      {onDelete && (
                        <Button onClick={() => onDelete(medication.medicationName)} className="btn btn-delete">Delete</Button>
                      )}
                    </>
                  )}
                </div>               
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MedicationGrid;