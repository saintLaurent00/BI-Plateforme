export type AccessSubjectType = 'user' | 'group' | 'role';

export interface AccessSubject {
  type: AccessSubjectType;
  id: string;
}

export interface ResourceAccess {
  editors: AccessSubject[];
  viewers: AccessSubject[];
}