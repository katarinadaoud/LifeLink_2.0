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

        // Get all medications (Public access like appointments)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetAll()
        {
            var items = await _repo.GetAllAsync();
            return Ok(items.Select(MedicationDto.FromEntity));
        }

        // Get medications for a specific patient
        [HttpGet("patient/{patientId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetByPatientId(int patientId)
        {
            var items = await _repo.GetByPatientAsync(patientId);
            return Ok(items.Select(MedicationDto.FromEntity));
        }

        // Get a medication by name
        [HttpGet("{medicationName}")]
        public async Task<ActionResult<MedicationDto>> GetByName(string medicationName)
        {
            var med = await _db.Medications.FirstOrDefaultAsync(m => m.medicineName == medicationName);
            if (med == null) return NotFound();
            return Ok(MedicationDto.FromEntity(med));
        }

        // Create a new medication
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<MedicationDto>> Create(MedicationDto dto)
        {
            var entity = dto.ToEntity();
            _db.Medications.Add(entity);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByName), new { medicationName = entity.medicineName }, MedicationDto.FromEntity(entity));
        }

        // Update medication
        [HttpPut("{medicationName}")]
        [Authorize]
        public async Task<IActionResult> Update(string medicationName, MedicationDto dto)
        {
            var med = await _db.Medications.FirstOrDefaultAsync(m => m.medicineName == medicationName);
            if (med == null) return NotFound();

            med.Dosage = dto.Dosage;
            med.StartDate = dto.StartDate;
            med.EndDate = dto.EndDate;
            med.PatientId = dto.PatientId;
            med.Indication = dto.Indication;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // Delete medication
        [HttpDelete("{medicationName}")]
        [Authorize]
        public async Task<IActionResult> Delete(string medicationName)
        {
            var med = await _db.Medications.FirstOrDefaultAsync(m => m.medicineName == medicationName);
            if (med == null) return NotFound();

            _db.Medications.Remove(med);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}


