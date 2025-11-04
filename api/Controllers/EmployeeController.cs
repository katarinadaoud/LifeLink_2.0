using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HomeCareApp.Models;
using HomeCareApp.DTOs;
using HomeCareApp.Repositories.Interfaces;

namespace HomeCareApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IPatientRepository _patientRepository;

    public EmployeeController(IEmployeeRepository employeeRepository, IPatientRepository patientRepository)
    {
        _employeeRepository = employeeRepository;
        _patientRepository = patientRepository;
    }

    // GET: api/employee
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployees()
    {
        var employees = await _employeeRepository.GetAll();
        var employeeDtos = employees.Select(e => new EmployeeDto
        {
            EmployeeId = e.EmployeeId,
            FullName = e.FullName,
            Address = e.Address,
            Department = e.Department,
            UserId = e.UserId,
            User = e.User
        });
        return Ok(employeeDtos);
    }

    // GET: api/employee/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeDto>> GetEmployee(int id)
    {
        var employee = await _employeeRepository.GetEmployeeById(id);
        if (employee == null)
            return NotFound();

        var employeeDto = new EmployeeDto
        {
            EmployeeId = employee.EmployeeId,
            FullName = employee.FullName,
            Address = employee.Address,
            Department = employee.Department,
            UserId = employee.UserId,
            User = employee.User
        };

        return Ok(employeeDto);
    }

    // GET: api/employee/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<EmployeeDto>> GetEmployeeByUserId(string userId)
    {
        var employee = await _employeeRepository.GetEmployeeByUserId(userId);
        if (employee == null)
            return NotFound($"Employee with UserId {userId} not found");

        var employeeDto = new EmployeeDto
        {
            EmployeeId = employee.EmployeeId,
            FullName = employee.FullName,
            Address = employee.Address,
            Department = employee.Department,
            UserId = employee.UserId,
            User = employee.User
        };

        return Ok(employeeDto);
    }

    // POST: api/employee
    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> CreateEmployee(EmployeeDto employeeDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var employee = new Employee
        {
            FullName = employeeDto.FullName,
            Address = employeeDto.Address,
            Department = employeeDto.Department,
            UserId = employeeDto.UserId,
            User = null!,
            Appointments = null!
        };

        await _employeeRepository.Create(employee);
        
        var createdEmployeeDto = new EmployeeDto
        {
            EmployeeId = employee.EmployeeId,
            FullName = employee.FullName,
            Address = employee.Address,
            Department = employee.Department,
            UserId = employee.UserId,
            User = employee.User
        };

        return CreatedAtAction(nameof(GetEmployee), new { id = employee.EmployeeId }, createdEmployeeDto);
    }

    // PUT: api/employee/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, EmployeeDto employeeDto)
    {
        if (employeeDto.EmployeeId != id)
            return BadRequest("ID mismatch");

        var existingEmployee = await _employeeRepository.GetEmployeeById(id);
        if (existingEmployee == null)
            return NotFound();

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        existingEmployee.FullName = employeeDto.FullName;
        existingEmployee.Address = employeeDto.Address;
        existingEmployee.Department = employeeDto.Department;
        existingEmployee.UserId = employeeDto.UserId;

        await _employeeRepository.Update(existingEmployee);
        return NoContent();
    }

    // DELETE: api/employee/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _employeeRepository.GetEmployeeById(id);
        if (employee == null)
            return NotFound();

        await _employeeRepository.Delete(id);
        return NoContent();
    }

    // GET: api/employee/dashboard
    [HttpGet("dashboard")]
    public async Task<ActionResult<object>> GetDashboard()
    {
        var patients = await _patientRepository.GetAll();
        
        var dashboardData = new
        {
            Role = "employee",
            ActiveTab = "schedule",
            TotalPatients = patients.Count(),
            Message = "Employee dashboard data"
        };
        
        return Ok(dashboardData);
    }

    // GET: api/employee/patients-summary
    [HttpGet("patients-summary")]
    public async Task<ActionResult<object>> GetPatientsSummary()
    {
        var patients = await _patientRepository.GetAll();
        
        var summary = new
        {
            Role = "employee",
            ActiveTab = "patients",
            TotalPatients = patients.Count(),
            Patients = patients.Select(p => new {
                p.PatientId,
                p.FullName,
                p.Address,
                p.DateOfBirth
            })
        };
        
        return Ok(summary);
    }

    // GET: api/employee/visits-summary
    [HttpGet("visits-summary")]
    public ActionResult<object> GetVisitsSummary()
    {
        var visitsData = new
        {
            Role = "employee",
            ActiveTab = "visits",
            TodaysVisits = 0, // Dette kan udvides med rigtig data senere
            Message = "Today's visits summary"
        };
        
        return Ok(visitsData);
    }
}