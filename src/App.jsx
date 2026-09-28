// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransitProvider } from './context/TransitContext';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import LiveMap from './pages/LiveMap';
import RoutesPage from './pages/Routes';
import RouteDetails from './pages/RouteDetails';
import Timetable from './pages/Timetable';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import DriverPortal from './pages/DriverPortal';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <TransitProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Transit Navigation */}
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<LiveMap />} />
                <Route path="/routes" element={<RoutesPage />} />
                <Route path="/routes/:id" element={<RouteDetails />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/analytics" element={<Analytics />} />

                {/* Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Passenger Profile */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Driver Portal */}
                <Route
                  path="/driver"
                  element={
                    <ProtectedRoute allowedRoles={['driver', 'operator', 'admin']}>
                      <DriverPortal />
                    </ProtectedRoute>
                  }
                />

                {/* Admin & Operator Dashboard */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['operator', 'admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </TransitProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
