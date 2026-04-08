import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AppDispatch, RootState } from '../../../../stores/store';
import { setLogDetailDialogOpen, setSelectedLog } from '../../slices/logsSlice';
import { formatDate, formatDateTime } from '@/utils/dateTimeFormat';

export const LogsDialogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logDetailDialogOpen, selectedLog } = useSelector((state: RootState) => state.settings.logs);

  const closeDialog = () => {
    dispatch(setLogDetailDialogOpen(false));
    dispatch(setSelectedLog(null));
  };

  return (
    <Dialog open={logDetailDialogOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết Nhật ký Hệ thống</DialogTitle>
        </DialogHeader>
        {selectedLog && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="text-right text-sm font-medium text-gray-500">Thời gian:</div>
              <div className="col-span-3 text-sm font-mono text-gray-900 border bg-gray-50 p-2 rounded">{formatDateTime(selectedLog.timestamp)}</div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="text-right text-sm font-medium text-gray-500">Người dùng:</div>
              <div className="col-span-3 text-sm text-gray-900 font-semibold">{selectedLog.user}</div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="text-right text-sm font-medium text-gray-500">Loại:</div>
              <div className="col-span-3">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                  selectedLog.type === 'access' ? 'bg-blue-100 text-blue-800' :
                  selectedLog.type === 'error' ? 'bg-red-100 text-red-800' :
                  selectedLog.type === 'config' ? 'bg-amber-100 text-amber-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedLog.type}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="text-right text-sm font-medium text-gray-500">Hành động:</div>
              <div className="col-span-3 text-sm text-gray-900">{selectedLog.action}</div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="text-right text-sm font-medium text-gray-500">Chi tiết kỹ thuật:</div>
              <div className="col-span-3">
                 <pre className="text-xs font-mono text-gray-800 bg-gray-100 p-3 rounded-md w-full whitespace-pre-wrap mt-1 border border-gray-200">
                    {selectedLog.details}
                 </pre>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
