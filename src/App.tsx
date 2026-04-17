/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboards } from './pages/Dashboards';
import { Charts } from './pages/Charts';
import { SqlLab } from './pages/SqlLab';
import { DatasetsExplorer } from './pages/DatasetsExplorer';
import { Datasets as DatasetDetail } from './pages/Datasets';
import { ChartEditor } from './pages/ChartEditor';
import { ChartSelector } from './pages/ChartSelector';
import { SimpleDashboardBuilder } from './features/dashboard/SimpleDashboardBuilder';
import { DashboardDetail } from './pages/DashboardDetail';
import { DashboardEditor } from './pages/DashboardEditor';
import { Admin } from './pages/Admin';
import { Documentation } from './pages/Documentation';
import { Login } from './pages/Login';
import { Toaster } from 'sonner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(true);

  // Simple login handler for demo purposes
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboards" element={<Dashboards />} />
          <Route path="/dashboard-builder" element={<SimpleDashboardBuilder />} />
          <Route path="/dashboards/:id" element={<DashboardDetail />} />
          <Route path="/dashboard-editor" element={<DashboardEditor />} />
          <Route path="/dashboard-editor/:id" element={<DashboardEditor />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/sql-lab" element={<SqlLab />} />
          <Route path="/datasets" element={<DatasetsExplorer />} />
          <Route path="/datasets/:id" element={<DatasetDetail />} />
          <Route path="/chart/add" element={<ChartSelector />} />
          <Route path="/chart-editor" element={<ChartEditor />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
