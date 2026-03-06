
interface SocialAuthButtonProps {
  provider: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  colorClass: string;
  bgClass: string;
  hoverClass: string;
  large?: boolean;
  label?: string;
}

export default function SocialAuthButton({
  provider,
  icon,
  onClick,
  disabled = false,
  colorClass,
  bgClass,
  hoverClass,
  large = false,
  label
}: SocialAuthButtonProps) {
  if (large) {
    return (
      <button 
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 ${hoverClass}`}
      >
        <img src={icon} alt={`${provider} logo`} className="w-6 h-6 object-contain" />
        <span className="text-base font-medium text-gray-700">{label || provider}</span>
      </button>
    );
  }

  return (
    <button 
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center rounded-xl disabled:opacity-50 ${hoverClass}`}
    >
      <div className={`w-10 h-10 ${bgClass} rounded-lg flex items-center justify-center`}>
        <img src={icon} alt={`${provider} logo`} className="w-6.5 h-6.5 object-contain" />
      </div>
      <span className="text-xs font-medium text-gray-700">{provider}</span>
    </button>
  );
}
