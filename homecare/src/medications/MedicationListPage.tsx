import React, { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import * as MedicationService from "./MedicationService";
import { MedicationTable } from "./MedicationTable";
import type { Medication } from "../types/medication";

const MedicationListPage: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Medication[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

useEffect(() => {
  if (!token) return;  
  const load = async () => {
    try {
      const data =
        user?.role === "Employee"
          ? await MedicationService.getAllMedications(token)
          : await MedicationService.getMyMedications(token);
      setRows(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  load();
}, [token, user]);


  const handleEdit = (name: string) => navigate(`/medications/${name}/edit`);
  const handleDelete = (name: string) => navigate(`/medications/${name}/delete`);

  const filteredRows = rows.filter((m) =>
    m.medicineName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      {/* Header + buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Medications</h2>

        {user?.role === "Employee" && (
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={() => navigate("/medications/new")}>
               Add medicine
            </Button>
            <Button variant="primary" onClick={() => navigate("/medications/update")}>
              Update medicine
            </Button>
            <Button variant="primary" onClick={() => navigate("/medications/delete")}>
              Delete medicine
            </Button>
          </div>
        )}
      </div>

      {/* Search bar */}
      <Form.Control
        type="text"
        placeholder="Search medication, patient..."
        className="mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Content */}
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading medications...</p>
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <MedicationTable
          rows={filteredRows}
          userRole={user?.role}
          onEdit={user?.role === "Employee" ? handleEdit : undefined}
          onDelete={user?.role === "Employee" ? handleDelete : undefined}
        />
      )}
    </div>
    
  );

  
};

export default MedicationListPage;
