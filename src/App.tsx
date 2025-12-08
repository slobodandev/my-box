import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { AuthProvider, RequireAuth } from '@/contexts/AuthContext';
import { PasswordSetupPrompt } from '@/components/auth/PasswordSetupPrompt';
import { RequireSuperAdmin } from '@/components/auth/RequireSuperAdmin';
import { RequireAdmin } from '@/components/auth/RequireAdmin';

// Auth Pages
import SignIn from '@/pages/auth/SignIn';
import EmailSent from '@/pages/auth/EmailSent';
import Verify from '@/pages/auth/Verify';

// Admin Pages
import UserManagement from '@/pages/admin/UserManagement';
import DocumentPathManagement from '@/pages/admin/DocumentPathManagement';
import DocumentMasterManagement from '@/pages/admin/DocumentMasterManagement';

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

            {/* Admin Routes - Requires Admin or Super Admin Role */}
            <Route
              path="/admin/document-paths"
              element={
                <RequireAuth fallback={<SignIn />}>
                  <RequireAdmin>
                    <DocumentPathManagement />
                  </RequireAdmin>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/document-types"
              element={
                <RequireAuth fallback={<SignIn />}>
                  <RequireAdmin>
                    <DocumentMasterManagement />
                  </RequireAdmin>
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
