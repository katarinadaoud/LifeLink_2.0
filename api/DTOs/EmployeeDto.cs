using System.ComponentModel.DataAnnotations;
using HomeCareApp.Models;

namespace HomeCareApp.DTOs
{
    public class EmployeeDto
    {
        public int EmployeeId { get; set; }
        
        [Required]
        [RegularExpression(@"[0-9a-zA-ZæøåÆØÅ. \-]{2,20}", ErrorMessage = "The Name must be numbers or letters and between 2 to 20 characters.")]
        [Display(Name = "Employee Name")]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, ErrorMessage = "Address cannot exceed 100 characters.")]
        public string Address { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50, ErrorMessage = "Department cannot exceed 50 characters.")]
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