import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';
import * as MedicationService from './MedicationService';
import { MedicationTable } from './MedicationTable';
import MedicationGrid from './MedicationGrid';
import type { Medication } from '../types/medication';
import { useNavigate } from "react-router-dom";
import "./Medication.css";


type ViewMode = 'table' | 'grid';


const MedicationListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for medications, loading, error, view mode, and search query
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchMedications = useCallback(async () => { // fetch medications from API
    // Reset state
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
  }, [user]);

  // Set the view mode from local storage when the medications are fetched
  useEffect(() => {
    const savedViewMode = localStorage.getItem('medicationViewMode') as ViewMode;
    if (savedViewMode && ['table', 'grid'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }
    
    // Only fetch medications when user is available
    if (user) {
      fetchMedications();
    }
  }, [user, fetchMedications]);

  // Save the view mode to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('medicationViewMode', viewMode);
  }, [viewMode]);

  // Filter medications based on search query (lowercase = case insensitive)
  const filteredMedications = useMemo(() =>
    medications.filter(medication =>
      medication.medicationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.indication?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.dosage?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [medications, searchQuery]
  );

    // Handle medication deletion
  const handleMedicationDeleted = async (medicationId: number, medicationName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the medication ${medicationName}?`);
    if (confirmDelete) {
      try {
        await MedicationService.deleteMedication(medicationId);
        setMedications(prevMedications => prevMedications.filter(medication => medication.medicationId !== medicationId));
      } catch (error) {
        console.error('Error deleting medication:', error);
        setError('Failed to delete medication.');
      }
    }
  };
  // navigate to edit page.
  const handleEdit = (id: number) => navigate(`/medications/${id}/edit`);

  return ( 
    <div className="container-fluid">
      <div className="medication-page-header text-center mb-3"> {/* Centered title and subtitle */}
        <h1 className="page-title text-teal mb-2">My Medications</h1>

        {/*short description under the title */}
        <p className="mb-2 text-medium">View and manage your medications</p>
      </div>
      <div className="medication-toolbar mb-3">
        {/* Refresh Button, reloads medication list from backend */}
        <Button 
          onClick={fetchMedications} 
          className="btn btn-teal me-3" 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Medications'}
        </Button>
        
        {/* View Mode Buttons */}
        <Button 
          className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => setViewMode('table')}
          title="List view with detailed information"
        >
          List View
        </Button>
        
        <Button 
          className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
          title="Card view with medication details"
        >
          Card View
        </Button>
      </div>
      
      {/* Search field */}
      <Form.Group className="mb-3">
        <Form.Label className="label-strong">
          Search Medications:
        </Form.Label>
        <Form.Control
          className="text-medium"
          type="text"
          placeholder="Search by medication name, indication, patient name, or dosage..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          
        />
      </Form.Group>
      
      {/* Show error message if any */}
      {error && <p className="error-red">{error}</p>}
      
      {/* show table or grid depending on viewMode */}
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
      
      {/*only employees can add new medications */}
      {user && user.role === "Employee" && (
        <div className="mt-3 text-center">
          <Button 
            className="btn btn-teal"
            onClick={() => navigate("/medications/new")}
            
          >
             Add New Medication
          </Button>
        </div>
      )}
    </div>
  );
};

export default MedicationListPage;
