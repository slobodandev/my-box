import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { AuthProvider, RequireAuth } from '@/contexts/AuthContext';

// Auth Pages
import SignIn from '@/pages/auth/SignIn';
import EmailSent from '@/pages/auth/EmailSent';
import Verify from '@/pages/auth/Verify';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes - No Layout */}
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/email-sent" element={<EmailSent />} />
          <Route path="/auth/verify" element={<Verify />} />

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
    </AuthProvider>
  );
}

export default App;
