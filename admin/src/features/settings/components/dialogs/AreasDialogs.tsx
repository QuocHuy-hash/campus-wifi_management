import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDispatch, RootState } from '../../../../stores/store';
import {
  setAddCampusDialogOpen, setEditCampusDialogOpen, setDeleteCampusDialogOpen, setSelectedCampus,
  createCampusThunk, updateCampusThunk, deleteCampusThunk,
  setAddBuildingDialogOpen, setEditBuildingDialogOpen, setDeleteBuildingDialogOpen, setSelectedBuilding,
  createBuildingThunk, updateBuildingThunk, deleteBuildingThunk,
  setAddLocationDialogOpen, setEditLocationDialogOpen, setDeleteLocationDialogOpen, setSelectedLocation,
  createLocationThunk, updateLocationThunk, deleteLocationThunk
} from '../../slices/areasSlice';
import { Campus, Building, Location } from '../../types';

// Reusable labeled field wrapper
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid gap-1.5">
    <Label className="text-sm font-medium text-gray-700">{label}</Label>
    {children}
  </div>
);

export const AreasDialogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    campuses, buildings, locations,
    addCampusDialogOpen, editCampusDialogOpen, deleteCampusDialogOpen, selectedCampus,
    addBuildingDialogOpen, editBuildingDialogOpen, deleteBuildingDialogOpen, selectedBuilding,
    addLocationDialogOpen, editLocationDialogOpen, deleteLocationDialogOpen, selectedLocation
  } = useSelector((state: RootState) => state.settings.areas);

  // States
  const [campusForm, setCampusForm] = useState<Partial<Campus>>({});
  const [buildingForm, setBuildingForm] = useState<Partial<Building>>({});
  const [locationForm, setLocationForm] = useState<Partial<Location>>({});
  // Local campus filter for Location dialog (not sent to API)
  const [locationCampusId, setLocationCampusId] = useState<number | null>(null);

  // Sync state
  useEffect(() => {
    if (editCampusDialogOpen && selectedCampus) setCampusForm(selectedCampus);
    else if (addCampusDialogOpen) setCampusForm({});
  }, [editCampusDialogOpen, addCampusDialogOpen, selectedCampus]);

  useEffect(() => {
    if (editBuildingDialogOpen && selectedBuilding) setBuildingForm(selectedBuilding);
    else if (addBuildingDialogOpen) setBuildingForm({});
  }, [editBuildingDialogOpen, addBuildingDialogOpen, selectedBuilding]);

  useEffect(() => {
    if (editLocationDialogOpen && selectedLocation) {
      setLocationForm(selectedLocation);
      // Pre-fill campus dropdown from building
      const building = buildings.find(b => b.id === selectedLocation.buildingId);
      setLocationCampusId(building?.campusId ?? null);
    } else if (addLocationDialogOpen) {
      setLocationForm({});
      setLocationCampusId(null);
    }
  }, [editLocationDialogOpen, addLocationDialogOpen, selectedLocation, buildings]);

  // Campus → Buildings filter for Location dialog
  const filteredBuildingsForLocation = useMemo(() => {
    if (!locationCampusId) return [];
    return buildings.filter(b => b.campusId === locationCampusId);
  }, [locationCampusId, buildings]);

  // Close handlers
  const closeCampusDialogs = () => { dispatch(setAddCampusDialogOpen(false)); dispatch(setEditCampusDialogOpen(false)); dispatch(setDeleteCampusDialogOpen(false)); dispatch(setSelectedCampus(null)); };
  const closeBuildingDialogs = () => { dispatch(setAddBuildingDialogOpen(false)); dispatch(setEditBuildingDialogOpen(false)); dispatch(setDeleteBuildingDialogOpen(false)); dispatch(setSelectedBuilding(null)); };
  const closeLocationDialogs = () => { dispatch(setAddLocationDialogOpen(false)); dispatch(setEditLocationDialogOpen(false)); dispatch(setDeleteLocationDialogOpen(false)); dispatch(setSelectedLocation(null)); };

  // Save handlers
  const handleSaveCampus = () => {
    if (editCampusDialogOpen && selectedCampus) dispatch(updateCampusThunk({ id: selectedCampus.id, data: campusForm as Campus }));
    else dispatch(createCampusThunk(campusForm as Campus));
    closeCampusDialogs();
  };

  const handleSaveBuilding = () => {
    if (editBuildingDialogOpen && selectedBuilding) dispatch(updateBuildingThunk({ id: selectedBuilding.id, data: buildingForm as Building }));
    else dispatch(createBuildingThunk(buildingForm as Building));
    closeBuildingDialogs();
  };

  const handleSaveLocation = () => {
    if (editLocationDialogOpen && selectedLocation) dispatch(updateLocationThunk({ id: selectedLocation.id, data: locationForm as Location }));
    else dispatch(createLocationThunk(locationForm as Location));
    closeLocationDialogs();
  };

  return (
    <>
      {/* ── Campus ── */}
      <Dialog open={addCampusDialogOpen || editCampusDialogOpen} onOpenChange={closeCampusDialogs}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{editCampusDialogOpen ? 'Sửa Cơ sở' : 'Thêm Cơ sở'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Field label="Tên cơ sở *">
              <Input placeholder="VD: Cơ sở Dĩ An" value={campusForm.name || ''} onChange={e => setCampusForm({...campusForm, name: e.target.value})} />
            </Field>
            <Field label="Mã cơ sở *">
              <Input placeholder="VD: NVC" value={campusForm.code || ''} onChange={e => setCampusForm({...campusForm, code: e.target.value})} />
            </Field>
            <Field label="Địa chỉ">
              <Input placeholder="VD: Khu phố 6, Dĩ An, Bình Dương" value={campusForm.address || ''} onChange={e => setCampusForm({...campusForm, address: e.target.value})} />
            </Field>
            <Field label="Mô tả">
              <Input placeholder="Mô tả thêm (tùy chọn)" value={campusForm.description || ''} onChange={e => setCampusForm({...campusForm, description: e.target.value})} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCampusDialogs}>Hủy</Button>
            <Button onClick={handleSaveCampus} disabled={!campusForm.name || !campusForm.code} className="bg-blue-600 hover:bg-blue-700">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteCampusDialogOpen} onOpenChange={closeCampusDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-500">Xóa Cơ sở</DialogTitle></DialogHeader>
          <p>Xác nhận xóa <strong>{selectedCampus?.name}</strong>?</p>
          <DialogFooter><Button variant="outline" onClick={closeCampusDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(deleteCampusThunk(selectedCampus!.id)); closeCampusDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Buildings ── */}
      <Dialog open={addBuildingDialogOpen || editBuildingDialogOpen} onOpenChange={closeBuildingDialogs}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{editBuildingDialogOpen ? 'Sửa Tòa nhà' : 'Thêm Tòa nhà'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Field label="Cơ sở *">
              <Select value={String(buildingForm.campusId || '')} onValueChange={v => setBuildingForm({...buildingForm, campusId: Number(v)})}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                <SelectContent>
                  {campuses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tên tòa nhà *">
              <Input placeholder="VD: Nhà A" value={buildingForm.name || ''} onChange={e => setBuildingForm({...buildingForm, name: e.target.value})} />
            </Field>
            <Field label="Mã tòa nhà *">
              <Input placeholder="VD: A, B, C" value={buildingForm.code || ''} onChange={e => setBuildingForm({...buildingForm, code: e.target.value})} />
            </Field>
            <Field label="Số tầng">
              <Input type="number" placeholder="VD: 5" value={buildingForm.totalFloors || ''} onChange={e => setBuildingForm({...buildingForm, totalFloors: Number(e.target.value)})} />
            </Field>
            <Field label="Mô tả">
              <Input placeholder="Mô tả thêm (tùy chọn)" value={buildingForm.description || ''} onChange={e => setBuildingForm({...buildingForm, description: e.target.value})} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeBuildingDialogs}>Hủy</Button>
            <Button onClick={handleSaveBuilding} disabled={!buildingForm.name || !buildingForm.campusId} className="bg-blue-600 hover:bg-blue-700">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteBuildingDialogOpen} onOpenChange={closeBuildingDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-500">Xóa Tòa nhà</DialogTitle></DialogHeader>
          <p>Xác nhận xóa <strong>{selectedBuilding?.name}</strong>?</p>
          <DialogFooter><Button variant="outline" onClick={closeBuildingDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(deleteBuildingThunk(selectedBuilding!.id)); closeBuildingDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Locations ── */}
      <Dialog open={addLocationDialogOpen || editLocationDialogOpen} onOpenChange={closeLocationDialogs}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{editLocationDialogOpen ? 'Sửa Địa điểm' : 'Thêm Địa điểm'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Campus → Building cascade */}
            <div className="grid grid-cols-2 gap-2">
              <Field label="Cơ sở *">
                <Select
                  value={String(locationCampusId || '')}
                  onValueChange={v => { setLocationCampusId(Number(v)); setLocationForm({...locationForm, buildingId: undefined}); }}
                >
                  <SelectTrigger className="w-full"><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                  <SelectContent>
                    {campuses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tòa nhà *">
                <Select
                  value={String(locationForm.buildingId || '')}
                  onValueChange={v => setLocationForm({...locationForm, buildingId: Number(v)})}
                  disabled={!locationCampusId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={locationCampusId ? 'Chọn tòa nhà' : 'Chọn cơ sở trước'} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBuildingsForLocation.length === 0
                      ? <SelectItem value="__none" disabled>Không có tòa nhà nào</SelectItem>
                      : filteredBuildingsForLocation.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Tên địa điểm *">
              <Input placeholder="VD: Hội trường A" value={locationForm.name || ''} onChange={e => setLocationForm({...locationForm, name: e.target.value})} />
            </Field>
            <Field label="Mã địa điểm *">
              <Input placeholder="VD: C31" value={locationForm.code || ''} onChange={e => setLocationForm({...locationForm, code: e.target.value})} />
            </Field>
            <Field label="Số tầng">
              <Input type="number" placeholder="VD: 1" value={locationForm.floorNumber || ''} onChange={e => setLocationForm({...locationForm, floorNumber: Number(e.target.value)})} />
            </Field>
            <Field label="Mô tả">
              <Input placeholder="Mô tả thêm (tùy chọn)" value={locationForm.description || ''} onChange={e => setLocationForm({...locationForm, description: e.target.value})} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeLocationDialogs}>Hủy</Button>
            <Button onClick={handleSaveLocation} disabled={!locationForm.name || !locationForm.buildingId} className="bg-blue-600 hover:bg-blue-700">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteLocationDialogOpen} onOpenChange={closeLocationDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-500">Xóa Địa điểm</DialogTitle></DialogHeader>
          <p>Xác nhận xóa <strong>{selectedLocation?.name}</strong>?</p>
          <DialogFooter><Button variant="outline" onClick={closeLocationDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(deleteLocationThunk(selectedLocation!.id)); closeLocationDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
