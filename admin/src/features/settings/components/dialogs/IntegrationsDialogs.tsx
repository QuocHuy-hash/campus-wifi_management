import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDispatch, RootState } from '../../../../stores/store';
import {
  setAddIamDialogOpen, setEditIamDialogOpen, setDeleteIamDialogOpen, setSelectedIam, addIam, updateIam, removeIam
} from '../../slices/integrationsSlice';
import { IamConnection } from '../../types';

export const IntegrationsDialogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { iamConnections, addIamDialogOpen, editIamDialogOpen, deleteIamDialogOpen, selectedIam } = useSelector((state: RootState) => state.settings.integrations);

  const [form, setForm] = useState<Partial<IamConnection>>({ status: 'Active' });

  useEffect(() => {
    if (editIamDialogOpen && selectedIam) setForm(selectedIam);
    else if (addIamDialogOpen) setForm({ status: 'Active' });
  }, [editIamDialogOpen, addIamDialogOpen, selectedIam]);

  const closeDialogs = () => {
    dispatch(setAddIamDialogOpen(false));
    dispatch(setEditIamDialogOpen(false));
    dispatch(setDeleteIamDialogOpen(false));
    dispatch(setSelectedIam(null));
  };

  const handleSave = () => {
    if (editIamDialogOpen && selectedIam) {
      dispatch(updateIam(form as IamConnection));
    } else {
      dispatch(addIam({ ...form, id: Math.max(0, ...iamConnections.map(i => i.id)) + 1 } as IamConnection));
    }
    closeDialogs();
  };

  return (
    <>
      <Dialog open={addIamDialogOpen || editIamDialogOpen} onOpenChange={closeDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editIamDialogOpen ? 'Sửa Kết nối IAM' : 'Thêm Kết nối IAM'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Tên hiển thị" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
            <Select value={form.type || ''} onValueChange={v => setForm({...form, type: v})}>
              <SelectTrigger><SelectValue placeholder="Loại IdP" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Google Workspace">Google Workspace</SelectItem>
                <SelectItem value="Microsoft Azure AD">Microsoft Azure AD</SelectItem>
                <SelectItem value="Keycloak">Keycloak</SelectItem>
                <SelectItem value="Custom SAML 2.0">Custom SAML 2.0</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Endpoint URL" value={form.endpointUrl || ''} onChange={e => setForm({...form, endpointUrl: e.target.value})} />
            <Input placeholder="Client ID / Entity ID" value={form.clientId || ''} onChange={e => setForm({...form, clientId: e.target.value})} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Hủy</Button>
            <Button onClick={handleSave} className="bg-blue-600">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteIamDialogOpen} onOpenChange={closeDialogs}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-500">Xóa Kết nối IAM</DialogTitle></DialogHeader>
          <p>Xác nhận xóa {selectedIam?.name}?</p>
          <DialogFooter><Button variant="outline" onClick={closeDialogs}>Hủy</Button><Button variant="destructive" onClick={() => { dispatch(removeIam(selectedIam!.id)); closeDialogs(); }}>Xóa</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
