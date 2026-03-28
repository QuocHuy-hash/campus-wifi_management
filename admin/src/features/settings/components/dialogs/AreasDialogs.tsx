import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDispatch, RootState } from '../../../../stores/store';
import {
  setAddCampusDialogOpen, setEditCampusDialogOpen, setDeleteCampusDialogOpen, setSelectedCampus, addCampus, updateCampus, removeCampus,
  setAddBuildingDialogOpen, setEditBuildingDialogOpen, setDeleteBuildingDialogOpen, setSelectedBuilding, addBuilding, updateBuilding, removeBuilding,
  setAddLocationDialogOpen, setEditLocationDialogOpen, setDeleteLocationDialogOpen, setSelectedLocation, addLocation, updateLocation, removeLocation
} from '../../slices/areasSlice';
import { Campus, Building, Location } from '../../types';

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
    if (editLocationDialogOpen && selectedLocation) setLocationForm(selectedLocation);
    else if (addLocationDialogOpen) setLocationForm({});
  }, [editLocationDialogOpen, addLocationDialogOpen, selectedLocation]);

  // Handle Close All
  const closeCampusDialogs = () => { dispatch(setAddCampusDialogOpen(false)); dispatch(setEditCampusDialogOpen(false)); dispatch(setDeleteCampusDialogOpen(false)); dispatch(setSelectedCampus(null)); };
  const closeBuildingDialogs = () => { dispatch(setAddBuildingDialogOpen(false)); dispatch(setEditBuildingDialogOpen(false)); dispatch(setDeleteBuildingDialogOpen(false)); dispatch(setSelectedBuilding(null)); };
  const closeLocationDialogs = () => { dispatch(setAddLocationDialogOpen(false)); dispatch(setEditLocationDialogOpen(false)); dispatch(setDeleteLocationDialogOpen(false)); dispatch(setSelectedLocation(null)); };

  // Handlers - Campus
  const handleSaveCampus = () => {
    if (editCampusDialogOpen && selectedCampus) {
      dispatch(updateCampus(campusForm as Campus));
    } else {
      dispatch(addCampus({ ...campusForm, id: Math.max(0, ...campuses.map(c => c.id)) + 1 } as Campus));
    }
    closeCampusDialogs();
  };

  // Handlers - Building
  const handleSaveBuilding = () => {
    if (editBuildingDialogOpen && selectedBuilding) {
      dispatch(updateBuilding(buildingForm as Building));
    } else {
      dispatch(addBuilding({ ...buildingForm, id: Math.max(0, ...buildings.map(b => b.id)) + 1 } as Building));
    }
    closeBuildingDialogs();
  };

  // Handlers - Location
  const handleSaveLocation = () => {
    if (editLocationDialogOpen && selectedLocation) {
      dispatch(updateLocation(locationForm as Location));
    } else {
      dispatch(addLocation({ ...locationForm, id: Math.max(0, ...locations.map(l => l.id)) + 1 } as Location));
    }
    closeLocationDialogs();
  };

  return (
    <>
      {/* Campuses */}
      <Dialog open={addCampusDialogOpen || editCampusDialogOpen} onOpenChange={closeCampusDialogs}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{editCampusDialogOpen ? 'Sửa Cơ sở' : 'Thêm Cơ sở'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Tên cơ sở" value={campusForm.name || ''} onChange={e => setCampusForm({...campusForm, name: e.target.value})} />
            <Input placeholder="Mã cơ sở (VD: NVC)" value={campusForm.code || ''} onChange={e => setCampusForm({...campusForm, code: e.target.value})} />
            <Input placeholder="Địa chỉ" value={campusForm.address || ''} onChange={e => setCampusForm({...campusForm, address: e.target.value})} />
            <Input placeholder="Mô tả" value={campusForm.description || ''} onChange={e => setCampusForm({...campusForm, description: e.target.value})} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCampusDialogs}>Hủy</Button>
            <Button onClick={handleSaveCampus} disabled={!campusForm.name || !campusForm.code} className="bg-blue-600 hover:bg-blue-700">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteCampusDialogOpen} onOpenChange={closeCampusDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle>Xóa Cơ sở</DialogTitle></DialogHeader>
          <p>Xác nhận xóa {selectedCampus?.name}?</p>
          <DialogFooter><Button variant="outline" onClick={closeCampusDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(removeCampus(selectedCampus!.id)); closeCampusDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buildings */}
      <Dialog open={addBuildingDialogOpen || editBuildingDialogOpen} onOpenChange={closeBuildingDialogs}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{editBuildingDialogOpen ? 'Sửa Tòa nhà' : 'Thêm Tòa nhà'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={String(buildingForm.campusId || '')} onValueChange={v => setBuildingForm({...buildingForm, campusId: Number(v)})}>
              <SelectTrigger><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
              <SelectContent>
                {campuses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Tên tòa nhà" value={buildingForm.name || ''} onChange={e => setBuildingForm({...buildingForm, name: e.target.value})} />
            <Input placeholder="Mã tòa nhà (VD: C, E)" value={buildingForm.code || ''} onChange={e => setBuildingForm({...buildingForm, code: e.target.value})} />
            <Input type="number" placeholder="Số tầng" value={buildingForm.floors || ''} onChange={e => setBuildingForm({...buildingForm, floors: Number(e.target.value)})} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeBuildingDialogs}>Hủy</Button>
            <Button onClick={handleSaveBuilding} disabled={!buildingForm.name || !buildingForm.campusId} className="bg-blue-600 hover:bg-blue-700">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteBuildingDialogOpen} onOpenChange={closeBuildingDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle>Xóa Tòa nhà</DialogTitle></DialogHeader>
          <p>Xác nhận xóa {selectedBuilding?.name}?</p>
          <DialogFooter><Button variant="outline" onClick={closeBuildingDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(removeBuilding(selectedBuilding!.id)); closeBuildingDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Locations */}
      <Dialog open={addLocationDialogOpen || editLocationDialogOpen} onOpenChange={closeLocationDialogs}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{editLocationDialogOpen ? 'Sửa Địa điểm' : 'Thêm Địa điểm'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={String(locationForm.buildingId || '')} onValueChange={v => setLocationForm({...locationForm, buildingId: Number(v)})}>
              <SelectTrigger><SelectValue placeholder="Chọn tòa nhà" /></SelectTrigger>
              <SelectContent>
                {buildings.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Tên địa điểm" value={locationForm.name || ''} onChange={e => setLocationForm({...locationForm, name: e.target.value})} />
            <Input placeholder="Mã địa điểm (VD: C31)" value={locationForm.code || ''} onChange={e => setLocationForm({...locationForm, code: e.target.value})} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeLocationDialogs}>Hủy</Button>
            <Button onClick={handleSaveLocation} disabled={!locationForm.name || !locationForm.buildingId} className="bg-blue-600 hover:bg-blue-700">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteLocationDialogOpen} onOpenChange={closeLocationDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle>Xóa Địa điểm</DialogTitle></DialogHeader>
          <p>Xác nhận xóa {selectedLocation?.name}?</p>
          <DialogFooter><Button variant="outline" onClick={closeLocationDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(removeLocation(selectedLocation!.id)); closeLocationDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
