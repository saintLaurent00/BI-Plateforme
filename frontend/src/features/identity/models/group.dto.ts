import { UserDTO } from './user.dto';

export interface Group {
  id: string | number;
  name: string;
  description?: string;
  members_count?: number;
  members?: UserDTO[];
  permissions?: string[];
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  branch?: string;
  leader_name?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface GroupDTO extends Group {}

export interface CreateGroupDTO {
  name: string;
  description?: string;
  member_ids?: (string | number)[];
  permissions?: string[];
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  branch?: string;
  leader_name?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface UpdateGroupDTO {
  id: string | number;
  name?: string;
  description?: string;
  member_ids?: (string | number)[];
  permissions?: string[];
  department?: string;
  section?: string;
  region?: string;
  zone?: string;
  branch?: string;
  leader_name?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface GroupMemberDTO {
  group_id: string | number;
  user_id: string | number;
  role_in_group?: 'Leader' | 'Member';
  section?: string;
  region?: string;
  added_at?: string;
  [key: string]: any;
}
