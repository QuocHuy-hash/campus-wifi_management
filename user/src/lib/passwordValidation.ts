import i18n from "@/i18n";

export interface PasswordRule {
  key: string;
  i18nKey: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    key: "minLength",
    i18nKey: "password.minLength",
    test: (p) => p.length >= 8,
  },
  {
    key: "uppercase",
    i18nKey: "password.uppercase",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    key: "lowercase",
    i18nKey: "password.lowercase",
    test: (p) => /[a-z]/.test(p),
  },
  {
    key: "digit",
    i18nKey: "password.digit",
    test: (p) => /[0-9]/.test(p),
  },
  {
    key: "specialChar",
    i18nKey: "password.specialChar",
    test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export function translatePasswordRule(rule: PasswordRule): string {
  return i18n.t(rule.i18nKey);
}

export function validatePassword(password: string): string | null {
  if (!password) return i18n.t("password.enterPassword");
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      if (rule.key === "minLength") return i18n.t("password.minLengthError");
      return i18n.t("password.requireRuleError", {
        rule: translatePasswordRule(rule).toLowerCase(),
      });
    }
  }
  return null;
}

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password));
}

export function getPasswordErrors(password: string): string[] {
  return PASSWORD_RULES.filter((r) => !r.test(password)).map((r) =>
    i18n.t(r.i18nKey),
  );
}