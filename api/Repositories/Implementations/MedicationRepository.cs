using HomeCareApp.Data;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HomeCareApp.Repositories.Implementations
{
    public class MedicationRepository : IMedicationRepository
    {
        private readonly AppDbContext _db;

        public MedicationRepository(AppDbContext db)
        {
            _db = db;
        }

        // Get all medications 
        public async Task<List<Medication>> GetAllAsync()
        {
            var query = _db.Medications.Include(m => m.Patient).AsQueryable();

            return await query.OrderByDescending(m => m.StartDate).ToListAsync();
        }

        // Get medications by patient
        public async Task<List<Medication>> GetByPatientAsync(int patientId)
        {
            var query = _db.Medications
                .Include(m => m.Patient)
                .Where(m => m.PatientId == patientId);

           
                var today = DateOnly.FromDateTime(DateTime.Today);
                query = query.Where(m => m.EndDate == null || m.EndDate >= today);
            

            return await query.OrderByDescending(m => m.StartDate).ToListAsync();
        }

        // Get a single medication by its name
        public async Task<Medication?> GetByNameAsync(string medicineName)
        {
            return await _db.Medications
                .Include(m => m.Patient)
                .FirstOrDefaultAsync(m => m.medicineName == medicineName);
        }

        // Add a new medication
        public async Task<Medication> AddAsync(Medication med)
        {
            _db.Medications.Add(med);
            await _db.SaveChangesAsync();
            return med;
        }

        // Delete a medication
        public async Task DeleteAsync(Medication med)
        {
            _db.Medications.Remove(med);
            await _db.SaveChangesAsync();
        }
    }
}
