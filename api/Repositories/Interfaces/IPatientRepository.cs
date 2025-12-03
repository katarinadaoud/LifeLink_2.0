using HomeCareApp.Models;

namespace HomeCareApp.Repositories.Interfaces;

/*This interface defines all basic CRUD operations for managing Patient. 
*/
public interface IPatientRepository
{
    Task<IEnumerable<Patient>> GetAll();
    Task<Patient?> GetPatientById(int id);
    Task Create(Patient patient);
    Task Update(Patient patient);
    Task<bool> Delete(int id);
}
