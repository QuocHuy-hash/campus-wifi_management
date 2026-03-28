import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDispatch, RootState } from '../../../../stores/store';
import {
  setAddControllerDialogOpen, setEditControllerDialogOpen, setDeleteControllerDialogOpen, setSelectedController, addController, updateController, removeController,
  setAddAPDialogOpen, setEditAPDialogOpen, setDeleteAPDialogOpen, setSelectedAP, addAP, updateAP, removeAP
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

  const [controllerForm, setControllerForm] = useState<Partial<Controller & { macAddress?: string }>>({ status: 'Online' });
  const [apForm, setAPForm] = useState<Partial<AP & { ipMode?: string; ip?: string }>>({ status: 'Online', ipMode: 'DHCP' });

  useEffect(() => {
    if (editControllerDialogOpen && selectedController) setControllerForm(selectedController);
    else if (addControllerDialogOpen) setControllerForm({ status: 'Online' });
  }, [editControllerDialogOpen, addControllerDialogOpen, selectedController]);

  useEffect(() => {
    if (editAPDialogOpen && selectedAP) setAPForm(selectedAP);
    else if (addAPDialogOpen) setAPForm({ status: 'Online', ipMode: 'DHCP' });
  }, [editAPDialogOpen, addAPDialogOpen, selectedAP]);

  const closeControllerDialogs = () => { dispatch(setAddControllerDialogOpen(false)); dispatch(setEditControllerDialogOpen(false)); dispatch(setDeleteControllerDialogOpen(false)); dispatch(setSelectedController(null)); };
  const closeAPDialogs = () => { dispatch(setAddAPDialogOpen(false)); dispatch(setEditAPDialogOpen(false)); dispatch(setDeleteAPDialogOpen(false)); dispatch(setSelectedAP(null)); };

  const handleSaveController = () => {
    if (editControllerDialogOpen && selectedController) dispatch(updateController(controllerForm as Controller));
    else dispatch(addController({ ...controllerForm, id: Math.max(0, ...controllers.map(c => c.id)) + 1 } as Controller));
    closeControllerDialogs();
  };

  const handleSaveAP = () => {
    if (editAPDialogOpen && selectedAP) dispatch(updateAP(apForm as AP));
    else dispatch(addAP({ ...apForm, id: Math.max(0, ...aps.map(a => a.id)) + 1 } as AP));
    closeAPDialogs();
  };

  return (
    <>
      <Dialog open={addControllerDialogOpen || editControllerDialogOpen} onOpenChange={closeControllerDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editControllerDialogOpen ? 'Sửa Controller' : 'Thêm Controller'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Tên Controller" value={controllerForm.name || ''} onChange={e => setControllerForm({...controllerForm, name: e.target.value})} />
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
          <p>Xác nhận xóa {selectedController?.name}?</p>
          <DialogFooter><Button variant="outline" onClick={closeControllerDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(removeController(selectedController!.id)); closeControllerDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* APs */}
      <Dialog open={addAPDialogOpen || editAPDialogOpen} onOpenChange={closeAPDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editAPDialogOpen ? 'Sửa Access Point' : 'Thêm Access Point'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Tên AP" value={apForm.name || ''} onChange={e => setAPForm({...apForm, name: e.target.value})} />
            <Input placeholder="IP (Optional)" value={apForm.ip || ''} onChange={e => setAPForm({...apForm, ip: e.target.value})} />
            <Select value={apForm.controller || ''} onValueChange={v => setAPForm({...apForm, controller: v})}>
              <SelectTrigger><SelectValue placeholder="Gán vào Controller" /></SelectTrigger>
              <SelectContent>
                {controllers.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={apForm.building || ''} onValueChange={v => setAPForm({...apForm, building: v})}>
              <SelectTrigger><SelectValue placeholder="Vị trí tòa nhà" /></SelectTrigger>
              <SelectContent>
                {buildings.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter><Button variant="outline" onClick={closeAPDialogs}>Hủy</Button><Button onClick={handleSaveAP} className="bg-blue-600">Lưu</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteAPDialogOpen} onOpenChange={closeAPDialogs}>
         <DialogContent>
          <DialogHeader><DialogTitle className="text-red-500">Xóa Access Point</DialogTitle></DialogHeader>
          <p>Xác nhận xóa {selectedAP?.name}?</p>
          <DialogFooter><Button variant="outline" onClick={closeAPDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(removeAP(selectedAP!.id)); closeAPDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
