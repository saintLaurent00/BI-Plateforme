export interface Dashboard {
  id: string;
  title: string;
  owner: string;
  status: 'Published' | 'Draft' | 'Archived';
  lastModified: string;
  thumbnail?: string;
  tags: string[];
}

export interface Chart {
  id: string;
  title: string;
  type: string;
  dataset: string;
  owner: string;
  lastModified: string;
  thumbnail?: string;
}

export interface Dataset {
  id: string;
  name: string;
  type: 'Physical' | 'Virtual';
  healthScore: number;
  columns: number;
  metrics: number;
  owner: string;
}
