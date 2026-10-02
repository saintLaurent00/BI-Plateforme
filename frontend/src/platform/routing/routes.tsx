import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Documentation } from '@/ui/documentation/Documentation';
import { Admin, Login } from '@/services/identity';
import { Charts, ChartEditor, ChartSelector, DatavizLab, EChartsChart } from '@/services/visualization';
import { DashboardEditor, DashboardDetail, Dashboards, Home } from '@/services/dashboard';
import { Datasets as DatasetDetail, DatasetsExplorer, DatasetWizard, PhysicalDatasetEdit, PhysicalDatasetWizard } from '@/services/data';
import { SqlLab } from '@/services/exploration';

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
