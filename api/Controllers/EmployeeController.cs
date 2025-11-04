using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HomeCareApp.Repositories.Interfaces;

namespace HomeCareApp.Controllers;
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly IPatientRepository _patientRepository;

    public EmployeeController(IPatientRepository patientRepository)
    {
        _patientRepository = patientRepository;
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
            TodaysVisits = 0, // Dette kan utvides med riktig data senere
            Message = "Today's visits summary"
        };
        
        return Ok(visitsData);
    }
}