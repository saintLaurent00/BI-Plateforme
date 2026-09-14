export type UserStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended';

export interface User {
  id: number | string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  active: boolean;
  avatar_url?: string;
  job_title?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  country?: string;
  city?: string;
  site_location?: string;
  branch?: string;
  manager_name?: string;
  phone?: string;
  bio?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  last_login?: string;
  status?: UserStatus;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface UserDTO extends User {}

export interface CreateUserDTO {
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  roles?: string[];
  group_ids?: (string | number)[];
  active?: boolean;
  job_title?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  country?: string;
  city?: string;
  site_location?: string;
  branch?: string;
  manager_name?: string;
  phone?: string;
  password?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface UpdateUserDTO {
  id: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  roles?: string[];
  group_ids?: (string | number)[];
  active?: boolean;
  status?: UserStatus;
  job_title?: string;
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  country?: string;
  city?: string;
  site_location?: string;
  branch?: string;
  manager_name?: string;
  phone?: string;
  bio?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface UserFilterDTO {
  search?: string;
  role?: string;
  status?: UserStatus;
  department?: string;
  section?: string;
  region?: string;
  group_id?: string | number;
  page?: number;
  limit?: number;
  [key: string]: any;
}
