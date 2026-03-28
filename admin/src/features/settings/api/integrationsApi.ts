import { IamConnection, RadiusConfig, CaptivePortalConfig } from '../types';

const INITIAL_IAM: IamConnection[] = [
  { id: 1, name: 'Google Workspace HCMUS', type: 'Google Workspace', endpointUrl: 'https://accounts.google.com/o/saml2/idp', clientId: 'hcmus-wifi-auth', clientSecret: '******', status: 'Active', appliedAPs: ['AP_GiangDuong_A', 'AP_GiangDuong_B'] },
  { id: 2, name: 'SV HCMUS Azure AD', type: 'Microsoft Azure AD', endpointUrl: 'https://login.microsoftonline.com/hcmus.edu.vn/saml2', clientId: 'azure-student-auth', clientSecret: '******', status: 'Inactive' },
];

const INITIAL_RADIUS: RadiusConfig[] = [
  { id: 1, switchName: 'Core-Switch-A', radiusServer: '192.168.1.5', port: 1812, secretKey: '******', protocol: 'RADIUS' },
  { id: 2, switchName: 'Dist-Switch-Lib', radiusServer: '192.168.2.10', port: 1812, secretKey: '******', protocol: 'TACACS' },
];

const INITIAL_PORTALS: CaptivePortalConfig[] = [
  { id: 1, deviceName: 'Guest-WiFi-Controller', portalUrl: 'https://guest.hcmus.edu.vn/login', isEnabled: true },
  { id: 2, deviceName: 'Library-AP-Group', portalUrl: 'https://lib.hcmus.edu.vn/auth', isEnabled: false },
];

const INITIAL_IPS = ['192.168.1.10', '192.168.1.15', '10.0.0.50/24'];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const integrationsApi = {
  getIamConnections: async (): Promise<IamConnection[]> => { await delay(300); return [...INITIAL_IAM]; },
  getRadiusConfigs: async (): Promise<RadiusConfig[]> => { await delay(300); return [...INITIAL_RADIUS]; },
  getCaptivePortals: async (): Promise<CaptivePortalConfig[]> => { await delay(300); return [...INITIAL_PORTALS]; },
  getAllowedIps: async (): Promise<string[]> => { await delay(200); return [...INITIAL_IPS]; }
};
