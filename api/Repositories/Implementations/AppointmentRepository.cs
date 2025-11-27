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
                _logger.LogInformation("[AppointmentRepository] GetAll() - Retrieving all appointments");
                var appointments = await _db.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Employee)
                    .ToListAsync();
                _logger.LogInformation("[AppointmentRepository] GetAll() - Successfully retrieved {Count} appointments", appointments.Count());
                return appointments;
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
                _logger.LogInformation("[AppointmentRepository] GetAppointmentById({Id}) - Retrieving appointment", id);
                var appointment = await _db.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Employee)
                    .FirstOrDefaultAsync(a => a.AppointmentId == id);
                if (appointment != null)
                {
                    _logger.LogInformation("[AppointmentRepository] GetAppointmentById({Id}) - Appointment found for patient: {PatientName}", id, appointment.Patient?.FullName ?? "Unknown");
                }
                else
                {
                    _logger.LogWarning("[AppointmentRepository] GetAppointmentById({Id}) - Appointment not found", id);
                }
                return appointment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AppointmentRepository] GetAppointmentById({Id}) failed: {Message}", id, ex.Message);
                return null;
            }
        }

        // create new appointment
        public async Task<bool> Create(Appointment appointment)
        {
            try
            { // add appointment
                _logger.LogInformation("[AppointmentRepository] Create() - Creating appointment for patient: {PatientId} with employee: {EmployeeId}", appointment.PatientId, appointment.EmployeeId);
                _db.Appointments.Add(appointment);
                await _db.SaveChangesAsync();
                _logger.LogInformation("[AppointmentRepository] Create() - Successfully created appointment with ID: {AppointmentId}", appointment.AppointmentId);
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
                _logger.LogInformation("[AppointmentRepository] Update() - Updating appointment: {AppointmentId}", appointment.AppointmentId);
                _db.Appointments.Update(appointment);
                await _db.SaveChangesAsync();
                _logger.LogInformation("[AppointmentRepository] Update() - Successfully updated appointment: {AppointmentId}", appointment.AppointmentId);
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
                _logger.LogInformation("[AppointmentRepository] Delete({Id}) - Attempting to delete appointment", id);
                var appointment = await _db.Appointments.FindAsync(id);
                if (appointment == null)
                {
                    _logger.LogWarning("[AppointmentRepository] Delete({Id}) - Appointment not found", id);
                    return false;
                }

                _logger.LogInformation("[AppointmentRepository] Delete({Id}) - Deleting appointment", id);
                _db.Appointments.Remove(appointment);
                await _db.SaveChangesAsync();
                _logger.LogInformation("[AppointmentRepository] Delete({Id}) - Successfully deleted appointment", id);
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
