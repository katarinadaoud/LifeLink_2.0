import React, { useMemo, useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import "./Medication.css";


type Scope = 'patient' | 'employee';

export type MedicationFormValues = {
  medicationId?: number;
  patientId?: number | '';
  medicationName: string;
  indication: string;
  dosage: string;
  startDate: string;
  endDate: string;
};

//Medication form component for creating or editing medication records
export default function MedicationForm({
  scope = 'employee',
  initial,
  onSubmit,
  onCancel,
  submitText, 
}: { 
  scope?: Scope; 
  initial?: Partial<MedicationFormValues>;
  onSubmit: (payload: Omit<MedicationFormValues, 'endDate'> & { endDate: string | null }) => Promise<void> | void;
  onCancel?: () => void;
  submitText?: string;
}) {

  // Initialize form values based on initial prop or empty defaults
  const init: MedicationFormValues = useMemo(() => ({
    patientId: initial?.patientId ?? '',
    medicationName: initial?.medicationName ?? '',
    indication: initial?.indication ?? '',
    dosage: initial?.dosage ?? '',
    startDate: (initial?.startDate ?? '').slice(0, 10),
    endDate: (initial?.endDate ?? '').slice(0, 10),
  }), [initial]);

  // Form state management, contains current values, errors, and submission state
  const [values, setValues] = useState<MedicationFormValues>(init);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // setter for all form fields with real-time validation
  function set<K extends keyof MedicationFormValues>(key: K, v: MedicationFormValues[K]) {
    const newValues = { ...values, [key]: v };
    setValues(newValues);
    
    // Real-time validation
    const newErrors = { ...errors };
    
    // Validate the changed field
    if (key === 'medicationName') {
      if (!(v as string).trim()) {
        newErrors.medicationName = 'Medication name is required';
      } else {
        delete newErrors.medicationName;
      }
    }
    
    if (key === 'dosage') {
      if (!(v as string).trim()) {
        newErrors.dosage = 'Dosage is required';
      } else {
        delete newErrors.dosage;
      }
    }
    
    if (key === 'startDate') {
      if (!(v as string)) {
        newErrors.startDate = 'Start date is required';
      } else {
        delete newErrors.startDate;
        // Also revalidate end date when start date changes
        if (newValues.endDate && newValues.endDate < (v as string)) {
          newErrors.endDate = 'End date cannot be before start date';
        } else {
          delete newErrors.endDate;
        }
      }
    }
    
    if (key === 'endDate') {
      if ((v as string) && newValues.startDate && (v as string) < newValues.startDate) {
        newErrors.endDate = 'End date cannot be before start date';
      } else {
        delete newErrors.endDate;
      }
    }
    
    if (key === 'patientId') {
      if (scope === 'employee' && ((v as number | string) === '' || (v as number | string) === undefined || (v as number | string) === 0)) {
        newErrors.patientId = 'Patient ID is required';
      } else {
        delete newErrors.patientId;
      }
    }
    
    setErrors(newErrors);
  }

  // validate form values and return errors
  function validate(v: MedicationFormValues) {
    const e: Record<string, string> = {};
    if (scope === 'employee' && (v.patientId === '' || v.patientId === undefined || v.patientId === 0)) e.patientId = 'Patient ID is required';
    if (!v.medicationName.trim()) e.medicationName = 'Medication name is required';
    if (!v.dosage.trim()) e.dosage = 'Dosage is required';
    if (!v.startDate) e.startDate = 'Start date is required';
    if (v.endDate && v.startDate && v.endDate < v.startDate) e.endDate = 'End date cannot be before start date';
    return e;
  }

  // handle form submission, stops default, and calls onSubmit prop
  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    const e = validate(values);
    setErrors(e);
    if (Object.keys(e).length) return;

    // prepare payload for submission, sends to backend
    const payload = {
      ...(values.medicationId ? { medicationId: values.medicationId } : {}),
      ...(scope === 'employee' // if employee, include patientId
        ? { patientId: typeof values.patientId === 'string' ? Number(values.patientId) : values.patientId }
        : {}),
      medicationName: values.medicationName.trim(),
      indication: values.indication.trim(),
      dosage: values.dosage.trim(),
      startDate: values.startDate,
      endDate: values.endDate || null, // backend: DateOnly? -> null if empty = active
    };

    // submit the form
    try {
      setSubmitting(true);
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    //main form for creating/updating medication

    <Form onSubmit={handleSubmit} noValidate>

      {/* Patient ID field only for employees */}
      {scope === 'employee' && (
        <Form.Group className="mb-3" controlId="patientId">
          <Form.Label>Patient ID</Form.Label>
          <Form.Control
            type="number"
            value={values.patientId === '' ? '' : values.patientId}
            onChange={e => set('patientId', e.target.value === '' ? '' : Number(e.target.value))}
            isInvalid={!!errors.patientId}
            min={1}
            placeholder="Skriv pasient-ID"
          />
          {/* Validation error message */}
          <Form.Control.Feedback type="invalid">{errors.patientId}</Form.Control.Feedback>
        </Form.Group>
      )}

      {/* Medication Name and Dosage fields side by side */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="medicationName">
            <Form.Label>Medication name</Form.Label>
            <Form.Control
              value={values.medicationName}
              onChange={e => set('medicationName', e.target.value)}
              isInvalid={!!errors.medicationName}
              placeholder="f.eks. Paracetamol"
            />
            {/* Validation error message */}
            <Form.Control.Feedback type="invalid">{errors.medicationName}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}> {/* Dosage field */}
          <Form.Group className="mb-3" controlId="dosage">
            <Form.Label>Dosage</Form.Label>
            <Form.Control
              value={values.dosage}
              onChange={e => set('dosage', e.target.value)}
              isInvalid={!!errors.dosage}
              placeholder="f.eks. 500 mg"
            />
            <Form.Control.Feedback type="invalid">{errors.dosage}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Indication field (optional)*/}
      <Form.Group className="mb-3" controlId="indication">
        <Form.Label>Indication (valgfritt)</Form.Label>
        <Form.Control
          value={values.indication}
          onChange={e => set('indication', e.target.value)}
          placeholder="f.eks. feber, smerter"
        />
      </Form.Group>

      {/* Start and End Date fields side by side */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="startDate">
            <Form.Label>Start date</Form.Label>
            <Form.Control
              type="date"
              value={values.startDate}
              onChange={e => set('startDate', e.target.value)}
              isInvalid={!!errors.startDate}
            />
            {/* Validation error message */}
            <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
        {/* End Date field (optional) */}
          <Form.Group className="mb-3" controlId="endDate">
            <Form.Label>End date (valgfritt)</Form.Label>
            <Form.Control
              type="date"
              value={values.endDate}
              onChange={e => set('endDate', e.target.value)}
              isInvalid={!!errors.endDate}
            />
            <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      {/* Submit and Cancel buttons */}
      <div className="d-flex gap-2">
        <Button className="btn btn-teal" type="submit" disabled={submitting}>
          {submitting ? 'Lagrer…' : (submitText ?? 'Save')}
        </Button>
        {onCancel && (
          <Button className="btn btn-delete" type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
      </div>
    </Form>
  );
}
