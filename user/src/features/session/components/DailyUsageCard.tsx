"use client";

import { Card } from '@/components/ui/card';
import { Download, Upload, Activity } from 'lucide-react';
import { formatBytes } from '@/data/mockData';
import type { UserDailyUsage } from '@/features/auth/types';

interface DailyUsageCardProps {
  usage: UserDailyUsage;
  deviceCount: number;
}

export default function DailyUsageCard({ usage, deviceCount }: DailyUsageCardProps) {
  return (
    <Card className="mt-5 overflow-hidden border-border">
      <div className="p-4">
        <p className="text-xs font-semibold text-card-foreground mb-3">
          Thống kê sử dụng trong ngày
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
            <p className="text-[10.5px] text-muted-foreground flex items-center justify-center gap-1 mb-1">
              <Download size={12} className="text-blue-500" /> Download
            </p>
            <p className="text-sm font-medium text-card-foreground">
              {formatBytes(usage.totalDownloadBytes)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
            <p className="text-[10.5px] text-muted-foreground flex items-center justify-center gap-1 mb-1">
              <Upload size={12} className="text-green-500" /> Upload
            </p>
            <p className="text-sm font-medium text-card-foreground">
              {formatBytes(usage.totalUploadBytes)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
            <p className="text-[10.5px] text-muted-foreground flex items-center justify-center gap-1 mb-1">
              <Activity size={12} className="text-indigo-500" /> Tổng
            </p>
            <p className="text-sm font-medium text-card-foreground">
              {formatBytes(usage.totalBytes)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
