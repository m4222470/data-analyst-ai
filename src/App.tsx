import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, GuestRoute, ProtectedRoute } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import FileUpload from './pages/FileUpload';
import Pricing from './pages/Pricing';
import Dashboards from './pages/Dashboards';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes - Redirect to dashboard if logged in */}
      <Route
        path="/login"
        element={
          <GuestRoute fallback={<Navigate to="/" replace />}>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute fallback={<Navigate to="/" replace />}>
            <Register />
          </GuestRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            <Layout>
              <FileUpload />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            <Layout>
              <Chat />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboards"
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            <Layout>
              <Dashboards />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            <Layout>
              <Pricing />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute fallback={<Navigate to="/login" replace />}>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
