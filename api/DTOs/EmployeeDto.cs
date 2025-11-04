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
    }
}