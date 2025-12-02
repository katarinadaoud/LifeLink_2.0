using Microsoft.EntityFrameworkCore;
using HomeCareApp.Models;
using HomeCareApp.Data;
using HomeCareApp.Repositories.Interfaces;
using Microsoft.Extensions.Logging;

namespace HomeCareApp.Repositories.Implementations;
public class PatientRepository : IPatientRepository


{
    private readonly AppDbContext _db; // EF Core DbContext (injected via DI)
    private readonly ILogger<PatientRepository> _logger; // Logger for logging information and errors


    public PatientRepository(AppDbContext db, ILogger<PatientRepository> logger) // constructor with dependency injection
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IEnumerable<Patient>> GetAll() //gets all patients
    {
        try // try-catch block for error handling
        {
            _logger.LogInformation("[PatientRepository] GetAll() - Retrieving all patients");
            var patients = await _db.Patients.AsNoTracking().ToListAsync();
            _logger.LogInformation("[PatientRepository] GetAll() - Successfully retrieved {Count} patients", patients.Count());
            return patients;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PatientRepository] GetAll() failed: {Message}", ex.Message);
            throw;
        }
    }

    public async Task<Patient?> GetPatientById(int id) // get patient by id
    {
        try
        {
            _logger.LogInformation("[PatientRepository] GetPatientById({Id}) - Retrieving patient", id);
            var patient = await _db.Patients.FindAsync(id); // fetch patient by id
            if (patient != null) // if patient is found
            {
                _logger.LogInformation("[PatientRepository] GetPatientById({Id}) - Patient found: {PatientName}", id, patient.FullName); // log patient name
            }
            else // if patient is not found
            {
                _logger.LogWarning("[PatientRepository] GetPatientById({Id}) - Patient not found", id); // log warning
            }
            return patient;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PatientRepository] GetPatientById({Id}) failed: {Message}", id, ex.Message);
            throw;
        }
    }

    public async Task Create(Patient patient) // create new patient
    {
        try // try-catch block for error handling. if patient creation fails, log the error
        {
            _logger.LogInformation("[PatientRepository] Create() - Creating patient: {PatientName}", patient.FullName);
            _db.Patients.Add(patient);
            await _db.SaveChangesAsync();
            _logger.LogInformation("[PatientRepository] Create() - Successfully created patient: {PatientName} with ID: {PatientId}", patient.FullName, patient.PatientId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PatientRepository] Create() failed for patient: {PatientName} - {Message}", patient.FullName, ex.Message);
            throw;
        }
    }

    public async Task Update(Patient patient) // update existing patient
    {
        try
        {
            _logger.LogInformation("[PatientRepository] Update() - Updating patient: {PatientName} (ID: {PatientId})", patient.FullName, patient.PatientId);
            _db.Patients.Update(patient);
            await _db.SaveChangesAsync();
            _logger.LogInformation("[PatientRepository] Update() - Successfully updated patient: {PatientName} (ID: {PatientId})", patient.FullName, patient.PatientId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PatientRepository] Update() failed for patient: {PatientName} (ID: {PatientId}) - {Message}", patient.FullName, patient.PatientId, ex.Message);
            throw;
        }
    }

    public async Task<bool> Delete(int id) // delete patient by id
    {
        try
        { 
            // try-catch block for error handling. if deletion fails, log the error
            _logger.LogInformation("[PatientRepository] Delete({Id}) - Attempting to delete patient", id);
            var patient = await _db.Patients.FindAsync(id);
            if (patient == null)
            {
                _logger.LogWarning("[PatientRepository] Delete({Id}) - Patient not found", id);
                return false;
            }

            _logger.LogInformation("[PatientRepository] Delete({Id}) - Deleting patient: {PatientName}", id, patient.FullName);
            _db.Patients.Remove(patient);
            await _db.SaveChangesAsync();
            _logger.LogInformation("[PatientRepository] Delete({Id}) - Successfully deleted patient: {PatientName}", id, patient.FullName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PatientRepository] Delete({Id}) failed: {Message}", id, ex.Message);
            throw;
        }
    }
    }