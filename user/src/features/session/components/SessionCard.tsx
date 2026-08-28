"use client";

import { Card } from '@/components/ui/card';
import { Download, Upload, Activity, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBytes, formatDurationShort } from '@/data/mockData';
import { getDeviceIcon, getDeviceIconStyle, getActiveDuration } from '../utils';
import type { UserSession } from '@/features/auth/types';

interface SessionCardProps {
  session: UserSession;
  isCurrentDevice: boolean;
  now: number;
  onLogout: (sessionId: string) => void;
}

export default function SessionCard({ session, isCurrentDevice, now, onLogout }: SessionCardProps) {
  const { t } = useTranslation();
  const Icon = getDeviceIcon(session.deviceUserInfo.deviceType);
  const iconStyle = getDeviceIconStyle(session.deviceUserInfo.deviceType);
  const duration = getActiveDuration(session, now);

  return (
    <Card className={`mb-2.5 overflow-hidden border-border ${isCurrentDevice ? 'ring-1 ring-primary/30' : ''}`}>
      <div className="p-2.5 space-y-2">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base flex-shrink-0 ${iconStyle}`}>
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-card-foreground truncate">
                {session.deviceUserInfo.deviceName}
              </span>
              {isCurrentDevice && (
                <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-normal whitespace-nowrap">
                  {t('session.thisDevice')}
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">{session.ssid}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400" />
            {formatDurationShort(duration)}
          </div>
        </div>

        <div className="flex gap-x-6 gap-y-1 text-[11px] text-muted-foreground font-mono py-2 border-t border-b border-border flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="text-muted-foreground/50">MAC</span>
            <b className="text-card-foreground font-medium">{session.deviceUserInfo.macAddress}</b>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-muted-foreground/50">IP</span>
            <b className="text-card-foreground font-medium">{session.ipAddress}</b>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-[10.5px] text-muted-foreground flex items-center justify-center gap-1 mb-0.5">
              <Download size={12} className="text-blue-500" /> Download
            </p>
            <p className="text-sm font-medium text-card-foreground">
              {formatBytes(session.downloadBytes)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10.5px] text-muted-foreground flex items-center justify-center gap-1 mb-0.5">
              <Upload size={12} className="text-green-500" /> Upload
            </p>
            <p className="text-sm font-medium text-card-foreground">
              {formatBytes(session.uploadBytes)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10.5px] text-muted-foreground flex items-center justify-center gap-1 mb-0.5">
              <Activity size={12} className="text-indigo-500" /> {t('common.total')}
            </p>
            <p className="text-sm font-medium text-card-foreground">
              {formatBytes(session.downloadBytes + session.uploadBytes)}
            </p>
          </div>
        </div>

        {!isCurrentDevice && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => onLogout(session.sessionId)}
              className="text-xs text-muted-foreground flex items-center gap-1.5 border border-border px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <LogOut size={13} /> {t('common.logout')}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
