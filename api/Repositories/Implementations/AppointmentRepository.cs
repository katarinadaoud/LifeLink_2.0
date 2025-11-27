using Microsoft.EntityFrameworkCore;
using HomeCareApp.Models;
using HomeCareApp.Data;
using HomeCareApp.Repositories.Interfaces;

namespace HomeCareApp.Repositories.Implementations
{
    //Repository for CRUD operations on appointment entities
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly AppDbContext _db;
        private readonly ILogger<AppointmentRepository> _logger;

        public AppointmentRepository(AppDbContext db, ILogger<AppointmentRepository> logger)
        {
            _db = db;
            _logger = logger;
        }

        // CRUD operations
        public async Task<IEnumerable<Appointment>> GetAll() //gets all appointments
        {
            try
            {
                return await _db.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Employee)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AppointmentRepository] GetAll() failed: {Message}", ex.Message);
                return new List<Appointment>();
            }
        }

        public async Task<Appointment?> GetAppointmentById(int id)
        {
            try
            {
                return await _db.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Employee)
                    .FirstOrDefaultAsync(a => a.AppointmentId == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AppointmentRepository] Get({Id}) failed: {Message}", id, ex.Message);
                return null;
            }
        }

        // create new appointment
        public async Task<bool> Create(Appointment appointment)
        {
            try
            { // add appointment

                _db.Appointments.Add(appointment);
                await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AppointmentRepository] Create() failed: {Message}", ex.Message);
                return false;
            }
        }

        // update existing appointment
        public async Task<bool> Update(Appointment appointment)
        {
            try
            {
                _db.Appointments.Update(appointment);
                await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AppointmentRepository] Update() failed: {Message}", ex.Message);
                return false;
            }
        }
        // delete appointment by id, returnes true if successful and false if not
        public async Task<bool> Delete(int id)
        {
            try
            {
                var appointment = await _db.Appointments.FindAsync(id);
                if (appointment == null)
                    return false;

                _db.Appointments.Remove(appointment);
                await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AppointmentRepository] Delete({Id}) failed: {Message}", id, ex.Message);
                return false;
            }
        }

        
    }
}
