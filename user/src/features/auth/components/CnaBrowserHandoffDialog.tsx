"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import CnaBrowserHandoff from "@/features/auth/components/CnaBrowserHandoff";
import type { CaptivePortalContext } from "@/features/auth/types";

interface CnaBrowserHandoffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: CaptivePortalContext;
  temporaryAccessStatus: "checking" | "ready" | "failed";
  temporaryAccessError: string;
}

/**
 * Bọc CnaBrowserHandoff trong Dialog/popup.
 * Hiển thị khi người dùng bấm "Đăng nhập bằng tài khoản" từ màn hình CNA.
 */
export default function CnaBrowserHandoffDialog({
  open,
  onOpenChange,
  context,
  temporaryAccessStatus,
  temporaryAccessError,
}: CnaBrowserHandoffDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
        <CnaBrowserHandoff
          context={context}
          temporaryAccessStatus={temporaryAccessStatus}
          temporaryAccessError={temporaryAccessError}
        />
      </DialogContent>
    </Dialog>
  );
}
