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
  INACTIVE: 'Không hoạt động',
  PENDING: 'Không hoạt động',
  SUSPENDED: 'Không hoạt động',
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
  INACTIVE: 'bg-slate-100 text-slate-800',
};

const USER_ROLE_ALIASES: Record<string, string> = {
  USER: 'STUDENT',
  STAFF: 'STAFF_TEACHER',
  GUEST: 'CLIENT',
  TEACHER: 'STAFF_TEACHER',
  LECTURER: 'STAFF_TEACHER',
};

const normalizeUserRole = (role: string): string => {
  const normalizedRole = role?.trim().toUpperCase().replace(/[\s-]+/g, '_');
  return USER_ROLE_ALIASES[normalizedRole] || normalizedRole;
};

const normalizeUserStatus = (status: string): 'ACTIVE' | 'INACTIVE' => {
  const normalizedStatus = status?.trim().toUpperCase().replace(/[\s-]+/g, '_');
  const activeStatuses = new Set(['ACTIVE', 'ENABLED', 'ONLINE']);
  return activeStatuses.has(normalizedStatus) ? 'ACTIVE' : 'INACTIVE';
};

export const getUserRoleBadgeClass = (role: string): string => {
  const canonicalRole = normalizeUserRole(role);
  return USER_ROLE_BADGE_CLASSES[canonicalRole] || 'bg-slate-100 text-slate-800';
};

export const getUserRoleLabel = (role: string): string => {
  const canonicalRole = normalizeUserRole(role);
  return USER_ROLE_LABELS[canonicalRole] || role;
};

export const getUserStatusLabel = (status: string): string => {
  const normalizedStatus = normalizeUserStatus(status);
  return ACCOUNT_STATUS_LABELS[normalizedStatus] || 'Không hoạt động';
};

export const getUserStatusBadgeClass = (status: string): string => {
  const normalizedStatus = normalizeUserStatus(status);
  return USER_STATUS_BADGE_CLASSES[normalizedStatus] || 'bg-slate-100 text-slate-800';
};
