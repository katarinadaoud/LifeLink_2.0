# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

# HomeCare App
Our application is a full-stack healthcare management system built as a project in Webprogrammering at OsloMet.
The application allows administrators, employees and patients to manage appointments, medications, and personal information using a role-based access model that controls what each user can see and do. We have built this with React + TypeScript on the frontend and .Net8 Web API on the backend. 

TECH STACK

Frontend:
React + TypeScript
Vite
React Bootstrap
React Router
JWT authentication
Axios

Backend: 
.NET 8 Web Api
Entity Framework Core 8
SQLite database
ASP.NET Identity
Repository and Service architecture
Automapper

PROJECT STRUCTURE

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

Backend (api/)
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

INSTALLATION
1. Clone the repository
   git clone <https://github.com/susannegulbrandsen/React-Homecare.git>

2. Install backend dependencies
   cd api
   dotnet restore

3. Apply EF migrations
   dotnet ef database update

4. Install frontend dependencies
   cd ../homecare
   npm install

RUNNING THE APPLICATION
Start the backend:
cd api
dotnet watch run

backend runs at: https://localhost:7174
                 http://localhost:5090"

Start the frontend:
cd homecare
npm run dev

frontend runs at:  http://localhost:5173/

FEATURES

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
- Two roles: Patient andemployee
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


Known issues to fix:
Further recommended security hardening and future improvements are descriped in the project documentation

Contributors:
Susanne Røren Gulbrandsen
Katarina Briså Daoud
Vilde Nerem
Nahid Bani Hashem




