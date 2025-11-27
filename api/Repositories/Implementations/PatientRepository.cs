using Microsoft.EntityFrameworkCore;
using HomeCareApp.Models;
using HomeCareApp.Data;
using HomeCareApp.Repositories.Interfaces;

namespace HomeCareApp.Repositories.Implementations;
public class PatientRepository : IPatientRepository


{
    private readonly AppDbContext _db; // EF Core DbContext (injected via DI)


    public PatientRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Patient>> GetAll() //gets all patients
    {
        return await _db.Patients.AsNoTracking().ToListAsync(); // return list of patients without tracking by EF Core, better for read-only operations (quicker and less memory)
    }

    public async Task<Patient?> GetPatientById(int id) // get patient by id
    {
        return await _db.Patients.FindAsync(id); // find patient by primary key (id), returns null if not found
    }

    public async Task Create(Patient patient) // create new patient
    {
        _db.Patients.Add(patient); // add patient to patients table
        await _db.SaveChangesAsync(); // save changes to database
    }

    public async Task Update(Patient patient) // update existing patient
    {
        _db.Patients.Update(patient); // update patient in patients table
        await _db.SaveChangesAsync(); // save changes to database
    }

    public async Task<bool> Delete(int id) // delete patient by id
    {
        var patient = await _db.Patients.FindAsync(id); // find patient by id
        if (patient == null) //if patient not found, return false
        {
            return false;
        }

        _db.Patients.Remove(patient); // remove patient from patients table
        await _db.SaveChangesAsync();// save changes to database
        return true;//
    }

}