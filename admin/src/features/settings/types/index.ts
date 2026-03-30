import { AP, Controller } from '../../../access-points/types';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'Active' | 'Locked';
  group: string;
  lastLogin?: string;
  accessTimeLimit?: string;
}

export interface Permission {
  resource: string;
  canView: boolean;
  canEdit: boolean;
}

export interface UserGroup {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Campus {
  id: number;
  name: string;
  code: string;
  address?: string;
  description?: string;
}

export interface Building {
  id: number;
  campusId: number;
  name: string;
  code: string;
  totalFloors: number;
  description?: string;
}

export interface Location {
  id: number;
  buildingId: number;
  name: string;
  code: string;
  floorNumber: number;
  description?: string;
}

export interface IamConnection {
  id: number;
  name: string;
  type: string;
  endpointUrl: string;
  clientId: string;
  clientSecret: string;
  status: 'Active' | 'Inactive' | 'Error';
  appliedAPs?: string[];
}

export interface RadiusConfig {
  id: number;
  switchName: string;
  radiusServer: string;
  port: number;
  secretKey: string;
  protocol: 'RADIUS' | 'TACACS';
}

export interface CaptivePortalConfig {
  id: number;
  deviceName: string;
  portalUrl: string;
  isEnabled: boolean;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  type: 'access' | 'error' | 'config' | 'account';
  details: string;
}

export type { AP, Controller };
