using Microsoft.EntityFrameworkCore;
using HomeCareApp.Data;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;

namespace HomeCareApp.Repositories.Implementations
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly AppDbContext _context;

        public EmployeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Employee>> GetAll() //gets all employees
        {
            return await _context.Employees // get ALL employees from database
                .Include(e => e.User) // include related user data
                .Include(e => e.Appointments) // include related appointments data
                .ToListAsync(); // return list of employees
        }

        public async Task<Employee?> GetEmployeeById(int id) // get employee by id, admin use.
        {
            return await _context.Employees // get employee by id from database
                .Include(e => e.User)
                .Include(e => e.Appointments)
                .FirstOrDefaultAsync(e => e.EmployeeId == id);
        }

        public async Task<Employee?> GetEmployeeByUserId(string userId) // get employee by user id, employee use.
        {
            return await _context.Employees
                .Include(e => e.User)
                .Include(e => e.Appointments)
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }

        public async Task<Employee> Create(Employee employee) // create new employee
        {
            _context.Employees.Add(employee); // add employee to database
            await _context.SaveChangesAsync();
            return employee;
        }

        public async Task<Employee> Update(Employee employee) // update existing employee
        {
            _context.Entry(employee).State = EntityState.Modified; //find employee in database and mark as modified, returns updated employee
            await _context.SaveChangesAsync();
            return employee;
        }

        public async Task Delete(int id) // delete employee by id
        {
            var employee = await _context.Employees.FindAsync(id); // find employee by id
            if (employee != null) // if found,
            {
                _context.Employees.Remove(employee); // remove employee from database
                await _context.SaveChangesAsync(); // save changes to database
            }
        }
    }
}