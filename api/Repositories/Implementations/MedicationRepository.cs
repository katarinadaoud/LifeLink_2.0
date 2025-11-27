using HomeCareApp.Data;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HomeCareApp.Repositories.Implementations
{
    public class MedicationRepository : IMedicationRepository
    {
        private readonly AppDbContext _db;
        private readonly ILogger<MedicationRepository> _logger;

        public MedicationRepository(AppDbContext db, ILogger<MedicationRepository> logger)
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

                var today = DateOnly.FromDateTime(DateTime.Today);
                query = query.Where(m => m.EndDate == null || m.EndDate >= today);

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

        // Get a single medication by its name
        public async Task<Medication?> GetByNameAsync(string medicineName) // get medication by medicine name
        {
            try
            {
                _logger.LogInformation("[MedicationRepository] GetByNameAsync({MedicineName}) - Retrieving medication", medicineName);
                var medication = await _db.Medications
                    .Include(m => m.Patient)
                    .FirstOrDefaultAsync(m => m.MedicineName == medicineName);
                if (medication != null)
                {
                    _logger.LogInformation("[MedicationRepository] GetByNameAsync({MedicineName}) - Medication found for patient: {PatientName}", medicineName, medication.Patient?.FullName ?? "Unknown");
                }
                else
                {
                    _logger.LogWarning("[MedicationRepository] GetByNameAsync({MedicineName}) - Medication not found", medicineName);
                }
                return medication;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationRepository] GetByNameAsync({MedicineName}) failed: {Message}", medicineName, ex.Message);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationRepository] AddAsync() failed for medication: {MedicineName} - {Message}", med.MedicineName, ex.Message);
                throw;
            }
        }

        // Delete a medication
        public async Task DeleteAsync(Medication med) // delete medication from database
        {
            try
            {
                _logger.LogInformation("[MedicationRepository] DeleteAsync() - Deleting medication: {MedicineName} for PatientId: {PatientId}", med.MedicineName, med.PatientId);
                _db.Medications.Remove(med);
                await _db.SaveChangesAsync();
                _logger.LogInformation("[MedicationRepository] DeleteAsync() - Successfully deleted medication: {MedicineName} for PatientId: {PatientId}", med.MedicineName, med.PatientId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationRepository] DeleteAsync() failed for medication: {MedicineName} - {Message}", med.MedicineName, ex.Message);
                throw;
            }
        }
    }
}
