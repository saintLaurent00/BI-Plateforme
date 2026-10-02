export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  status?: UserStatus;
  avatarUrl?: string;
  jobTitle?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  country?: string;
  city?: string;
  siteLocation?: string;
  branch?: string;
  managerName?: string;
  phone?: string;
  bio?: string;
  tags: string[];
  roleIds: string[];
  groupIds: string[];
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  roleIds?: string[];
  groupIds?: string[];
  active?: boolean;
  jobTitle?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  country?: string;
  city?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'firstName' | 'lastName'>> & {
  firstName?: string;
  lastName?: string;
  status?: UserStatus;
};