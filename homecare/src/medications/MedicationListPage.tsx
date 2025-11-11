import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';
import * as MedicationService from './MedicationService';
import { MedicationTable } from './MedicationTable';
import MedicationGrid from './MedicationGrid';
import type { Medication } from '../types/medication';
import { useNavigate } from "react-router-dom";

type ViewMode = 'table' | 'grid';

const MedicationListPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchMedications = async () => {
    setLoading(true);
    setError(null);

    try {
      let data: Medication[];
      
      // If user is a Patient, only fetch their own medications
      if (user?.role === 'Patient') {
        const userId = user.sub || user.nameid;
        const patientData = await MedicationService.fetchPatientByUserId(userId);
        
        if (patientData?.patientId) {
          data = await MedicationService.getMedicationsByPatientId(patientData.patientId);
        } else {
          data = [];
          console.error('Patient ID not found for user');
        }
      } else {
        // If user is Employee or other role, fetch all medications
        data = await MedicationService.getAllMedications();
      }
      
      setMedications(data);
      console.log(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`There was a problem with the fetch operation: ${error.message}`);
      } else {
        console.error('Unknown error', error);
      }
      setError('Failed to fetch medications.');
    } finally {
      setLoading(false);
    }
  };

  // Set the view mode from local storage when the medications are fetched
  useEffect(() => {
    const savedViewMode = localStorage.getItem('medicationViewMode') as ViewMode;
    console.log('[fetch medications] Saved view mode:', savedViewMode);
    if (savedViewMode && ['table', 'grid'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }
    
    // Only fetch medications when user is available
    if (user) {
      fetchMedications();
    }
  }, [user]);

  // Save the view mode to local storage whenever it changes
  useEffect(() => {
    console.log('[save view state] Saving view mode:', viewMode);
    localStorage.setItem('medicationViewMode', viewMode);
  }, [viewMode]);

  const filteredMedications = medications.filter(medication =>
    medication.medicationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medication.indication?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medication.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medication.dosage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMedicationDeleted = async (medicationName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the medication ${medicationName}?`);
    if (confirmDelete) {
      try {
        await MedicationService.deleteMedication(medicationName);
        setMedications(prevMedications => prevMedications.filter(medication => medication.medicationName !== medicationName));
        console.log('Medication deleted:', medicationName);
      } catch (error) {
        console.error('Error deleting medication:', error);
        setError('Failed to delete medication.');
      }
    }
  };

  const handleEdit = (name: string) => navigate(`/medications/${name}/edit`);

  return (
    <div className="container-fluid">
      <div className="text-center mb-3">
        <h1 className="fw-bold text-primary" style={{ fontSize: '2.5rem' }}>My Medications</h1>
        <p className="mb-2" style={{ fontSize: '1.1rem' }}>View and manage your medications</p>
      </div>
      <div className="mb-3">
        <Button 
          onClick={fetchMedications} 
          className="btn btn-primary me-3" 
          disabled={loading}
          style={{ fontSize: '1rem', padding: '8px 16px' }}
        >
          {loading ? 'Loading...' : 'Refresh Medications'}
        </Button>
        
        {/* View Mode Buttons */}
        <div className="btn-group" role="group" aria-label="View mode selection">
          <Button 
            variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('table')}
            title="List view with detailed information"
            style={{ fontSize: '1rem', padding: '8px 16px' }}
          >
             List View
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('grid')}
            title="Card view with medication details"
            style={{ fontSize: '1rem', padding: '8px 16px' }}
          >
             Card View
          </Button>
        </div>
      </div>
      
      {/* Search field */}
      <Form.Group className="mb-3">
        <Form.Label style={{ fontSize: '1rem', fontWeight: 'bold' }}>
          Search Medications:
        </Form.Label>
        <Form.Control
          type="text"
          placeholder="Search by medication name, indication, patient name, or dosage..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ fontSize: '1rem' }}
        />
      </Form.Group>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* Render appropriate view based on viewMode */}
      {viewMode === 'table' && (
        <MedicationTable 
          rows={filteredMedications} 
          onDelete={user ? handleMedicationDeleted : undefined}
          onEdit={user?.role === "Employee" ? handleEdit : undefined}
          userRole={user?.role}
        />
      )}
      
      {viewMode === 'grid' && (
        <MedicationGrid 
          medications={filteredMedications} 
          onDelete={user ? handleMedicationDeleted : undefined}
          onEdit={user?.role === "Employee" ? handleEdit : undefined}
          userRole={user?.role}
        />
      )}
      
      {user && user.role === "Employee" && (
        <div className="mt-3 text-center">
          <Button 
            onClick={() => navigate("/medications/new")}
            className="btn btn-success"
            style={{ fontSize: '1.1rem', padding: '10px 20px' }}
          >
             Add New Medication
          </Button>
        </div>
      )}
    </div>
  );
};

export default MedicationListPage;
