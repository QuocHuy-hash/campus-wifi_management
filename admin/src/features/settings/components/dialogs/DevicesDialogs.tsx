import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDispatch, RootState } from '../../../../stores/store';
import {
  setAddControllerDialogOpen, setEditControllerDialogOpen, setDeleteControllerDialogOpen, setSelectedController,
  createControllerThunk, updateControllerThunk, deleteControllerThunk,
  setAddAPDialogOpen, setEditAPDialogOpen, setDeleteAPDialogOpen, setSelectedAP,
  createAPThunk, updateAPThunk, deleteAPThunk
} from '../../slices/devicesSlice';
import { Controller, AP } from '../../types';

// Reusable labeled field wrapper
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid gap-1.5">
    <Label className="text-sm font-medium text-gray-700">{label}</Label>
    {children}
  </div>
);

export const DevicesDialogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    controllers, aps,
    addControllerDialogOpen, editControllerDialogOpen, deleteControllerDialogOpen, selectedController,
    addAPDialogOpen, editAPDialogOpen, deleteAPDialogOpen, selectedAP
  } = useSelector((state: RootState) => state.settings.devices);
  const { campuses, buildings, locations } = useSelector((state: RootState) => state.settings.areas);

  const [controllerForm, setControllerForm] = useState<Partial<Controller & { macAddress?: string; locationName?: string }>>(({ status: 'ONLINE' }) as any);
  const [apForm, setAPForm] = useState<Partial<AP>>({});

  // Filter locations: campusId → buildingIds → locations
  const filteredLocations = useMemo(() => {
    if (!controllerForm.campusId) return [];
    const campusBuildingIds = buildings
      .filter(b => b.campusId === controllerForm.campusId)
      .map(b => b.id);
    return locations.filter(l => campusBuildingIds.includes(l.buildingId));
  }, [controllerForm.campusId, buildings, locations]);

  useEffect(() => {
    if (editControllerDialogOpen && selectedController) setControllerForm(selectedController);
    else if (addControllerDialogOpen) setControllerForm({ status: 'ONLINE' });
  }, [editControllerDialogOpen, addControllerDialogOpen, selectedController]);

  useEffect(() => {
    if (editAPDialogOpen && selectedAP) setAPForm(selectedAP);
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
    if (editAPDialogOpen && selectedAP) dispatch(updateAPThunk({ id: selectedAP.macAddress as unknown as number, data: apForm as AP }));
    else dispatch(createAPThunk(apForm as AP));
    closeAPDialogs();
  };

  return (
    <>
      {/* ── Controller ── */}
      <Dialog open={addControllerDialogOpen || editControllerDialogOpen} onOpenChange={closeControllerDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editControllerDialogOpen ? 'Sửa Controller' : 'Thêm Controller'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Field label="NAS Identifier *">
              <Input placeholder="VD: HANOI_OFFICE_CTRL" value={controllerForm.nasIdentifier || ''} onChange={e => setControllerForm({...controllerForm, nasIdentifier: e.target.value})} />
            </Field>
            <Field label="IP Address">
              <Input placeholder="VD: 192.168.1.10" value={controllerForm.ipAddress || ''} onChange={e => setControllerForm({...controllerForm, ipAddress: e.target.value})} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Cơ sở">
                <Select value={String(controllerForm.campusId || '')} onValueChange={v => setControllerForm({...controllerForm, campusId: Number(v), locationName: ''})}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                  <SelectContent>
                    {campuses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Vị trí">
                <Select
                  value={controllerForm.locationName || ''}
                  onValueChange={v => setControllerForm({...controllerForm, locationName: v})}
                  disabled={!controllerForm.campusId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={controllerForm.campusId ? 'Chọn vị trí' : 'Chọn cơ sở trước'} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLocations.length === 0
                      ? <SelectItem value="__none" disabled>Không có vị trí nào</SelectItem>
                      : filteredLocations.map(l => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Mã MAC">
              <Input placeholder="VD: 09:0A:0B:0C:0D:0E" value={controllerForm.macAddress || ''} onChange={e => setControllerForm({...controllerForm, macAddress: e.target.value})} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeControllerDialogs}>Hủy</Button>
            <Button onClick={handleSaveController} className="bg-blue-600">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteControllerDialogOpen} onOpenChange={closeControllerDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-500">Xóa Controller</DialogTitle></DialogHeader>
          <p>Xác nhận xóa <strong>{selectedController?.nasIdentifier}</strong>?</p>
          <DialogFooter><Button variant="outline" onClick={closeControllerDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(deleteControllerThunk(selectedController!.id)); closeControllerDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Access Points ── */}
      <Dialog open={addAPDialogOpen || editAPDialogOpen} onOpenChange={closeAPDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editAPDialogOpen ? 'Sửa Access Point' : 'Thêm Access Point'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Field label="MAC Address *">
              <Input placeholder="VD: AA:BB:CC:11:22:33" value={apForm.macAddress || ''} disabled={editAPDialogOpen} onChange={e => setAPForm({...apForm, macAddress: e.target.value})} />
            </Field>
            <Field label="Tên AP *">
              <Input placeholder="VD: AP_Sảnh_Chờ" value={apForm.apName || ''} onChange={e => setAPForm({...apForm, apName: e.target.value})} />
            </Field>
            <Field label="Tên Model">
              <Input placeholder="VD: Aruba-AP-515" value={apForm.modelName || ''} onChange={e => setAPForm({...apForm, modelName: e.target.value})} />
            </Field>
            <Field label="Location ID">
              <Input type="number" placeholder="VD: 1" value={apForm.locationId || ''} onChange={e => setAPForm({...apForm, locationId: Number(e.target.value)})} />
            </Field>
            <Field label="Mô tả">
              <Input placeholder="Mô tả thêm (tùy chọn)" value={apForm.description || ''} onChange={e => setAPForm({...apForm, description: e.target.value})} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAPDialogs}>Hủy</Button>
            <Button onClick={handleSaveAP} className="bg-blue-600">Lưu</Button>
          </DialogFooter>
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
