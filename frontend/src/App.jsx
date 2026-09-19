import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { PrivateRoute, RoleRoute } from './components/PrivateRoute';
import Layout from './components/Layout';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Lazy load pages for performance optimization
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const MetroMapPage = React.lazy(() => import('./pages/MetroMapPage'));
const CrowdMonitoring = React.lazy(() => import('./pages/CrowdMonitoring'));
const StationsPage = React.lazy(() => import('./pages/StationsPage'));
const TrainsPage = React.lazy(() => import('./pages/TrainsPage'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const Unauthorized = React.lazy(() => import('./pages/Unauthorized'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Profile = React.lazy(() => import('./pages/Profile'));
const LiveMonitoring = React.lazy(() => import('./pages/LiveMonitoring'));
const Scheduling = React.lazy(() => import('./pages/Scheduling'));
const AIPrediction = React.lazy(() => import('./pages/AIPrediction'));
const PassengerForecast = React.lazy(() => import('./pages/PassengerForecast'));
const AnalyticsReports = React.lazy(() => import('./pages/AnalyticsReports'));
const HeatmapDashboard = React.lazy(() => import('./pages/HeatmapDashboard'));
const FrequencyAdjustment = React.lazy(() => import('./pages/FrequencyAdjustment'));
const CrowdPrediction = React.lazy(() => import('./pages/CrowdPrediction'));
const AlertsPage = React.lazy(() => import('./pages/AlertsPage'));
const AnnouncementsPage = React.lazy(() => import('./pages/AnnouncementsPage'));


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error("VITE_GOOGLE_CLIENT_ID is not configured");
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <Router>
            <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Private Shell Layout Routes */}
                <Route 
                  path="/" 
                  element={
                    <PrivateRoute>
                      <Layout />
                    </PrivateRoute>
                  }
                >
                  {/* General Protected Pages */}
                  <Route index element={<Dashboard />} />
                  <Route path="map" element={<MetroMapPage />} />
                  <Route path="crowd" element={<CrowdMonitoring />} />

                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="live-monitoring" element={<LiveMonitoring />} />
                  <Route path="scheduling" element={<Scheduling />} />
                  <Route path="ai-prediction" element={<AIPrediction />} />
                  <Route path="passenger-forecast" element={<PassengerForecast />} />
                  <Route path="analytics-reports" element={<AnalyticsReports />} />
                  <Route path="heatmap" element={<HeatmapDashboard />} />
                  <Route path="frequency-adjustment" element={<FrequencyAdjustment />} />
                  <Route path="crowd-prediction" element={<CrowdPrediction />} />
                  <Route path="alerts" element={<AlertsPage />} />

                  {/* Operations restricted pages (Admin & Operators) */}
                  <Route 
                    path="announcements" 
                    element={
                      <RoleRoute allowedRoles={['Admin']}>
                        <AnnouncementsPage />
                      </RoleRoute>
                    } 
                  />
                  <Route 
                    path="stations" 
                    element={
                      <RoleRoute allowedRoles={['Admin', 'Operator']}>
                        <StationsPage />
                      </RoleRoute>
                    } 
                  />
                  <Route 
                    path="trains" 
                    element={
                      <RoleRoute allowedRoles={['Admin', 'Operator']}>
                        <TrainsPage />
                      </RoleRoute>
                    } 
                  />

                  {/* Admin Exclusive Panel */}
                  <Route 
                    path="admin" 
                    element={
                      <RoleRoute allowedRoles={['Admin']}>
                        <AdminPanel />
                      </RoleRoute>
                    } 
                  />
                </Route>

                {/* 404 Route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </React.Suspense>
          </Router>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
