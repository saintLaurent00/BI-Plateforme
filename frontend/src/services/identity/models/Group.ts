export interface Group {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  roleIds: string[];
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  branch?: string;
  leaderUserId?: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  memberIds?: string[];
  roleIds?: string[];
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  branch?: string;
  leaderUserId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}