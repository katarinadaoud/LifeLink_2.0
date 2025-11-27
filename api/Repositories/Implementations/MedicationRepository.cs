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

        //Get all medications 
        public async Task<List<Medication>> GetAllAsync()
        {
            var query = _db.Medications.Include(m => m.Patient).AsQueryable(); // include related patient data

            return await query.OrderByDescending(m => m.StartDate).ToListAsync(); // return list of medications ordered by start date descending
        }

        
        // Get medications by patient id
        public async Task<List<Medication>> GetByPatientAsync(int patientId) // get medications for a specific patient which are active 
        {
            var query = _db.Medications // go to medications table
                .Include(m => m.Patient) // include related patient data
                .Where(m => m.PatientId == patientId); // filter by patient id

           
                var today = DateOnly.FromDateTime(DateTime.Today); // get today's date and convert to DateOnly, not time
                query = query.Where(m => m.EndDate == null || m.EndDate >= today); /*if end date is null or in the future, 
                                                                                    medication is active. if end date is in the past, medication is inactive*/
            

            return await query.OrderByDescending(m => m.StartDate).ToListAsync(); // return list of medications ordered by start date descending
        }

        // Get a single medication by its name
        public async Task<Medication?> GetByNameAsync(string medicineName) // get medication by medicine name
        {
            return await _db.Medications // go to medications table
                .Include(m => m.Patient) // include related patient data
                .FirstOrDefaultAsync(m => m.medicineName == medicineName); // return medication or null if not found
        }

        // Add a new medication
        public async Task<Medication> AddAsync(Medication med) // add new medication to database
        {
            _db.Medications.Add(med); // add medication to medications table
            await _db.SaveChangesAsync(); // save changes to database
            return med;
        }

        // Delete a medication
        public async Task DeleteAsync(Medication med) // delete medication from database
        {
            _db.Medications.Remove(med); // remove medication from medications table
            await _db.SaveChangesAsync(); // save changes to database
        }
    }
}
