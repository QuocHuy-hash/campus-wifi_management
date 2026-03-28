import { AdminUser, UserGroup, Permission } from '../types';

const INITIAL_ADMINS: AdminUser[] = [
  { id: 1, username: 'admin_sys', email: 'admin@hcmus.edu.vn', role: 'System Admin', status: 'Active', group: 'Quản trị viên Hệ thống' },
  { id: 2, username: 'nv_tuyen', email: 'tuyen.nv@hcmus.edu.vn', role: 'Network Support', status: 'Active', group: 'Hỗ trợ Kỹ thuật' },
  { id: 3, username: 'lh_phong', email: 'phong.lh@hcmus.edu.vn', role: 'Security Auditor', status: 'Locked', group: 'Ban Thanh tra' },
];

const INITIAL_SYSTEM_ROLES = ['System Admin', 'Network Manager', 'Network Support', 'Security Auditor', 'Viewer'];

const INITIAL_GROUPS: UserGroup[] = [
  { id: 1, name: 'Quản trị viên Hệ thống', permissions: [{ resource: 'QuanLyAP', canView: true, canEdit: true }, { resource: 'QuanLyNguoiDung', canView: true, canEdit: true }] },
  { id: 2, name: 'Hỗ trợ Kỹ thuật', permissions: [{ resource: 'QuanLyAP', canView: true, canEdit: false }] },
];

const INITIAL_RESOURCES = ['QuanLyAP', 'QuanLyNguoiDung', 'SuaChinhSach', 'XemBaoCao', 'TruyCapTrucTiepController'];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const adminApi = {
  getAdmins: async (): Promise<AdminUser[]> => { await delay(300); return [...INITIAL_ADMINS]; },
  getRoles: async (): Promise<string[]> => { await delay(100); return [...INITIAL_SYSTEM_ROLES]; },
  getGroups: async (): Promise<UserGroup[]> => { await delay(300); return [...INITIAL_GROUPS]; },
  getResources: async (): Promise<string[]> => { await delay(100); return [...INITIAL_RESOURCES]; }
};
