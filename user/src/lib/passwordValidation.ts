export interface PasswordRule {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    key: "minLength",
    label: "Tối thiểu 8 ký tự",
    test: (p) => p.length >= 8,
  },
  {
    key: "uppercase",
    label: "Chữ hoa (A-Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    key: "lowercase",
    label: "Chữ thường (a-z)",
    test: (p) => /[a-z]/.test(p),
  },
  {
    key: "digit",
    label: "Số (0-9)",
    test: (p) => /[0-9]/.test(p),
  },
  {
    key: "specialChar",
    label: "Ký tự đặc biệt (!@#$%^&*...)",
    test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export function validatePassword(password: string): string | null {
  if (!password) return "Vui lòng nhập mật khẩu";
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return `Mật khẩu phải có ít nhất 1 ${rule.label.toLowerCase()}`;
    }
  }
  return null;
}

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password));
}

export function getPasswordErrors(password: string): string[] {
  return PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.label);
}
