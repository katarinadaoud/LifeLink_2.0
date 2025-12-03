using Microsoft.EntityFrameworkCore;
using HomeCareApp.Data;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;
using Microsoft.Extensions.Logging;

namespace HomeCareApp.Repositories.Implementations
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly AppDbContext _db; // EF Core DbContext (injected via DI)
        private readonly ILogger<EmployeeRepository> _logger; // Logger for logging information and errors

        public EmployeeRepository(AppDbContext db, ILogger<EmployeeRepository> logger) // constructor with dependency injection
        {
            _db = db;
            _logger = logger;
        }

        public async Task<IEnumerable<Employee>> GetAll() //gets all employees
        {
            try // try-catch block for error handling
            {
                _logger.LogInformation("[EmployeeRepository] GetAll() - Retrieving all employees");
                var employees = await _db.Employees
                    .Include(e => e.User)
                    .Include(e => e.Appointments)
                    .ToListAsync(); // fetch employees with related user and appointments
                _logger.LogInformation("[EmployeeRepository] GetAll() - Successfully retrieved {Count} employees", employees.Count());
                return employees;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[EmployeeRepository] GetAll() failed: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<Employee?> GetEmployeeById(int id) // get employee by id, admin use.
        {
            try // try-catch block for error handling
            {
                _logger.LogInformation("[EmployeeRepository] GetEmployeeById({Id}) - Retrieving employee", id);
                var employee = await _db.Employees
                    .Include(e => e.User)
                    .Include(e => e.Appointments)
                    .FirstOrDefaultAsync(e => e.EmployeeId == id);
                if (employee != null)
                {
                    _logger.LogInformation("[EmployeeRepository] GetEmployeeById({Id}) - Employee found: {EmployeeName}", id, employee.FullName);
                }
                else
                {
                    _logger.LogWarning("[EmployeeRepository] GetEmployeeById({Id}) - Employee not found", id);
                }
                return employee;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[EmployeeRepository] GetEmployeeById({Id}) failed: {Message}", id, ex.Message);
                throw;
            }
        }

        public async Task<Employee?> GetEmployeeByUserId(string userId) // get employee by user id, employee use.
        {
            try // try-catch block for error handling
            {
                _logger.LogInformation("[EmployeeRepository] GetEmployeeByUserId({UserId}) - Retrieving employee", userId);
                var employee = await _db.Employees
                    .Include(e => e.User)
                    .Include(e => e.Appointments)
                    .FirstOrDefaultAsync(e => e.UserId == userId);
                if (employee != null)
                {
                    _logger.LogInformation("[EmployeeRepository] GetEmployeeByUserId({UserId}) - Employee found: {EmployeeName}", userId, employee.FullName);
                }
                else
                {
                    _logger.LogWarning("[EmployeeRepository] GetEmployeeByUserId({UserId}) - Employee not found", userId);
                }
                return employee;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[EmployeeRepository] GetEmployeeByUserId({UserId}) failed: {Message}", userId, ex.Message);
                throw;
            }
        }

        // create new employee and return created employee, if not throw exception
        public async Task<Employee> Create(Employee employee) 
        {
            try // try-catch block for error handling
            {
                _logger.LogInformation("[EmployeeRepository] Create() - Creating employee: {EmployeeName}", employee.FullName);
                _db.Employees.Add(employee);
                await _db.SaveChangesAsync();
                _logger.LogInformation("[EmployeeRepository] Create() - Successfully created employee: {EmployeeName} with ID: {EmployeeId}", employee.FullName, employee.EmployeeId);
                return employee;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[EmployeeRepository] Create() failed for employee: {EmployeeName} - {Message}", employee.FullName, ex.Message);
                throw;
            }
        }

        public async Task<Employee> Update(Employee employee) // update existing employee
        {
            try
            {
                _logger.LogInformation("[EmployeeRepository] Update() - Updating employee: {EmployeeName} (ID: {EmployeeId})", employee.FullName, employee.EmployeeId);

                // Check if the entity is already being tracked
                var trackedEntry = _db.ChangeTracker.Entries<Employee>().FirstOrDefault(e => e.Entity.EmployeeId == employee.EmployeeId);
                if (trackedEntry != null)
                {
                    _logger.LogDebug("[EmployeeRepository] Update() - Using tracked entity for employee ID {EmployeeId}", employee.EmployeeId);
                    _logger.LogDebug("[EmployeeRepository] Update() - Tracked UserId: {TrackedUserId}, Incoming UserId: {IncomingUserId}", trackedEntry.Entity.UserId, employee.UserId);

                    // Update the tracked entity's values
                    if (!object.ReferenceEquals(trackedEntry.Entity, employee))
                    {
                        trackedEntry.CurrentValues.SetValues(employee);
                    }
                }
                else // update normally
                {
                    _db.Employees.Update(employee);
                }

                await _db.SaveChangesAsync();
                _logger.LogInformation("[EmployeeRepository] Update() - Successfully updated employee: {EmployeeName} (ID: {EmployeeId})", employee.FullName, employee.EmployeeId);
                return employee;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[EmployeeRepository] Update() failed for employee: {EmployeeName} (ID: {EmployeeId}) - {Message}", employee.FullName, employee.EmployeeId, ex.Message);
                throw;
            }
        }

        public async Task Delete(int id) // delete employee by id
        {
            try
            {
                _logger.LogInformation("[EmployeeRepository] Delete({Id}) - Attempting to delete employee", id);
                var employee = await _db.Employees.FindAsync(id);
                if (employee != null)
                {
                    _logger.LogInformation("[EmployeeRepository] Delete({Id}) - Deleting employee: {EmployeeName}", id, employee.FullName);
                    _db.Employees.Remove(employee);
                    await _db.SaveChangesAsync();
                    _logger.LogInformation("[EmployeeRepository] Delete({Id}) - Successfully deleted employee: {EmployeeName}", id, employee.FullName);
                }
                else
                {
                    _logger.LogWarning("[EmployeeRepository] Delete({Id}) - Employee not found", id); // employee to delete not found
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[EmployeeRepository] Delete({Id}) failed: {Message}", id, ex.Message); // log error
                throw;
            }
        }
    }
}