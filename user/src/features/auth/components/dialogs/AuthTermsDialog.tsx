import { formatBytes, qosPolicies } from '@/data/mockData';
import TermsDialog from '@/features/auth/components/dialogs/TermsDialog';

interface AuthTermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export default function AuthTermsDialog({
  open,
  onOpenChange,
  onAccept,
}: AuthTermsDialogProps) {
  const studentPolicy = qosPolicies.Student;

  return (
    <TermsDialog
      open={open}
      sessionTimeoutHours={studentPolicy.session_timeout / 3600}
      bandwidthRange={`${studentPolicy.bandwidth_limit}-${qosPolicies.Teacher.bandwidth_limit}`}
      dailyQuota={formatBytes(studentPolicy.quota_daily)}
      onOpenChange={onOpenChange}
      onAccept={onAccept}
    />
  );
}
