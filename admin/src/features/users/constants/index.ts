export const USER_DIALOG_KEYS = {
  VIEW: 'viewOpen',
  EDIT: 'editOpen',
  DELETE: 'deleteOpen',
  POLICY: 'policyOpen',
  ADD: 'addOpen',
} as const;

export const USER_ROLES = [
  'Quản trị hệ thống',
  'Giám sát an ninh',
  'Kỹ thuật viên',
  'Chủ tài khoản',
  'Sinh viên',
  'Cán bộ',
  'Khách',
] as const;

export const ACCOUNT_STATUSES = ['Active', 'Disabled'] as const;

export const USER_UI_TEXT = {
  LOADING_USERS: 'Đang tải danh sách người dùng...',
  EMPTY_USERS: 'Không tìm thấy người dùng nào',
  FILTER_ALL: 'Tất cả',
} as const;

const USER_ROLE_BADGE_CLASSES: Record<string, string> = {
  'Quản trị hệ thống': 'bg-red-100 text-red-800',
  'Giám sát an ninh': 'bg-indigo-100 text-indigo-800',
  'Kỹ thuật viên': 'bg-cyan-100 text-cyan-800',
  'Chủ tài khoản': 'bg-emerald-100 text-emerald-800',
  'Sinh viên': 'bg-blue-100 text-blue-800',
  'Cán bộ': 'bg-green-100 text-green-800',
  'Khách': 'bg-gray-100 text-gray-800',
};

export const getUserRoleBadgeClass = (role: string): string => {
  return USER_ROLE_BADGE_CLASSES[role] || 'bg-slate-100 text-slate-800';
};
