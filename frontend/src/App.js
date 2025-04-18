import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Portfolios from './pages/Portfolios';
import PortfolioDetail from './pages/PortfolioDetail';
import PortfolioForm from './pages/PortfolioForm';
import AssetForm from './pages/AssetForm';
import AssetAlerts from './pages/AssetAlerts';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/portfolios" element={
        <ProtectedRoute>
          <Layout>
            <Portfolios />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/portfolios/new" element={
        <ProtectedRoute>
          <Layout>
            <PortfolioForm />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/portfolios/edit/:id" element={
        <ProtectedRoute>
          <Layout>
            <PortfolioForm />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/portfolios/:id" element={
        <ProtectedRoute>
          <Layout>
            <PortfolioDetail />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/portfolios/:portfolioId/add-asset" element={
        <ProtectedRoute>
          <Layout>
            <AssetForm />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/assets/edit/:assetId" element={
        <ProtectedRoute>
          <Layout>
            <AssetForm />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/assets/:assetId/alerts" element={
        <ProtectedRoute>
          <Layout>
            <AssetAlerts />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/alerts" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold">Alerts Dashboard</h2>
              <p className="mt-2 text-gray-600">Coming soon...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
