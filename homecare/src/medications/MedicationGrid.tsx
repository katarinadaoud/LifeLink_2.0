import React from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import type { Medication } from '../types/medication';
import "./Medication.css";


// Props for MedicationGrid component
interface MedicationGridProps { 
  medications: Medication[]; // medications to display, mandatory
  
  // optional handlers for delete and edit 
  onDelete?: (medicationName: string) => void;
  onEdit?: (medicationName: string) => void;
  userRole?: string;
}

const MedicationGrid: React.FC<MedicationGridProps> = ({ medications, onDelete, onEdit, userRole }) => {

  return ( //wrapper for grid layout
    <div>

      {/* bootstrap adjust number of cards based on screensize*/}
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">

        {/*render one card for each medication*/}
        {medications.map(medication => (
          <Col key={medication.medicationName}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column"> {/* vertical layout inside the card*/}

                <Card.Title>{medication.medicationName}</Card.Title>

                {/*medication information */}
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

                {/*update/delete buttons aligned at the bottom */}
                <div className="mt-auto d-flex justify-content-end gap-2">

                  {/*only employees can delete/update */}
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