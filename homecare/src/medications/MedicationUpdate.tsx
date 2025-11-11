// src/medications/MedicationUpdatePage.tsx
import React, { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import * as MedicationService from "./MedicationService";
import type { Medication } from "../types/medication";

const MedicationUpdatePage: React.FC = () => {
  const { name } = useParams(); // route: /medications/:name/edit
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<Partial<Medication>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restrict access to Employee
  useEffect(() => {
    if (user?.role !== "Employee") {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  // Fetch medication details by name
  useEffect(() => {
    const load = async () => {
      try {
        // ✅ bruker riktig funksjon fra MedicationService
        const data = await MedicationService.getMedication(
          name ?? "",
          token ?? ""
        );
        setForm(data);
      } catch (e: any) {
        setError(e.message ?? "Failed to load medication.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [name, token]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.medicineName) {
      alert("Medication name is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // ✅ sender riktig parametre til updateMedication
      await MedicationService.updateMedication(
        form.medicineName,
        form as Medication,
        token ?? ""
      );
      navigate("/medications");
    } catch (e: any) {
      setError(e.message ?? "Failed to update medication.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading medication details...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <h2 className="fw-bold text-primary mb-3">Update Medication</h2>
      <p className="text-muted mb-4">
        Edit the medication details below and click Save Changes.
      </p>

      {error && (
        <p className="text-danger fw-semibold" style={{ marginTop: "-5px" }}>
          {error}
        </p>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Medication Name</Form.Label>
          <Form.Control
            type="text"
            name="medicineName"
            value={form.medicineName ?? ""}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Indication</Form.Label>
          <Form.Control
            type="text"
            name="indication"
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Dosage</Form.Label>
          <Form.Control
            type="text"
            name="dosage"
            value={form.dosage ?? ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Frequency</Form.Label>
          <Form.Control
            type="text"
            name="frequency"
            value={form.frequency ?? ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            name="startDate"
            value={form.startDate ?? ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            name="endDate"
            value={form.endDate ?? ""}
            onChange={handleChange}
          />
        </Form.Group>

        <div className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/medications")}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default MedicationUpdatePage;
