import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      dispatch(updateCampusThunk({ id: selectedCampus.id, data: campusForm as Campus }));
    } else {
      dispatch(createCampusThunk(campusForm as Campus));
    }
    closeCampusDialogs();
  };

  // Handlers - Building
  const handleSaveBuilding = () => {
    if (editBuildingDialogOpen && selectedBuilding) {
      dispatch(updateBuildingThunk({ id: selectedBuilding.id, data: buildingForm as Building }));
    } else {
      dispatch(createBuildingThunk(buildingForm as Building));
    }
    closeBuildingDialogs();
  };

  // Handlers - Location
  const handleSaveLocation = () => {
    if (editLocationDialogOpen && selectedLocation) {
      dispatch(updateLocationThunk({ id: selectedLocation.id, data: locationForm as Location }));
    } else {
      dispatch(createLocationThunk(locationForm as Location));
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
          <DialogFooter><Button variant="outline" onClick={closeCampusDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(deleteCampusThunk(selectedCampus!.id)); closeCampusDialogs(); }}>Xóa</Button></DialogFooter>
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
            <Input type="number" placeholder="Số tầng" value={buildingForm.totalFloors || ''} onChange={e => setBuildingForm({...buildingForm, totalFloors: Number(e.target.value)})} />
            <Input placeholder="Mô tả" value={buildingForm.description || ''} onChange={e => setBuildingForm({...buildingForm, description: e.target.value})} />
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
          <DialogFooter><Button variant="outline" onClick={closeBuildingDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(deleteBuildingThunk(selectedBuilding!.id)); closeBuildingDialogs(); }}>Xóa</Button></DialogFooter>
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
            <Input type="number" placeholder="Tầng (VD: 1)" value={locationForm.floorNumber || ''} onChange={e => setLocationForm({...locationForm, floorNumber: Number(e.target.value)})} />
            <Input placeholder="Mô tả (Optional)" value={locationForm.description || ''} onChange={e => setLocationForm({...locationForm, description: e.target.value})} />
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
          <DialogFooter><Button variant="outline" onClick={closeLocationDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(deleteLocationThunk(selectedLocation!.id)); closeLocationDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
