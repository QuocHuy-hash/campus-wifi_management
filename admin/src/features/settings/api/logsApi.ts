import { LogEntry } from '../types';

const INITIAL_LOGS: LogEntry[] = [
  { id: 1, timestamp: '2023-11-20 08:15:22', user: 'admin_sys', action: 'Đăng nhập thành công', type: 'access', details: 'IP: 192.168.1.45' },
  { id: 2, timestamp: '2023-11-20 09:30:11', user: 'nv_tuyen', action: 'Thay đổi cấu hình RADIUS Server', type: 'config', details: 'Đổi IP từ 192.168.1.2 sang 192.168.1.5 cho thiết bị Core-Switch-A' },
  { id: 3, timestamp: '2023-11-20 10:14:05', user: 'System', action: 'Cảnh báo: Kết nối IAM lỗi', type: 'error', details: 'Không thể kết nối tới Google Workspace IdP Endpoint sau 3 lần thử.' },
  { id: 4, timestamp: '2023-11-20 11:22:45', user: 'admin_sys', action: 'Khóa tài khoản', type: 'account', details: 'Khóa tài khoản lh_phong do vi phạm chính sách.' },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const logsApi = {
  getLogs: async (): Promise<LogEntry[]> => { await delay(300); return [...INITIAL_LOGS]; }
};
