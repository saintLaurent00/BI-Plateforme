export type ReportFormat = 'pdf' | 'csv' | 'png';

export interface Report {
  id: string;
  name: string;
  description?: string;
  schedule: string;
  recipients: string[];
  format: ReportFormat;
  active: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  ownerIds: string[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}