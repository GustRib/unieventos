import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute, RoleRoute, GuestRoute } from '@/routes/guards';
import { EventDiscoveryPage } from '@/pages/events/EventDiscoveryPage';
import { EventDetailPage } from '@/pages/events/EventDetailPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ParticipantRegisterPage } from '@/pages/auth/ParticipantRegisterPage';
import { OrganizerRegisterPage } from '@/pages/auth/OrganizerRegisterPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { OrganizerDashboardPage } from '@/pages/dashboard/OrganizerDashboardPage';
import { OrganizerRegistrationsPage } from '@/pages/dashboard/OrganizerRegistrationsPage';
import { AdminDashboardPage } from '@/pages/dashboard/AdminDashboardPage';
import { MyRegistrationsPage } from '@/pages/registrations/MyRegistrationsPage';
import { UserRole } from '@/types';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<EventDiscoveryPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />

        <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="register/participant" element={<GuestRoute><ParticipantRegisterPage /></GuestRoute>} />
        <Route path="register/organizer" element={<GuestRoute><OrganizerRegisterPage /></GuestRoute>} />

        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<RoleRoute roles={[UserRole.Participant]}><ProfilePage /></RoleRoute>} />
          <Route path="my-registrations" element={<RoleRoute roles={[UserRole.Participant]}><MyRegistrationsPage /></RoleRoute>} />

          <Route path="dashboard/organizer" element={<RoleRoute roles={[UserRole.Organizer]}><OrganizerDashboardPage /></RoleRoute>} />
          <Route path="dashboard/organizer/events/:id/registrations" element={<RoleRoute roles={[UserRole.Organizer]}><OrganizerRegistrationsPage /></RoleRoute>} />

          <Route path="dashboard/admin" element={<RoleRoute roles={[UserRole.Admin]}><AdminDashboardPage /></RoleRoute>} />
        </Route>
      </Route>
    </Routes>
  );
}
