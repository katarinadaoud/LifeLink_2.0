using HomeCareApp.Data;
using HomeCareApp.DTOs;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HomeCareApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicationController : ControllerBase
    {
        private readonly IMedicationRepository _repo;
        private readonly AppDbContext _db;

        public MedicationController(IMedicationRepository repo, AppDbContext db)
        {
            _repo = repo;
            _db = db;
        }

        // Get all medications (Employee only)
        [HttpGet]
        [Authorize(Roles = "Employee")]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetAll()
        {
            var items = await _repo.GetAllAsync();
            return Ok(items.Select(MedicationDto.FromEntity));
        }

        // Get medications for the current patient
        [HttpGet("my")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetMine()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var pid = await _db.Patients
                .Where(p => p.UserId == userId)
                .Select(p => (int?)p.PatientId)
                .FirstOrDefaultAsync();

            if (pid is null) return Forbid();

            var items = await _repo.GetByPatientAsync(pid.Value);
            return Ok(items.Select(MedicationDto.FromEntity));
        }

        // Get a medication by name (Employee only)
        [HttpGet("{medicineName}")]
        [Authorize(Roles = "Employee")]
        public async Task<ActionResult<MedicationDto>> GetByName(string medicineName)
        {
            var med = await _db.Medications.FirstOrDefaultAsync(m => m.medicineName == medicineName);
            if (med == null) return NotFound();
            return Ok(MedicationDto.FromEntity(med));
        }

        // Create a new medication (Employee only)
        [HttpPost]
        [Authorize(Roles = "Employee")]
        public async Task<ActionResult<MedicationDto>> Create(MedicationDto dto)
        {
            var entity = dto.ToEntity();
            _db.Medications.Add(entity);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByName), new { medicationName = entity.medicineName }, MedicationDto.FromEntity(entity));
        }

        // Update medication (Employee only)
        [HttpPut("{medicineName}")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> Update(string medicineName, MedicationDto dto)
        {
            var med = await _db.Medications.FirstOrDefaultAsync(m => m.medicineName == medicineName);
            if (med == null) return NotFound();

            med.Dosage = dto.Dosage;
            med.StartDate = dto.StartDate;
            med.EndDate = dto.EndDate;
            med.PatientId = dto.PatientId;
            med.Indication = dto.Indication;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // Delete medication (Employee only)
        [HttpDelete("{medicineName}")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> Delete(string medicineName)
        {
            var med = await _db.Medications.FirstOrDefaultAsync(m => m.medicineName == medicineName);
            if (med == null) return NotFound();

            _db.Medications.Remove(med);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}


