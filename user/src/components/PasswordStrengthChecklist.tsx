import { CheckCircle } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/passwordValidation";

export default function PasswordStrengthChecklist({
  password,
}: {
  password: string;
}) {
  if (!password) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
      <p className="text-xs font-medium text-gray-700">Yêu cầu mật khẩu:</p>
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <div
              key={rule.key}
              className={`flex items-center gap-1.5 ${
                rule.key === "specialChar" ? "col-span-2" : ""
              } ${passed ? "text-green-600" : "text-gray-400"}`}
            >
              {passed ? (
                <CheckCircle size={12} />
              ) : (
                <div className="w-3 h-3 rounded-full border border-current" />
              )}
              <span>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
