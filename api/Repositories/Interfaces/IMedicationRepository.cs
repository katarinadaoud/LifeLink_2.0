using HomeCareApp.Models;

namespace HomeCareApp.Repositories.Interfaces
{
    public interface IMedicationRepository
    {
        Task<List<Medication>> GetAllAsync();
        Task<List<Medication>> GetByPatientAsync(int patientId);
        Task<Medication?> GetByNameAsync(string medicinenName);
        Task<Medication> AddAsync(Medication med);
        Task DeleteAsync(Medication med);
    }
}


