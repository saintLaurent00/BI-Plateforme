import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Admin } from '../pages/Admin/Admin';
import { Charts } from '../pages/Charts/Charts';
import { DashboardEditor } from '../pages/DashboardEditor/DashboardEditor';
import { DashboardDetail } from '../pages/DashboardList/DashboardDetail';
import { Dashboards } from '../pages/DashboardList/Dashboards';
import { Datasets as DatasetDetail } from '../pages/Datasets/Datasets';
import { DatasetsExplorer } from '../pages/Datasets/DatasetsExplorer';
import { Documentation } from '../pages/Documentation/Documentation';
import { Home } from '../pages/Home/Home';
import { Login } from '../pages/Login/Login';
import { DatavizLab } from '../pages/DatavizLab/DatavizLab';
import { SqlLab } from '../pages/SqlLab/SqlLab';
import { DatasetWizard } from '../features/data-sources/DatasetWizard';
import { PhysicalDatasetEdit } from '../features/data-sources/PhysicalDatasetEdit';
import { PhysicalDatasetWizard } from '../features/data-sources/PhysicalDatasetWizard';
import { ChartEditor } from '../features/visualization-editor/ChartEditor';
import { ChartSelector } from '../features/visualization-editor/ChartSelector';

export function PublicRoutes({ onLogin }: { onLogin: () => void }) {
  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export function AuthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboards" element={<Dashboards />} />
      <Route path="/dashboards/:id" element={<DashboardDetail />} />
      <Route path="/dashboard-editor" element={<DashboardEditor />} />
      <Route path="/dashboard-editor/:id" element={<DashboardEditor />} />
      <Route path="/charts" element={<Charts />} />
      <Route path="/dataviz" element={<DatavizLab />} />
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
  );
}
