import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { LoginPage } from '@/pages/LoginPage';
import { DepartmentsPage } from '@/pages/DepartmentsPage';
import { DepartmentDetailPage } from '@/pages/DepartmentDetailPage';
import { EmployeesPage } from '@/pages/EmployeesPage';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-background">
                    <Header />
                    <Routes>
                      <Route path="/departments" element={<DepartmentsPage />} />
                      <Route path="/departments/:id" element={<DepartmentDetailPage />} />
                      <Route path="/employees" element={<EmployeesPage />} />
                      <Route path="/" element={<Navigate to="/departments" replace />} />
                    </Routes>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
