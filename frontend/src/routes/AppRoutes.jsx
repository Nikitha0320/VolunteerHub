import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import OrganizerDashboard from '../pages/OrganizerDashboard'
import AdminDashboard from '../pages/AdminDashboard'
import EventListPage from '../pages/EventListPage'
import EventDetailsPage from '../pages/EventDetailsPage'
import CreateEventPage from '../pages/CreateEventPage'
import JoinedEventsPage from '../pages/JoinedEventsPage'
import EventMessagesPage from '../pages/EventMessagesPage'
import ProfilePage from '../pages/ProfilePage'
import SettingsPage from '../pages/SettingsPage'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/events" element={<ProtectedRoute><EventListPage /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
      <Route path="/event-messages" element={<ProtectedRoute><EventMessagesPage /></ProtectedRoute>} />

      <Route path="/profile" element={<ProtectedRoute allowedRoles={['VOLUNTEER']}><ProfilePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={['VOLUNTEER', 'ORGANIZER']}><SettingsPage /></ProtectedRoute>} />
      <Route path="/volunteer-dashboard" element={<ProtectedRoute allowedRoles={['VOLUNTEER']}><Navigate to="/profile" replace /></ProtectedRoute>} />
      <Route path="/joined-events" element={<ProtectedRoute allowedRoles={['VOLUNTEER']}><JoinedEventsPage /></ProtectedRoute>} />

      <Route path="/organizer-dashboard" element={<ProtectedRoute allowedRoles={['ORGANIZER']}><OrganizerDashboard /></ProtectedRoute>} />
      <Route path="/create-event" element={<ProtectedRoute allowedRoles={['ORGANIZER']}><CreateEventPage /></ProtectedRoute>} />

      <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  )
}

export default AppRoutes
