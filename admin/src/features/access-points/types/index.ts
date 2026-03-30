/**
 * Access Point and Controller types matching the API response
 */

export interface AP {
  id?: number;
  apName: string;
  macAddress: string;
  modelName: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  // For map and filtering
  building?: string;
  campusId?: number;
  buildingId?: number;
  locationId?: number;
  // For monitoring
  controller?: string;
  clients?: number;
  usage?: number;
  status?: "Online" | "Offline" | "Warning";
}

export interface Controller {
  id?: number;
  nasIdentifier: string;
  macAddress: string;
  ipAddress: string;
  version: string;
  status: "Online" | "Offline" | "Warning";
  location?: string;
  campusId?: number;
  // Computed fields
  apCount?: number;
  totalClients?: number;
}
