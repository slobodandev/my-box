import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { AuthProvider, RequireAuth } from '@/contexts/AuthContext';
import { PasswordSetupPrompt } from '@/components/auth/PasswordSetupPrompt';
import { RequireSuperAdmin } from '@/components/auth/RequireSuperAdmin';

// Auth Pages
import SignIn from '@/pages/auth/SignIn';
import EmailSent from '@/pages/auth/EmailSent';
import Verify from '@/pages/auth/Verify';

// Admin Pages
import UserManagement from '@/pages/admin/UserManagement';

function App() {
  return (
    <AuthProvider>
      <PasswordSetupPrompt>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes - No Layout */}
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/email-sent" element={<EmailSent />} />
            <Route path="/auth/verify" element={<Verify />} />

            {/* Super Admin Routes - Requires Super Admin Role */}
            <Route
              path="/admin/users"
              element={
                <RequireAuth fallback={<SignIn />}>
                  <RequireSuperAdmin>
                    <UserManagement />
                  </RequireSuperAdmin>
                </RequireAuth>
              }
            />

            {/* Main App Routes - With Layout and Auth Protection */}
            <Route
              path="/*"
              element={
                <RequireAuth fallback={<SignIn />}>
                  <AppLayout />
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </PasswordSetupPrompt>
    </AuthProvider>
  );
}

export default App;
