using HomeCareApp.Models;

namespace HomeCareApp.DTOs
{
    public class EmployeeDto
    {
        public int EmployeeId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public AuthUser? User { get; set; }

        // Create a DTO from Employee entity
        public static EmployeeDto FromEntity(Employee employee) => new()
        {
            EmployeeId = employee.EmployeeId,
            FullName = employee.FullName,
            Address = employee.Address,
            Department = employee.Department,
            UserId = employee.UserId,
            User = employee.User
        };

        // Convert DTO to Employee entity
        public Employee ToEntity(string? userIdOverride = null) => new()
        {
            EmployeeId = EmployeeId,
            FullName = FullName,
            Address = Address,
            Department = Department,
            UserId = userIdOverride ?? UserId,
            User = User,
            Appointments = new List<Appointment>()
        };
    }
}