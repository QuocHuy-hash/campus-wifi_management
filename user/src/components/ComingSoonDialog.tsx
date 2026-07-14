"use client";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Construction } from 'lucide-react';

interface ComingSoonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ComingSoonDialog({ open, onOpenChange }: ComingSoonDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg  text-amber-500 flex items-center justify-center">
              <Construction size={18} />
            </div>
            <AlertDialogTitle>Tính năng đang phát triển</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm">
            Tính năng này hiện đang được phát triển và sẽ sớm ra mắt. Vui lòng quay lại sau.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
