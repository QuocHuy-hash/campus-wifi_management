import { X, Wifi, Monitor, Globe, Clock, Hash } from 'lucide-react';
import i18n from '@/i18n';

interface CaptiveInfoPopupProps {
  id: string;
  ap: string;
  ssid: string;
  url: string;
  t?: string;
  onClose?: () => void;
}

export default function CaptiveInfoPopup({ id, ap, ssid, url, t, onClose }: CaptiveInfoPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Wifi size={20} />
            <h2 className="text-lg font-semibold">{i18n.t('common.captiveTitle')}</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Device ID */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Hash size={16} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">{i18n.t('common.captiveDeviceId')}</p>
              <p className="text-sm text-gray-800 font-mono break-all mt-0.5">{id || '—'}</p>
            </div>
          </div>

          {/* AP MAC */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Wifi size={16} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">{i18n.t('common.captiveApMac')}</p>
              <p className="text-sm text-gray-800 font-mono break-all mt-0.5">{ap || '—'}</p>
            </div>
          </div>

          {/* SSID */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Globe size={16} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">{i18n.t('common.captiveSsid')}</p>
              <p className="text-sm text-gray-800 font-semibold mt-0.5">{ssid || '—'}</p>
            </div>
          </div>

          {/* Redirect URL */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Monitor size={16} className="text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">{i18n.t('common.captiveRedirectUrl')}</p>
              <p className="text-sm text-gray-800 font-mono break-all mt-0.5">{url || '—'}</p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <Clock size={16} className="text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">{i18n.t('common.captiveTimestamp')}</p>
              <p className="text-sm text-gray-800 font-mono mt-0.5">{t || '—'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            {i18n.t('common.captiveFooter')}
          </p>
        </div>
      </div>
    </div>
  );
}
