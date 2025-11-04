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

        public async Task<IEnumerable<Employee>> GetAll()
        {
            return await _context.Employees
                .Include(e => e.User)
                .Include(e => e.Appointments)
                .ToListAsync();
        }

        public async Task<Employee?> GetEmployeeById(int id)
        {
            return await _context.Employees
                .Include(e => e.User)
                .Include(e => e.Appointments)
                .FirstOrDefaultAsync(e => e.EmployeeId == id);
        }

        public async Task<Employee?> GetEmployeeByUserId(string userId)
        {
            return await _context.Employees
                .Include(e => e.User)
                .Include(e => e.Appointments)
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }

        public async Task<Employee> Create(Employee employee)
        {
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            return employee;
        }

        public async Task<Employee> Update(Employee employee)
        {
            _context.Entry(employee).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return employee;
        }

        public async Task Delete(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee != null)
            {
                _context.Employees.Remove(employee);
                await _context.SaveChangesAsync();
            }
        }
    }
}