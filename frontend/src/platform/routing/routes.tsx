import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Admin } from '@/services/identity/ui/admin/Admin';
import { Charts } from '@/services/visualization/ui/charts/Charts';
import { DashboardEditor } from '@/services/dashboard/ui/editor/DashboardEditor';
import { DashboardDetail } from '@/services/dashboard/ui/list/DashboardDetail';
import { Dashboards } from '@/services/dashboard/ui/list/Dashboards';
import { Datasets as DatasetDetail } from '@/services/data/ui/datasets/Datasets';
import { DatasetsExplorer } from '@/services/data/ui/datasets/DatasetsExplorer';
import { Documentation } from '@/ui/documentation/Documentation';
import { Home } from '@/services/dashboard/ui/home/Home';
import { Login } from '@/services/identity/ui/login/Login';
import { DatavizLab } from '@/services/visualization/ui/dataviz/DatavizLab';
import { SqlLab } from '@/services/exploration/ui/sql-lab/SqlLab';
import { DatasetWizard } from '@/services/data/ui/DatasetWizard';
import { PhysicalDatasetEdit } from '@/services/data/ui/PhysicalDatasetEdit';
import { PhysicalDatasetWizard } from '@/services/data/ui/PhysicalDatasetWizard';
import { ChartEditor } from '@/services/visualization/ui/editor/ChartEditor';
import { ChartSelector } from '@/services/visualization/ui/editor/ChartSelector';

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
