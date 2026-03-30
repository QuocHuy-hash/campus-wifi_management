import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDispatch, RootState } from '../../../../stores/store';
import {
  setAddControllerDialogOpen, setEditControllerDialogOpen, setDeleteControllerDialogOpen, setSelectedController,
  createControllerThunk, updateControllerThunk, deleteControllerThunk,
  setAddAPDialogOpen, setEditAPDialogOpen, setDeleteAPDialogOpen, setSelectedAP,
  createAPThunk, updateAPThunk, deleteAPThunk
} from '../../slices/devicesSlice';
import { Controller, AP } from '../../types';

export const DevicesDialogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    controllers, aps,
    addControllerDialogOpen, editControllerDialogOpen, deleteControllerDialogOpen, selectedController,
    addAPDialogOpen, editAPDialogOpen, deleteAPDialogOpen, selectedAP
  } = useSelector((state: RootState) => state.settings.devices);
  const { campuses, buildings } = useSelector((state: RootState) => state.settings.areas);

  const [controllerForm, setControllerForm] = useState<Partial<Controller & { macAddress?: string }>>(({ status: 'Online' }) as any);
  // Form AP dùng đúng các trường Backend: macAddress, apName, locationId, modelName
  const [apForm, setAPForm] = useState<Partial<AP>>({});

  useEffect(() => {
    if (editControllerDialogOpen && selectedController) setControllerForm(selectedController);
    else if (addControllerDialogOpen) setControllerForm({ status: 'Online' });
  }, [editControllerDialogOpen, addControllerDialogOpen, selectedController]);

  useEffect(() => {
    if (editAPDialogOpen && selectedAP) setAPForm(selectedAP);
    // Reset form khi mở dialog thêm mới
    else if (addAPDialogOpen) setAPForm({});
  }, [editAPDialogOpen, addAPDialogOpen, selectedAP]);

  const closeControllerDialogs = () => { dispatch(setAddControllerDialogOpen(false)); dispatch(setEditControllerDialogOpen(false)); dispatch(setDeleteControllerDialogOpen(false)); dispatch(setSelectedController(null)); };
  const closeAPDialogs = () => { dispatch(setAddAPDialogOpen(false)); dispatch(setEditAPDialogOpen(false)); dispatch(setDeleteAPDialogOpen(false)); dispatch(setSelectedAP(null)); };

  const handleSaveController = () => {
    if (editControllerDialogOpen && selectedController) dispatch(updateControllerThunk({ id: selectedController.id, data: controllerForm as Controller }));
    else dispatch(createControllerThunk(controllerForm as Controller));
    closeControllerDialogs();
  };

  const handleSaveAP = () => {
    // AP dùng macAddress làm ID thay vì số nước
    if (editAPDialogOpen && selectedAP) dispatch(updateAPThunk({ id: selectedAP.macAddress as unknown as number, data: apForm as AP }));
    else dispatch(createAPThunk(apForm as AP));
    closeAPDialogs();
  };

  return (
    <>
      <Dialog open={addControllerDialogOpen || editControllerDialogOpen} onOpenChange={closeControllerDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editControllerDialogOpen ? 'Sửa Controller' : 'Thêm Controller'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="NAS Identifier / Tên Controller" value={controllerForm.nasIdentifier || ''} onChange={e => setControllerForm({...controllerForm, nasIdentifier: e.target.value})} />
            <Input placeholder="IP Address" value={controllerForm.ipAddress || ''} onChange={e => setControllerForm({...controllerForm, ipAddress: e.target.value})} />
            <Select value={String(controllerForm.campusId || '')} onValueChange={v => setControllerForm({...controllerForm, campusId: Number(v)})}>
              <SelectTrigger><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
              <SelectContent>
                {campuses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Mã MAC" value={controllerForm.macAddress || ''} onChange={e => setControllerForm({...controllerForm, macAddress: e.target.value})} />
          </div>
          <DialogFooter><Button variant="outline" onClick={closeControllerDialogs}>Hủy</Button><Button onClick={handleSaveController} className="bg-blue-600">Lưu</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteControllerDialogOpen} onOpenChange={closeControllerDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-500">Xóa Controller</DialogTitle></DialogHeader>
          <p>Xác nhận xóa {selectedController?.nasIdentifier}?</p>
          <DialogFooter><Button variant="outline" onClick={closeControllerDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(deleteControllerThunk(selectedController!.id)); closeControllerDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* APs */}
      <Dialog open={addAPDialogOpen || editAPDialogOpen} onOpenChange={closeAPDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editAPDialogOpen ? 'Sửa Access Point' : 'Thêm Access Point'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            {/* MAC Address là ID chính - cài đặt cố định khi sửa */}
            <Input placeholder="MAC Address (VD: AA:BB:CC:11:22:33)" value={apForm.macAddress || ''} disabled={editAPDialogOpen} onChange={e => setAPForm({...apForm, macAddress: e.target.value})} />
            <Input placeholder="Tên AP (VD: AP_Sảnh_Chờ)" value={apForm.apName || ''} onChange={e => setAPForm({...apForm, apName: e.target.value})} />
            <Input placeholder="Tên Model (VD: Aruba-AP-515)" value={apForm.modelName || ''} onChange={e => setAPForm({...apForm, modelName: e.target.value})} />
            <Input type="number" placeholder="Location ID" value={apForm.locationId || ''} onChange={e => setAPForm({...apForm, locationId: Number(e.target.value)})} />
            <Input placeholder="Mô tả" value={apForm.description || ''} onChange={e => setAPForm({...apForm, description: e.target.value})} />
          </div>
          <DialogFooter><Button variant="outline" onClick={closeAPDialogs}>Hủy</Button><Button onClick={handleSaveAP} className="bg-blue-600">Lưu</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteAPDialogOpen} onOpenChange={closeAPDialogs}>
         <DialogContent>
          <DialogHeader><DialogTitle className="text-red-500">Xóa Access Point</DialogTitle></DialogHeader>
          <p>Xác nhận xóa AP: <strong>{selectedAP?.apName}</strong>?</p>
          <DialogFooter><Button variant="outline" onClick={closeAPDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(deleteAPThunk(selectedAP!.macAddress as unknown as number)); closeAPDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
