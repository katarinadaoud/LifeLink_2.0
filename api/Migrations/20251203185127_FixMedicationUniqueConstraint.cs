using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class FixMedicationUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create temporary table with new structure (integer primary key)
            migrationBuilder.Sql(@"
                CREATE TABLE Medications_temp (
                    MedicationId INTEGER PRIMARY KEY AUTOINCREMENT,
                    MedicineName TEXT NOT NULL,
                    PatientId INTEGER NOT NULL,
                    Name TEXT NOT NULL,
                    Indication TEXT NOT NULL,
                    Dosage TEXT NOT NULL,
                    StartDate TEXT NOT NULL,
                    EndDate TEXT,
                    FOREIGN KEY (PatientId) REFERENCES Patients (PatientId) ON DELETE CASCADE
                );
            ");

            // Copy data from old table to new table
            migrationBuilder.Sql(@"
                INSERT INTO Medications_temp (MedicineName, PatientId, Name, Indication, Dosage, StartDate, EndDate)
                SELECT medicineName, PatientId, Name, Indication, Dosage, StartDate, EndDate
                FROM Medications;
            ");

            // Drop old table
            migrationBuilder.Sql("DROP TABLE Medications;");

            // Rename new table
            migrationBuilder.Sql("ALTER TABLE Medications_temp RENAME TO Medications;");

            // Recreate index
            migrationBuilder.Sql("CREATE INDEX IX_Medications_PatientId ON Medications (PatientId);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Create table with old structure (string primary key)
            migrationBuilder.Sql(@"
                CREATE TABLE Medications_temp (
                    medicineName TEXT PRIMARY KEY,
                    PatientId INTEGER NOT NULL,
                    Name TEXT NOT NULL,
                    Indication TEXT NOT NULL,
                    Dosage TEXT NOT NULL,
                    StartDate TEXT NOT NULL,
                    EndDate TEXT,
                    FOREIGN KEY (PatientId) REFERENCES Patients (PatientId) ON DELETE CASCADE
                );
            ");

            // Copy data back (note: this will lose MedicationId values)
            migrationBuilder.Sql(@"
                INSERT INTO Medications_temp (medicineName, PatientId, Name, Indication, Dosage, StartDate, EndDate)
                SELECT MedicineName, PatientId, Name, Indication, Dosage, StartDate, EndDate
                FROM Medications;
            ");

            // Drop new table
            migrationBuilder.Sql("DROP TABLE Medications;");

            // Rename old table
            migrationBuilder.Sql("ALTER TABLE Medications_temp RENAME TO Medications;");

            // Recreate index
            migrationBuilder.Sql("CREATE INDEX IX_Medications_PatientId ON Medications (PatientId);");
        }
    }
}
