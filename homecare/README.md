# HomeCare App
Our application is a full-stack healthcare management system built as a project in Webprogrammering at OsloMet.
The application allows administrators, employees and patients to manage appointments, medications, and personal information using a role-based access model that controls what each user can see and do. We have built this with React + TypeScript on the frontend and .Net8 Web API on the backend. 

# TECH STACK
Frontend:
React + TypeScript
Vite
React Bootstrap
React Router
JWT authentication
Axios

Backend: 
Node.js 22.19.0
.NET 8 Web Api
Entity Framework Core 8
Framework Core Tools 10.0.0
SQLite database
ASP.NET Identity
Repository and Service architecture
Automapper

# PROJECT STRUCTURE

Frontend (/homecare)
src/
- appintments/
- assets/
- auth/
- emergency/
- home/
- medications/
- notifications/
- profile/
- search/
- shared/
- types/
- App.tsx
- main..tsx
- index.css

# Backend (api/)
api/
- APILogs        # Api request logs
- bin/           # Build output
- Controlles/    # API endpoints
- Data/          # Database context
- DTOs/          # Data transfer objects
- Migations      # EF Core migrations for SQLite database
- Models/        # Domain models/entities
- obj/           # Build artifacts
- Properties/    # Assembly info
- Repositories/  # Repository interfaces and implementations
- api.http       # test requests for local debugging
- appsettings.json # Main configuration (DB, logging and identity)
- appsettings.Development.json
- auth.db        # Identity user database
- homecare.db    # Main application database
- Program.cs     # Application 

# INSTALLATION
1. Install backend dependencies
   cd api
   dotnet restore

2. Apply EF migrations
   dotnet ef database update

3. Install frontend dependencies
   cd ../homecare
   npm install

# RUNNING THE APPLICATION
Start the backend:
cd api
dotnet watch run

Backend base-URL konfigureres via `VITE_API_URL` i miljøfiler.
For lokal utvikling: opprett/bruk [homecare/.env.development](homecare/.env.development) med
`VITE_API_URL=http://localhost:5090`.

Start the frontend:
cd homecare
npm run dev

Frontend nås vanligvis på `http://localhost:5173/`. Klienten bruker `VITE_API_URL` for alle API-kall.

# UNIT TESTING (Backend)

The project includes a dedicated test project: /Homecare.Api.Tests
The group implemented server-side unit tests for the AppointmentController using xUnit and Moq.
The test suite includes both positive and negative scenarios for all CRUD operations.
In total, 17 tests were created, covering validation rules, repository failures, correct HTTP responses, and authorization behavior through mocked user claims.
These tests ensure stable and predictable API behavior across all meaningful scenarios.

RUNNING THE UNIT TESTS
cd Homecare.Api.Tests
dotnet test

# FEATURES

Patients:
- Create, update, delete patient
- View medical and personal info
- Linked medications and appointments

Medications:
- Full CRUD
- Validation on required fields
- Linked to spesific patients

Appointments
- Full CRUD
- Different views for patient vs employee

Authentication and roles:
- JWT-based login
- Two roles: Patient and employee
- Role-based UI and API access based on the role claim in the JWT

Security configuration (backend)
- CORS restricted to the known frontend origins, allowing only the HTTP methods GET, POST, PUT and DELETE and the headers Content-Type and Authorization (AllowCredentials unchanged).

- HTTPS redirection and HSTS enabled in non-Development environments, so production traffic is forced over HTTPS while local Development can still run over HTTP.

- JWT signing key removed from appsettings.json and no longer stored in the repository.

- Separate development JWT configuration in appsettings.Development.json with a clear “dev only” dummy key plus issuer and audience, so the project runs locally without extra setup.

- Strict JWT validation in Program.cs (issuer, audience, lifetime, signing key and claim handling) to ensure only valid tokens can access the API.


Notifications
- CRUD
- Functionality for employee and patient


# KNOWN ISSUES TO FIX
Further recommended security hardening and future improvements are described in the project documentation



# CONTRIBUTORS
Candidatenumber: 142, 169, 127 and 254 