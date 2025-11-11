using Microsoft.EntityFrameworkCore;
using HomeCareApp.Models;
using Microsoft.AspNetCore.Identity;

namespace HomeCareApp.Data;

public static class DBInit
{
    public static async Task Seed(IApplicationBuilder app)
    {
        using var serviceScope = app.ApplicationServices.CreateScope();
        AppDbContext db = serviceScope.ServiceProvider.GetRequiredService<AppDbContext>();

        // First create some test AuthUsers (these would normally come from Identity)
        if (!db.Set<AuthUser>().Any())
        {
            var testUsers = new List<AuthUser>
            {
                new AuthUser { Id = "test-patient-1", UserName = "patient1", Email = "patient1@test.com" },
                new AuthUser { Id = "test-patient-2", UserName = "patient2", Email = "patient2@test.com" },
                new AuthUser { Id = "test-employee-1", UserName = "employee1", Email = "employee1@test.com" },
                new AuthUser { Id = "test-employee-2", UserName = "employee2", Email = "employee2@test.com" }
            };
            db.Set<AuthUser>().AddRange(testUsers);
            await db.SaveChangesAsync();
        }

        var authUsers = await db.Set<AuthUser>().ToListAsync();

        // ---------- PATIENTS ----------
        if (!db.Patients.Any())
        {
            var newPatients = new List<Patient>
            {
                new Patient
                {
                    FullName = "Tor Hansen",
                    Address = "Storgata 1, 0181 Oslo",
                    DateOfBirth = new DateTime(1945, 5, 15),
                    phonenumber = "+4712345678",
                    HealthRelated_info = "Dementia, diabetes",
                    UserId = authUsers.First(u => u.UserName == "patient1").Id,
                    User = authUsers.First(u => u.UserName == "patient1"),
                    Appointments = new List<Appointment>()
                },
                new Patient
                {
                    FullName = "Kari Olsen",
                    Address = "Lillegata 5, 0150 Oslo",
                    DateOfBirth = new DateTime(1952, 8, 22),
                    phonenumber = "+4787654321",
                    HealthRelated_info = "Heart condition",
                    UserId = authUsers.First(u => u.UserName == "patient2").Id,
                    User = authUsers.First(u => u.UserName == "patient2"),
                    Appointments = new List<Appointment>()
                }
            };
            db.Patients.AddRange(newPatients);
            await db.SaveChangesAsync();
        }

        // ---------- EMPLOYEES ----------
        if (!db.Employees.Any())
        {
            var newEmployees = new List<Employee>
            {
                new Employee
                {
                    FullName = "Ida Johansen",
                    Address = "Solveien 6, 1458 Oslo",
                    Department = "Oslo",
                    UserId = authUsers.First(u => u.UserName == "employee1").Id,
                    User = authUsers.First(u => u.UserName == "employee1"),
                    Appointments = new List<Appointment>()
                },
                new Employee
                {
                    FullName = "Per Andersen",
                    Address = "Bakkeveien 12, 0580 Oslo",
                    Department = "Oslo", 
                    UserId = authUsers.First(u => u.UserName == "employee2").Id,
                    User = authUsers.First(u => u.UserName == "employee2"),
                    Appointments = new List<Appointment>()
                }
            };
            db.Employees.AddRange(newEmployees);
            await db.SaveChangesAsync();
        }

        // Get created entities for relationships
        var patients = await db.Patients.ToListAsync();
        var employees = await db.Employees.ToListAsync();

        // ---------- APPOINTMENTS ----------
        if (!db.Appointments.Any())
        {
            var appointments = new List<Appointment>
            {
                new Appointment
                {
                    Subject = "Routine check-up",
                    Description = "Monthly health check and medication review",
                    Date = DateTime.Today.AddDays(1),
                    PatientId = patients.First(p => p.FullName == "Tor Hansen").PatientId,
                    EmployeeId = employees.First(e => e.FullName == "Ida Johansen").EmployeeId,
                    Patient = null!, // Will be set by EF Core
                    Employee = null! // Will be set by EF Core
                },
                new Appointment
                {
                    Subject = "Heart monitoring",
                    Description = "Blood pressure check and EKG",
                    Date = DateTime.Today.AddDays(3),
                    PatientId = patients.First(p => p.FullName == "Kari Olsen").PatientId,
                    EmployeeId = employees.First(e => e.FullName == "Per Andersen").EmployeeId,
                    Patient = null!,
                    Employee = null!
                },
                new Appointment
                {
                    Subject = "Medication adjustment", 
                    Description = "Review and adjust diabetes medication",
                    Date = DateTime.Today.AddDays(7),
                    PatientId = patients.First(p => p.FullName == "Tor Hansen").PatientId,
                    EmployeeId = employees.First(e => e.FullName == "Ida Johansen").EmployeeId,
                    Patient = null!,
                    Employee = null!
                }
            };
            db.Appointments.AddRange(appointments);
            await db.SaveChangesAsync();
        }
        
        // Create medications if none exist
        if (!db.Medications.Any())
        {
            var medications = new[]
            {
                new Medication
                {
                    medicineName = "Metformin",
                    Name = "Metformin 500mg",
                    PatientId = patients.First(p => p.FullName == "Tor Hansen").PatientId,
                    Indication = "Type 2 Diabetes",
                    Dosage = "500mg twice daily",
                    StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(-30)),
                    EndDate = null,
                    Patient = null! // Will be set by EF Core
                },
                new Medication
                {
                    medicineName = "Lisinopril",
                    Name = "Lisinopril 10mg",
                    PatientId = patients.First(p => p.FullName == "Kari Olsen").PatientId,
                    Indication = "High blood pressure",
                    Dosage = "10mg once daily",
                    StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(-60)),
                    EndDate = null,
                    Patient = null!
                },
                new Medication
                {
                    medicineName = "Paracetamol",
                    Name = "Paracetamol 500mg",
                    PatientId = patients.First(p => p.FullName == "Tor Hansen").PatientId,
                    Indication = "Pain relief",
                    Dosage = "500mg as needed, max 4 times daily",
                    StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(-7)),
                    EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(7)),
                    Patient = null!
                }
            };
            db.Medications.AddRange(medications);
            await db.SaveChangesAsync();
        }
    }
}