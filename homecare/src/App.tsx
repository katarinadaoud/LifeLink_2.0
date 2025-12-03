import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import HomePage from './home/HomePage'
import AppointmentListPage from './appointments/AppointmentListPage'
import AppointmentCreatePage from './appointments/AppointmentCreatePage'
import AppointmentUpdatePage from './appointments/AppointmentUpdatePage'
import ProfilePage from './profile/ProfilePage'
import ProfileSetupPage from './profile/ProfileSetupPage'
import NavMenu from './shared/NavMenu'
import LoginPage from './auth/LoginPage'
import RegisterPage from './auth/RegisterPage'
import ProtectedRoute from './auth/ProtectedRoute'
import { AuthProvider } from './auth/AuthContext'
import MedicationListPage from "./medications/MedicationListPage";
import MedicationCreatePage from './medications/MedicationCreate'
import MedicationDeletePage from './medications/MedicationDelete'
import MedicationUpdatePage from './medications/MedicationUpdate'
import SearchResultsPage from './search/SearchResultsPage'
import NotificationListPage from './notifications/NotificationListPage'

import EmergencyContactButton from './emergency/EmergencyContactButton'
import './App.css'

// The main application component with routing
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <NavMenu />
        <Container className="mt-4" as="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes*/}
            <Route element={<ProtectedRoute />}>
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/appointments" element={<AppointmentListPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile-setup" element={<ProfileSetupPage />} />
              <Route path="/appointmentcreate" element={<AppointmentCreatePage />} />
              <Route path="/appointmentupdate/:appointmentId" element={<AppointmentUpdatePage />} />
              <Route path="/medications" element={<MedicationListPage />} />
              <Route path="/medications/new" element={<MedicationCreatePage />} />
              <Route path="/medications/:name/edit" element={<MedicationUpdatePage />} />
              <Route path="/medications/:name/delete" element={<MedicationDeletePage />} />
              <Route path="/notifications" element={<NotificationListPage />} />

            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
        <EmergencyContactButton />
      </Router>
    </AuthProvider>
  )
}

export default App
