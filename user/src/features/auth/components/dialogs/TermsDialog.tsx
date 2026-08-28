import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TermsDialogProps {
  open: boolean;
  sessionTimeoutHours: number;
  bandwidthRange: string;
  dailyQuota: string;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export default function TermsDialog({
  open,
  sessionTimeoutHours,
  bandwidthRange,
  dailyQuota,
  onOpenChange,
  onAccept,
}: TermsDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            {t('terms.title')}
          </DialogTitle>
          <DialogDescription>{t('terms.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm text-gray-600">
          <section>
            <h4 className="font-semibold text-gray-900 mb-2">{t('terms.general')}</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>{t('terms.freeWifi')}</li>
              <li>{t('terms.accountOwnerOnly')}</li>
              <li>{t('terms.noSharing')}</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">{t('terms.limits')}</h4>
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('terms.sessionDuration')}</span>
                <span className="font-semibold text-gray-900">{sessionTimeoutHours} {t('terms.hoursUnit')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('terms.bandwidth')}</span>
                <span className="font-semibold text-gray-900">{bandwidthRange} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('terms.dailyQuota')}</span>
                <span className="font-semibold text-gray-900">{dailyQuota}</span>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">{t('terms.prohibited')}</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>{t('terms.illegalContent')}</li>
              <li>{t('terms.networkAttacks')}</li>
              <li>{t('terms.piracy')}</li>
              <li>{t('terms.spamPhishing')}</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">{t('terms.violations')}</h4>
            <div className="bg-red-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>{t('terms.violationWarning')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>{t('terms.violation24h')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>{t('terms.violationPermanent')}</span>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={onAccept} className="bg-blue-600 hover:bg-blue-700">
            {t('terms.agreeContinue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
