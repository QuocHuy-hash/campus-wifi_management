export const USER_DIALOG_KEYS = {
  VIEW: 'viewOpen',
  EDIT: 'editOpen',
  DELETE: 'deleteOpen',
  POLICY: 'policyOpen',
  ADD: 'addOpen',
} as const;

// V4: /api/v1/users?role= accepts these values
export const USER_ROLES = ['STUDENT', 'STAFF_TEACHER', 'CLIENT'] as const;
// V4: UserResponse status values
export const ACCOUNT_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Sinh viên',
  STAFF_TEACHER: 'Cán bộ/Giảng viên',
  CLIENT: 'Khách',
};

export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Vô hiệu hóa',
  PENDING: 'Chờ kích hoạt',
  SUSPENDED: 'Đã đình chỉ',
};

export const USER_UI_TEXT = {
  LOADING_USERS: 'Đang tải danh sách người dùng...',
  EMPTY_USERS: 'Không tìm thấy người dùng nào',
  FILTER_ALL: 'Tất cả',
} as const;

const USER_ROLE_BADGE_CLASSES: Record<string, string> = {
  STUDENT: 'bg-blue-100 text-blue-800',
  STAFF_TEACHER: 'bg-green-100 text-green-800',
  CLIENT: 'bg-gray-100 text-gray-800',
};

const USER_STATUS_BADGE_CLASSES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  DISABLED: 'bg-red-100 text-red-800',
  PENDING: 'bg-amber-100 text-amber-800',
  LOCKED: 'bg-slate-100 text-slate-800',
};

export const getUserRoleBadgeClass = (role: string): string => {
  return USER_ROLE_BADGE_CLASSES[role] || 'bg-slate-100 text-slate-800';
};

export const getUserRoleLabel = (role: string): string => {
  return USER_ROLE_LABELS[role] || role;
};

export const getUserStatusLabel = (status: string): string => {
  return ACCOUNT_STATUS_LABELS[status] || status;
};

export const getUserStatusBadgeClass = (status: string): string => {
  return USER_STATUS_BADGE_CLASSES[status] || 'bg-slate-100 text-slate-800';
};
