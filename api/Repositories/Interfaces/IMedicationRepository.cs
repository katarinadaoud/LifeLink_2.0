using HomeCareApp.Models;

/*This interface defines the core operations for managing Medication entities.
It includes methods for retrieving all medications, getting medications for a specific patient,
finding a medication by name, adding a new medication, and deleting an existing one.
All methods are asynchronous because they interact with the database. */


namespace HomeCareApp.Repositories.Interfaces
{
    public interface IMedicationRepository
    {
        Task<List<Medication>> GetAllAsync(); // get all medications
        Task<List<Medication>> GetByPatientAsync(int patientId); // get medications for a specific patient
        Task<Medication?> GetByNameAsync(string medicinenName);

        Task<Medication> AddAsync(Medication med);
        Task DeleteAsync(Medication med);
    }
}


