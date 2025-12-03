using HomeCareApp.Data;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HomeCareApp.Repositories.Implementations
{
    public class MedicationRepository : IMedicationRepository // Repository for CRUD operations on medication entities
    {
        private readonly AppDbContext _db; // EF Core DbContext (injected via DI)
        private readonly ILogger<MedicationRepository> _logger; // Logger for logging information and errors

        public MedicationRepository(AppDbContext db, ILogger<MedicationRepository> logger) // constructor with dependency injection
        {
            _db = db;
            _logger = logger;
        }

        //Get all medications 
        public async Task<List<Medication>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("[MedicationRepository] GetAllAsync() - Retrieving all medications");
                var query = _db.Medications.Include(m => m.Patient).AsQueryable();
                var medications = await query.OrderByDescending(m => m.StartDate).ToListAsync();
                _logger.LogInformation("[MedicationRepository] GetAllAsync() - Successfully retrieved {Count} medications", medications.Count);
                return medications;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationRepository] GetAllAsync() failed: {Message}", ex.Message);
                throw;
            }
        }

        
        // Get medications by patient id
        public async Task<List<Medication>> GetByPatientAsync(int patientId) // get medications for a specific patient which are active 
        {
            try
            {
                _logger.LogInformation("[MedicationRepository] GetByPatientAsync({PatientId}) - Retrieving medications for patient", patientId);
                var query = _db.Medications
                    .Include(m => m.Patient)
                    .Where(m => m.PatientId == patientId);

                // Filter to only active medications (EndDate is null or in the future)
                var today = DateOnly.FromDateTime(DateTime.Today);
                query = query.Where(m => m.EndDate == null || m.EndDate >= today); 

                // Order by StartDate descending
                var medications = await query.OrderByDescending(m => m.StartDate).ToListAsync();
                _logger.LogInformation("[MedicationRepository] GetByPatientAsync({PatientId}) - Successfully retrieved {Count} active medications", patientId, medications.Count);
                return medications;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationRepository] GetByPatientAsync({PatientId}) failed: {Message}", patientId, ex.Message);
                throw;
            }
        }

        // Get a single medication by its ID
        public async Task<Medication?> GetByIdAsync(int medicationId) 
        {

            // try-catch block for error handling
            try
            {
                
                _logger.LogInformation("[MedicationRepository] GetByIdAsync({MedicationId}) - Retrieving medication", medicationId);
                var medication = await _db.Medications
                    .Include(m => m.Patient)
                    .FirstOrDefaultAsync(m => m.MedicationId == medicationId);
                if (medication != null) // medication found
                {
                    _logger.LogInformation("[MedicationRepository] GetByIdAsync({MedicationId}) - Medication found for patient: {PatientName}", medicationId, medication.Patient?.FullName ?? "Unknown");
                }
                else // medication not found
                {
                    _logger.LogWarning("[MedicationRepository] GetByIdAsync({MedicationId}) - Medication not found", medicationId);
                }
                return medication;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationRepository] GetByIdAsync({MedicationId}) failed: {Message}", medicationId, ex.Message);
                throw;
            }
        }

        // Add a new medication
        public async Task<Medication> AddAsync(Medication med) // add new medication to database
        {
            try
            {
                _logger.LogInformation("[MedicationRepository] AddAsync() - Adding medication: {MedicineName} for PatientId: {PatientId}", med.MedicineName, med.PatientId);
                _db.Medications.Add(med);
                await _db.SaveChangesAsync();
                _logger.LogInformation("[MedicationRepository] AddAsync() - Successfully added medication: {MedicineName} for PatientId: {PatientId}", med.MedicineName, med.PatientId);
                return med;
            }
            catch (Exception ex) // catch block for error handling
            {
                _logger.LogError(ex, "[MedicationRepository] AddAsync() failed for medication: {MedicineName} - {Message}", med.MedicineName, ex.Message);
                throw;
            }
        }

        // Delete a medication
        public async Task DeleteAsync(Medication med) 
        {
            try // try to delete medication
            {
                _logger.LogInformation("[MedicationRepository] DeleteAsync() - Deleting medication: {MedicineName} for PatientId: {PatientId}", med.MedicineName, med.PatientId);
                _db.Medications.Remove(med);
                await _db.SaveChangesAsync();
                _logger.LogInformation("[MedicationRepository] DeleteAsync() - Successfully deleted medication: {MedicineName} for PatientId: {PatientId}", med.MedicineName, med.PatientId);
            }
            catch (Exception ex) // catch block for error handling
            {
                _logger.LogError(ex, "[MedicationRepository] DeleteAsync() failed for medication: {MedicineName} - {Message}", med.MedicineName, ex.Message);
                throw;
            }
        }
    }
}
