/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home/Home';
import { Dashboards } from './pages/DashboardList/Dashboards';
import { Charts } from './pages/Charts/Charts';
import { SqlLab } from './pages/SqlLab/SqlLab';
import { DatasetsExplorer } from './pages/Datasets/DatasetsExplorer';
import { Datasets as DatasetDetail } from './pages/Datasets/Datasets';
import { DatasetWizard } from './features/data-sources/DatasetWizard';
import { PhysicalDatasetWizard } from './features/data-sources/PhysicalDatasetWizard';
import { PhysicalDatasetEdit } from './features/data-sources/PhysicalDatasetEdit';
import { ChartEditor } from './features/visualization-editor/ChartEditor';
import { ChartSelector } from './features/visualization-editor/ChartSelector';
import { DashboardDetail } from './pages/DashboardList/DashboardDetail';
import { DashboardEditor } from './pages/DashboardEditor/DashboardEditor';
import { Admin } from './pages/Admin/Admin';
import { Documentation } from './pages/Documentation/Documentation';
import { Login } from './pages/Login/Login';
import { Toaster } from 'sonner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

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
          <Route path="/dashboards/:id" element={<DashboardDetail />} />
          <Route path="/dashboard-editor" element={<DashboardEditor />} />
          <Route path="/dashboard-editor/:id" element={<DashboardEditor />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/sql-lab" element={<SqlLab />} />
          <Route path="/datasets" element={<DatasetsExplorer />} />
          <Route path="/datasets/new" element={<DatasetWizard />} />
          <Route path="/datasets/new/physical" element={<PhysicalDatasetWizard />} />
          <Route path="/datasets/:id" element={<DatasetDetail />} />
          <Route path="/datasets/edit/:id" element={<PhysicalDatasetEdit />} />
          <Route path="/chart/add" element={<ChartSelector />} />
          <Route path="/chart-editor" element={<ChartEditor />} />
          <Route path="/chart-editor/:id" element={<ChartEditor />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
