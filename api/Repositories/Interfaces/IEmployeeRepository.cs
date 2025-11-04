using HomeCareApp.Models;

namespace HomeCareApp.Repositories.Interfaces
{
    public interface IEmployeeRepository
    {
        Task<IEnumerable<Employee>> GetAll();
        Task<Employee?> GetEmployeeById(int id);
        Task<Employee?> GetEmployeeByUserId(string userId);
        Task<Employee> Create(Employee employee);
        Task<Employee> Update(Employee employee);
        Task Delete(int id);
    }
}