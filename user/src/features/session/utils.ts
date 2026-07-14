import { Smartphone, Laptop, Tablet, Monitor, type LucideIcon } from 'lucide-react';
import type { UserSession } from '@/features/auth/types';

const deviceIcons: Record<string, LucideIcon> = {
  MOBILE: Smartphone,
  SMARTPHONE: Smartphone,
  LAPTOP: Laptop,
  TABLET: Tablet,
  WATCH: Monitor,
};

export function getDeviceIcon(type: string | null): LucideIcon {
  return deviceIcons[type?.toUpperCase() ?? ''] ?? Monitor;
}

export function getDeviceIconStyle(type: string | null): string {
  switch (type?.toUpperCase()) {
    case 'MOBILE':
    case 'SMARTPHONE':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'LAPTOP':
      return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
    case 'TABLET':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'WATCH':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export function getActiveDuration(session: UserSession, now: number): number {
  return Math.floor((now - new Date(session.startTime).getTime()) / 1000);
}
