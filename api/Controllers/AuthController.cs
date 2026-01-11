using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using HomeCareApp.DTOs;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.RateLimiting;

namespace HomeCareApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AuthUser> _userManager; //for handling users
        private readonly SignInManager<AuthUser> _signInManager; //for handling log ins
        private readonly RoleManager<IdentityRole> _roleManager; //for handling roles
        private readonly IConfiguration _configuration; //for accessing app settings
        private readonly ILogger<AuthController> _logger;
        private readonly IPatientRepository _patientRepository;
        private readonly IEmployeeRepository _employeeRepository;

        public AuthController(UserManager<AuthUser> userManager, SignInManager<AuthUser> signInManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration, ILogger<AuthController> logger, IPatientRepository patientRepository, IEmployeeRepository employeeRepository)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _logger = logger;
            _patientRepository = patientRepository;
            _employeeRepository = employeeRepository;
        }


        // Creates a user with role Patient or Employee//
        [HttpPost("register")]
        [EnableRateLimiting("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            // Validate role
            if (registerDto.Role != "Patient" && registerDto.Role != "Employee")
            {
                return BadRequest(new[] { new { code = "InvalidRole", description = "Role must be either 'Patient' or 'Employee'" } });
            }

            // Check if email is already in use
            var existingUserByEmail = await _userManager.FindByEmailAsync(registerDto.Email);
            if (existingUserByEmail != null)
            {
                _logger.LogWarning("[AuthController] Registration failed - email already in use: {Email}", registerDto.Email);
                return BadRequest("This email is already in use");
            }

            // Check if username is already in use
            var existingUserByUsername = await _userManager.FindByNameAsync(registerDto.Username);
            if (existingUserByUsername != null)
            {
                _logger.LogWarning("[AuthController] Registration failed - username already in use: {Username}", registerDto.Username);
                return BadRequest("This username is already in use");
            }

            var user = new AuthUser
            {
                UserName = registerDto.Username,
                Email = registerDto.Email
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            
            if (result.Succeeded)
            {
                //Ensure roles exist
                if (!await _roleManager.RoleExistsAsync("Patient"))
                    await _roleManager.CreateAsync(new IdentityRole("Patient"));
                if (!await _roleManager.RoleExistsAsync("Employee"))
                    await _roleManager.CreateAsync(new IdentityRole("Employee"));

                //Add user to role
                await _userManager.AddToRoleAsync(user, registerDto.Role);

                _logger.LogInformation("[AuthAPIController] user registered for {@username} with role {@role}", registerDto.Username, registerDto.Role);
                return Ok(new { Message = "User registered successfully. Please complete your profile." });
            }

            _logger.LogWarning("[AuthAPIController] user registration failed for {@username}", registerDto.Username);
            var errors = result.Errors.Select(e => new { code = e.Code, description = e.Description });
            return BadRequest(errors);
        }

        //Method for user login//
        [HttpPost("login")]
        [EnableRateLimiting("Login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            //Check if the user exists
            var user = await _userManager.FindByNameAsync(loginDto.Username);

            if (user != null)
            {
                // Use Identity lockout on failure without issuing cookies
                var signInResult = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, lockoutOnFailure: true);
                if (signInResult.Succeeded)
                {
                    _logger.LogInformation("[AuthAPIController] user authorised for {@username}", loginDto.Username);
                    var token = await GenerateJwtToken(user);
                    return Ok(new { Token = token });
                }

                if (signInResult.IsLockedOut)
                {
                    _logger.LogWarning("[AuthAPIController] account locked out for {@username}", loginDto.Username);
                    return Unauthorized("Account temporarily locked. Please try again later.");
                }
            }

            _logger.LogWarning("[AuthAPIController] user not authorised for {@username}", loginDto.Username);
            return Unauthorized();
        }

        //Method for user logout//
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            //Logout is usually handled on the client side by removing the token
            await _signInManager.SignOutAsync();
            _logger.LogInformation("[AuthAPIController] user logged out");
            return Ok(new { Message = "Logout successful" });
        }

        //Completes patient profile after registration//
        [Authorize]
        [HttpPost("complete-patient-profile")]
        public async Task<IActionResult> CompletePatientProfile([FromBody] PatientDto profileDto)
        {
            //Get current user
            var user = await GetCurrentUserAsync();
            if (user == null)
            {
                return NotFound("User not found");
            }

            //Check if user is patient
            var roles = await _userManager.GetRolesAsync(user);
            if (!roles.Contains("Patient"))
            {
                return BadRequest("User is not a patient");
            }

            // Check if patient already exists
            var patients = await _patientRepository.GetAll();
            var existingPatient = patients.FirstOrDefault(p => p.UserId == user.Id);
            
            if (existingPatient != null)
            {
                return BadRequest("Patient profile already exists");
            }

            // Check if phone number is already in use by another patient
            if (!string.IsNullOrWhiteSpace(profileDto.phonenumber))
            {
                var duplicatePhone = patients.FirstOrDefault(p => 
                    !string.IsNullOrWhiteSpace(p.phonenumber) && 
                    p.phonenumber == profileDto.phonenumber);
                
                if (duplicatePhone != null)
                {
                    _logger.LogWarning("[AuthController] Profile creation failed - phone number already in use: {PhoneNumber}", profileDto.phonenumber);
                    return BadRequest("This phone number is already in use");
                }
            }

            //Map patient using DTO ToEntity
            var patient = profileDto.ToEntity(user.Id);
            patient.User = user; //Set navigation property

            await _patientRepository.Create(patient);
            _logger.LogInformation("[AuthAPIController] Patient profile created for {Username}", user.UserName);
            
            return Ok(new { Message = "Patient profile created successfully" });
        }

        //Completes employee profile after registration
        [Authorize]
        [HttpPost("complete-employee-profile")]
        public async Task<IActionResult> CompleteEmployeeProfile([FromBody] EmployeeDto profileDto)
        {
            var user = await GetCurrentUserAsync(); //Get current user
            if (user == null)
            {
                return NotFound("User not found");
            }

            var roles = await _userManager.GetRolesAsync(user); 
            if (!roles.Contains("Employee"))
            {
                return BadRequest("User is not an employee");
            }

            var employees = await _employeeRepository.GetAll();
            var existingEmployee = employees.FirstOrDefault(e => e.UserId == user.Id);
            
            if (existingEmployee != null)
            {
                return BadRequest("Employee profile already exists");
            }

            
            var employee = profileDto.ToEntity(user.Id); //Map employee using DTO ToEntity
            employee.User = user; 

            await _employeeRepository.Create(employee);
            _logger.LogInformation("[AuthAPIController] Employee profile created for {Username}", user.UserName);
            
            return Ok(new { Message = "Employee profile created successfully" });
        }

        //Help method to get current user from JWT claims using multiple fallback strategies//
        private async Task<AuthUser?> GetCurrentUserAsync()
        {
            //Get all possible user identifiers from claims
            var allNameIdentifierClaims = User.FindAll(ClaimTypes.NameIdentifier).Select(c => c.Value).ToList();
            var userIdFromNameId = User.FindFirst("nameid")?.Value;
            var userIdFromSub = User.FindFirst("sub")?.Value;
            var userIdFromUserid = User.FindFirst("userid")?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? 
                          User.FindFirst("username")?.Value ??
                          User.Identity?.Name;
            
            AuthUser? user = null;
            
            //Try to find user by each possible ID 
            var possibleIds = new List<string?> { userIdFromSub, userIdFromNameId, userIdFromUserid }
                .Concat(allNameIdentifierClaims)
                .Where(id => !string.IsNullOrEmpty(id))
                .Distinct()
                .ToList();
                
            foreach (var id in possibleIds)
            {
                if (string.IsNullOrEmpty(id)) continue;
                
                //Check if it looks like a GUID (Globally Unique Identifier)
                if (Guid.TryParse(id, out _))
                {
                    user = await _userManager.FindByIdAsync(id);
                    if (user != null) break;
                }
            }
            
            //If still not found, try by username
            if (user == null && !string.IsNullOrEmpty(username))
            {
                user = await _userManager.FindByNameAsync(username);
            }
            
            //Try non-GUID IDs as last resort
            if (user == null)
            {
                foreach (var id in possibleIds)
                {
                    if (string.IsNullOrEmpty(id) || Guid.TryParse(id, out _)) continue;
                    
                    user = await _userManager.FindByIdAsync(id);
                    if (user != null) break;
                }
            }
            
            return user;
        }

        //Deletes account of current user//
        [Authorize]
        [HttpDelete("delete-account")]
        public async Task<IActionResult> DeleteAccount()
        {
        
            var allNameIdentifierClaims = User.FindAll(ClaimTypes.NameIdentifier).Select(c => c.Value).ToList();
            var userIdFromNameId = User.FindFirst("nameid")?.Value;
            var userIdFromSub = User.FindFirst("sub")?.Value;
            var userIdFromUserid = User.FindFirst("userid")?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? 
                          User.FindFirst("username")?.Value ??
                          User.Identity?.Name;
            
            // Avoid dumping claims to logs to reduce PII exposure
            
            AuthUser? user = null;
            string? actualUserId = null;

            
        
            var possibleIds = new List<string?> { userIdFromSub, userIdFromNameId, userIdFromUserid } //collect all possible user IDs
                .Concat(allNameIdentifierClaims)
                .Where(id => !string.IsNullOrEmpty(id))
                .Distinct()
                .ToList();
                
            foreach (var id in possibleIds) //try to find user by GUID IDs first
            {
                if (string.IsNullOrEmpty(id)) continue;
                
                if (Guid.TryParse(id, out _))
                {
                    user = await _userManager.FindByIdAsync(id);
                    if (user != null)
                    {
                        actualUserId = id;
                        _logger.LogInformation("[AuthAPIController] Found user by GUID ID: {ActualUserId}", actualUserId);
                        break;
                    }
                }
            }
            
            if (user == null && !string.IsNullOrEmpty(username)) //try by username next
            {
                user = await _userManager.FindByNameAsync(username);
                if (user != null)
                {
                    actualUserId = user.Id;
                    _logger.LogInformation("[AuthAPIController] Found user by username: {Username}, ID: {ActualUserId}", username, actualUserId);
                }
            }
            
            if (user == null) //try non-GUID IDs last
            {
                foreach (var id in possibleIds)
                {
                    if (string.IsNullOrEmpty(id) || Guid.TryParse(id, out _)) continue;
                    
                    user = await _userManager.FindByIdAsync(id);
                    if (user != null)
                    {
                        actualUserId = user.Id;
                        _logger.LogInformation("[AuthAPIController] Found user by non-GUID ID: {Id} -> Actual ID: {ActualUserId}", id, actualUserId);
                        break;
                    }
                }
            }
            
            if (user == null)
            {
                _logger.LogWarning("[AuthAPIController] delete account failed - user not found with any ID: {PossibleIds} or username: {Username}", 
                    string.Join(", ", possibleIds), username);
                return NotFound("User not found");
            }

            //get user roles to determine what to delete
            var roles = await _userManager.GetRolesAsync(user);
            
            //delete associated Patient or Employee records first
            foreach (var role in roles)
            {
                try
                {
                    if (role == "Patient") //delete patient record
                    {
                        var patients = await _patientRepository.GetAll();
                        var patient = patients.FirstOrDefault(p => p.UserId == actualUserId);
                        if (patient != null)
                        {
                            _logger.LogInformation("[AuthController] Deleting patient record for UserId: {UserId}", actualUserId);
                            await _patientRepository.Delete(patient.PatientId);
                        }
                        else
                        {
                            _logger.LogWarning("[AuthController] No patient record found for UserId: {UserId}", actualUserId);
                        }
                    }
                    else if (role == "Employee") //delete employee record
                    {
                        var employees = await _employeeRepository.GetAll();
                        var employee = employees.FirstOrDefault(e => e.UserId == actualUserId);
                        if (employee != null)
                        {
                            _logger.LogInformation("[AuthController] Deleting employee record for UserId: {UserId}", actualUserId);
                            await _employeeRepository.Delete(employee.EmployeeId);
                        }
                        else
                        {
                            _logger.LogWarning("[AuthController] No employee record found for UserId: {UserId}", actualUserId);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError("[AuthController] Error deleting {Role} record: {ErrorMessage}", role, ex.Message);
                    //continue with user deletion even if Patient/Employee deletion fails
                }
            }

            var result = await _userManager.DeleteAsync(user); //delete user account
            if (result.Succeeded)
            {
                _logger.LogInformation("[AuthAPIController] user account deleted for {Username}", user.UserName);
                return Ok(new { Message = "Account deleted successfully" });
            }

            _logger.LogWarning("[AuthAPIController] delete account failed for {Username}", user.UserName);
            var errors = result.Errors.Select(e => new { code = e.Code, description = e.Description });
            return BadRequest(errors);
        }


        //Generates JWT token for authenticated user//
        private async Task<string> GenerateJwtToken(AuthUser user)
        {
            var jwtKey = _configuration["Jwt:Key"]; //the secret key used for the signature
            if (string.IsNullOrEmpty(jwtKey)) //ensure the key is not null or empty
            {   
                _logger.LogError("[AuthAPIController] JWT key is missing from configuration.");
                throw new InvalidOperationException("JWT key is missing from configuration.");
            }
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)); //reading the key from the configuration
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256); //using HMAC SHA256 algorithm for signing the token

            // get user roles
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id), //subject of the token - user id not username
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(ClaimTypes.NameIdentifier, user.Id), //unique identifier for the user
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim("username", user.UserName!), //explicit username claim
                new Claim("userid", user.Id), //explicit user id claim
                new Claim("nameid", user.Id), //alternative user id claim
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), //unique identifier for the token
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()) //Issued at timestamp
            };

            // Add role claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
                claims.Add(new Claim("role", role)); //add explicit role claim for JWT
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(30), // shorter token lifetime
                signingCredentials: credentials); //signing the token with the specified credentials

            _logger.LogInformation("[AuthAPIController] JWT token created for {@username}", user.UserName);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}