using HomeCareApp.Models;

/*This interface defines all basic CRUD operations for managing Employee.
It includes methods for retrieving all employees, getting a specific employee by either EmployeeId 
or UserId, creating a new employee, updating an existing one, and deleting an employee.
All methods are asynchronus.*/


namespace HomeCareApp.Repositories.Interfaces
{
    public interface IEmployeeRepository
    {
        Task<IEnumerable<Employee>> GetAll();

        // gets specific employee by id or user id
        Task<Employee?> GetEmployeeById(int id);
        Task<Employee?> GetEmployeeByUserId(string userId);
        Task<Employee> Create(Employee employee);
        Task<Employee> Update(Employee employee);
        
        Task Delete(int id);
    }
}