using System.ComponentModel.DataAnnotations;

namespace HomeCareApp.DTOs
{
    public class LoginDto
    {
        [Required]
        [Display(Name = "Username")]
        public string Username { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Password")]
        public string Password { get; set; } = string.Empty;
    }
}