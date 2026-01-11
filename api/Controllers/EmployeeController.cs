using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HomeCareApp.Models;
using HomeCareApp.DTOs;
using HomeCareApp.Repositories.Interfaces;

#pragma warning disable CS8602 // Dereference of a possibly null reference

namespace HomeCareApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly ILogger<EmployeeController> _logger;

    public EmployeeController(IEmployeeRepository employeeRepository, IPatientRepository patientRepository, ILogger<EmployeeController> logger)
    {
        _employeeRepository = employeeRepository;
        _patientRepository = patientRepository;
        _logger = logger;
    }

    //Get all employees and returns as a list//
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployees()
    {
        //Find employee list
        var employees = await _employeeRepository.GetAll();
        if (employees == null)
        {
            _logger.LogError("[EmployeeController] Employee list not found while executing _employeeRepository.GetAll()");
            return NotFound("Employee list not found");
        }

        //Map employee to DTOs using FromEntity and materialize to list
        var employeeDtos = employees.Select(EmployeeDto.FromEntity).ToList();
        
        _logger.LogInformation("[EmployeeController] Retrieved {Count} employees", employeeDtos.Count);
        return Ok(employeeDtos);
    }



    //Get employee by user id//
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<EmployeeDto>> GetEmployeeByUserId(string userId)
    {
        _logger.LogInformation("[EmployeeController] Getting employee by UserId: {UserId}", userId);
        var employee = await _employeeRepository.GetEmployeeByUserId(userId);
        if (employee == null)
        {
            _logger.LogWarning("[EmployeeController] Employee with UserId {UserId} not found", userId);
            return NotFound($"Employee with UserId {userId} not found");
        }

        var employeeDto = EmployeeDto.FromEntity(employee);

        _logger.LogInformation("[EmployeeController] Successfully retrieved employee {EmployeeId} for UserId: {UserId}", employee.EmployeeId, userId);
        return Ok(employeeDto);
    }


    //Update employee details in My Profile//
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] EmployeeDto? employeeDto)
    {
        _logger.LogInformation("[EmployeeController] Updating employee with ID: {EmployeeId}", id);
        
        if (employeeDto == null)
        {
            _logger.LogWarning("[EmployeeController] UpdateEmployee request body is null for ID {EmployeeId}", id);
            return BadRequest("Request body is required");
        }
        
        //id must match the id in the url and dto, making sure the correct employee is updated
        if (employeeDto!.EmployeeId != id)
        {
            _logger.LogWarning("[EmployeeController] ID mismatch: URL ID {UrlId} vs DTO ID {DtoId}", id, employeeDto.EmployeeId);
            return BadRequest("ID mismatch");
        }

        var existingEmployee = await _employeeRepository.GetEmployeeById(id); //Fetch the existing employee from the database
        if (existingEmployee == null)
        {
            _logger.LogWarning("[EmployeeController] Employee with ID {EmployeeId} not found for update", id);
            return NotFound();
        }

        if (!ModelState.IsValid) //Validate the incoming model
        {
            _logger.LogWarning("[EmployeeController] Invalid model state for employee update {EmployeeId}", id);
            return BadRequest(ModelState);
        }

        // Log values to diagnose FK issues
        _logger.LogDebug("[EmployeeController] UpdateEmployee - existing UserId: {ExistingUserId}, DTO UserId: {DtoUserId}", existingEmployee?.UserId, employeeDto!.UserId);

        //Map only scalar/primitive fields from DTO to the tracked existing employee to avoid FK and tracking issues
        existingEmployee.FullName = employeeDto!.FullName;
        existingEmployee.Address = employeeDto!.Address;
        existingEmployee.Department = employeeDto!.Department;
        existingEmployee.UserId = string.IsNullOrWhiteSpace(employeeDto!.UserId) ? existingEmployee.UserId : employeeDto!.UserId;

        await _employeeRepository.Update(existingEmployee);
        _logger.LogInformation("[EmployeeController] Successfully updated employee {EmployeeId}", id);
        return NoContent();
    }
}

#pragma warning restore CS8602 // Dereference of a possibly null reference