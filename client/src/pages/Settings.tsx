import { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Lock, Database, Mail, Shield, Clock, Eye, Plus, Edit, Trash2, Users, Search, FileText, MapPin, Building2, Map, Server, Wifi, Globe, Key, Network, Cloud, Radio, Check, ChevronsUpDown, ShieldCheck, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Import types and mock data from centralized file
import {
  AdminUser,
  Permission,
  UserGroup,
  LogEntry,
  Campus,
  Building,
  initialAdminUsers,
  initialLogs,
  initialCampuses,
  initialBuildings,
  initialAPs,
  initialControllers,
  AP,
  Controller,
  systemRoles,
  userGroups,
  resourceList,
} from "@/data/mockData";

// New Interfaces for System Integration
interface IamConnection {
  id: number;
  name: string;
  type: 'Google Workspace' | 'Microsoft Azure AD' | 'IAM Broker';
  endpointUrl: string;
  clientId: string;
  clientSecret: string;
  appliedAPs: string[];
  status: 'Active' | 'Error' | 'Inactive';
}

interface RadiusConnection {
  id: number;
  switchName: string;
  radiusServer: string;
  secretKey: string;
  port: number;
  protocol: 'RADIUS' | 'TACACS';
}

interface CaptivePortalConfig {
  id: number;
  deviceName: string;
  portalUrl: string;
  isEnabled: boolean;
}

// Initial Mock Data for System Integration
const initialIamConnections: IamConnection[] = [
  {
    id: 1,
    name: 'HCMUS Workspace',
    type: 'Google Workspace',
    endpointUrl: 'https://accounts.google.com/o/oauth2/auth',
    clientId: '789...apps.googleusercontent.com',
    clientSecret: '*******',
    appliedAPs: ['AP-B1-01', 'AP-B1-02'],
    status: 'Active',
  },
  {
    id: 2,
    name: 'Azure AD Staff',
    type: 'Microsoft Azure AD',
    endpointUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    clientId: 'abc-123-xyz',
    clientSecret: '*******',
    appliedAPs: ['All'],
    status: 'Error',
  },
];

const initialRadiusConnections: RadiusConnection[] = [
  {
    id: 1,
    switchName: 'Core-Switch-I',
    radiusServer: '10.0.1.50',
    secretKey: '*******',
    port: 1812,
    protocol: 'RADIUS',
  },
];

const initialCaptivePortals: CaptivePortalConfig[] = [
  {
    id: 1,
    deviceName: 'WLC-Main-01',
    portalUrl: 'https://wifi-portal.hcmus.edu.vn/guest',
    isEnabled: true,
  },
  {
    id: 2,
    deviceName: 'AP-Guest-Zone',
    portalUrl: 'https://wifi-portal.hcmus.edu.vn/event',
    isEnabled: false,
  },
];

export default function Settings() {
  const searchString = useSearch();
  const [activeTab, setActiveTab] = useState('users');

  // Handle tab query parameter
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const tab = params.get('tab');
    if (tab && ['users', 'areas', 'security', 'access', 'technical', 'logs', 'devices'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchString]);
  
  // Data states
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [logs] = useState<LogEntry[]>(initialLogs);
  
  // Dialog states - Admin Users
  const [addAdminDialogOpen, setAddAdminDialogOpen] = useState(false);
  const [editAdminDialogOpen, setEditAdminDialogOpen] = useState(false);
  const [deleteAdminDialogOpen, setDeleteAdminDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [adminForm, setAdminForm] = useState<Partial<AdminUser>>({});
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  
  // Dialog states - Permission
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedGroupPermissions, setSelectedGroupPermissions] = useState<Permission[]>(
    resourceList.map(r => ({ resource: r, canView: false, canEdit: false }))
  );
  
  // Dialog states - Logs
  const [logDetailDialogOpen, setLogDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [logFilter, setLogFilter] = useState<string>('all');

  // Data states - Areas (Campus & Buildings)
  const [campuses, setCampuses] = useState<Campus[]>(initialCampuses);
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  
  // Dialog states - Campus
  const [addCampusDialogOpen, setAddCampusDialogOpen] = useState(false);
  const [editCampusDialogOpen, setEditCampusDialogOpen] = useState(false);
  const [deleteCampusDialogOpen, setDeleteCampusDialogOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [campusForm, setCampusForm] = useState<Partial<Campus>>({});
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<number | 'all'>('all');

  // Dialog states - Building
  const [addBuildingDialogOpen, setAddBuildingDialogOpen] = useState(false);
  const [editBuildingDialogOpen, setEditBuildingDialogOpen] = useState(false);
  const [deleteBuildingDialogOpen, setDeleteBuildingDialogOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildingForm, setBuildingForm] = useState<Partial<Building>>({});

  // Data states - Devices
  const [controllers, setControllers] = useState<Controller[]>(initialControllers);
  const [aps, setAPs] = useState<AP[]>(initialAPs);

  // Dialog states - Controller
  const [addControllerDialogOpen, setAddControllerDialogOpen] = useState(false);
  const [editControllerDialogOpen, setEditControllerDialogOpen] = useState(false);
  const [deleteControllerDialogOpen, setDeleteControllerDialogOpen] = useState(false);
  const [selectedController, setSelectedController] = useState<Controller | null>(null);
  const [controllerForm, setControllerForm] = useState<Partial<Controller>>({});

  // Dialog states - AP
  const [addAPDialogOpen, setAddAPDialogOpen] = useState(false);
  const [editAPDialogOpen, setEditAPDialogOpen] = useState(false);
  const [deleteAPDialogOpen, setDeleteAPDialogOpen] = useState(false);
  const [selectedAP, setSelectedAP] = useState<AP | null>(null);
  const [apForm, setAPForm] = useState<Partial<AP>>({});

  // Filtered data
  const filteredAdminUsers = adminUsers.filter(user =>
    user.username.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(adminSearchTerm.toLowerCase())
  );
  
  // Data states - System Integration
  const [iamConnections, setIamConnections] = useState<IamConnection[]>(initialIamConnections);
  const [radiusConnections, setRadiusConnections] = useState<RadiusConnection[]>(initialRadiusConnections);
  const [captivePortals, setCaptivePortals] = useState<CaptivePortalConfig[]>(initialCaptivePortals);

  // Dialog states - IAM
  const [addIamDialogOpen, setAddIamDialogOpen] = useState(false);
  const [editIamDialogOpen, setEditIamDialogOpen] = useState(false);
  const [deleteIamDialogOpen, setDeleteIamDialogOpen] = useState(false);
  const [selectedIam, setSelectedIam] = useState<IamConnection | null>(null);
  const [iamForm, setIamForm] = useState<Partial<IamConnection>>({});

  // Dialog states - RADIUS
  const [addRadiusDialogOpen, setAddRadiusDialogOpen] = useState(false);
  const [editRadiusDialogOpen, setEditRadiusDialogOpen] = useState(false);
  const [deleteRadiusDialogOpen, setDeleteRadiusDialogOpen] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<RadiusConnection | null>(null);
  const [radiusForm, setRadiusForm] = useState<Partial<RadiusConnection>>({});
  
  // Dialog states - Captive Portal
  const [addPortalDialogOpen, setAddPortalDialogOpen] = useState(false);
  const [editPortalDialogOpen, setEditPortalDialogOpen] = useState(false);
  const [deletePortalDialogOpen, setDeletePortalDialogOpen] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<CaptivePortalConfig | null>(null);
  const [portalForm, setPortalForm] = useState<Partial<CaptivePortalConfig>>({});
  
  // Data states - User Groups & Resources
  const [resources, setResources] = useState<string[]>(resourceList);
  const [groups, setGroups] = useState<UserGroup[]>(() => 
    userGroups.map((name, index) => ({
      id: index + 1,
      name,
      permissions: resourceList.map(r => ({ resource: r, canView: index < 2, canEdit: index === 0 }))
    }))
  );

  // Dialog states - Resources
  const [managePermissionsOpen, setManagePermissionsOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<string | null>(null);
  const [deleteResourceDialogOpen, setDeleteResourceDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState<{name: string}>({ name: '' });
  const [editResourceForm, setEditResourceForm] = useState<{name: string}>({ name: '' });

  // IP Restriction State
  const [allowedIps, setAllowedIps] = useState<string[]>(['192.168.1.0/24', '10.0.0.10']);
  const [newIp, setNewIp] = useState('');



  // Dialog states - User Groups
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [groupForm, setGroupForm] = useState<Partial<UserGroup>>({});
  
  const filteredLogs = logs.filter(log => logFilter === 'all' || log.type === logFilter);
  const filteredBuildings = selectedCampusFilter === 'all' 
    ? buildings 
    : buildings.filter(b => b.campusId === selectedCampusFilter);

  // Campus Handlers
  const handleAddCampus = () => {
    setCampusForm({});
    setAddCampusDialogOpen(true);
  };

  const handleEditCampus = (campus: Campus) => {
    setSelectedCampus(campus);
    setCampusForm({ ...campus });
    setEditCampusDialogOpen(true);
  };

  const handleDeleteCampus = (campus: Campus) => {
    setSelectedCampus(campus);
    setDeleteCampusDialogOpen(true);
  };

  const saveNewCampus = () => {
    const newCampus: Campus = {
      id: Math.max(...campuses.map(c => c.id), 0) + 1,
      name: campusForm.name || '',
      code: campusForm.code || '',
      address: campusForm.address || '',
      description: campusForm.description || '',
    };
    setCampuses([...campuses, newCampus]);
    setAddCampusDialogOpen(false);
    setCampusForm({});
  };

  const saveEditCampus = () => {
    if (selectedCampus) {
      setCampuses(campuses.map(c => c.id === selectedCampus.id ? { ...c, ...campusForm } as Campus : c));
    }
    setEditCampusDialogOpen(false);
    setSelectedCampus(null);
    setCampusForm({});
  };

  const confirmDeleteCampus = () => {
    if (selectedCampus) {
      // Also delete all buildings in this campus
      setBuildings(buildings.filter(b => b.campusId !== selectedCampus.id));
      setCampuses(campuses.filter(c => c.id !== selectedCampus.id));
    }
    setDeleteCampusDialogOpen(false);
    setSelectedCampus(null);
  };

  // Building Handlers
  const handleAddBuilding = () => {
    setBuildingForm({ campusId: selectedCampusFilter === 'all' ? campuses[0]?.id : selectedCampusFilter });
    setAddBuildingDialogOpen(true);
  };

  const handleEditBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setBuildingForm({ ...building });
    setEditBuildingDialogOpen(true);
  };

  const handleDeleteBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setDeleteBuildingDialogOpen(true);
  };

  const saveNewBuilding = () => {
    const newBuilding: Building = {
      id: Math.max(...buildings.map(b => b.id), 0) + 1,
      campusId: buildingForm.campusId || campuses[0]?.id || 1,
      name: buildingForm.name || '',
      code: buildingForm.code || '',
      floors: buildingForm.floors || 1,
      description: buildingForm.description || '',
    };
    setBuildings([...buildings, newBuilding]);
    setAddBuildingDialogOpen(false);
    setBuildingForm({});
  };

  const saveEditBuilding = () => {
    if (selectedBuilding) {
      setBuildings(buildings.map(b => b.id === selectedBuilding.id ? { ...b, ...buildingForm } as Building : b));
    }
    setEditBuildingDialogOpen(false);
    setSelectedBuilding(null);
    setBuildingForm({});
  };

  const confirmDeleteBuilding = () => {
    if (selectedBuilding) {
      setBuildings(buildings.filter(b => b.id !== selectedBuilding.id));
    }
    setDeleteBuildingDialogOpen(false);
    setSelectedBuilding(null);
  };

  const getCampusName = (campusId: number) => {
    return campuses.find(c => c.id === campusId)?.name || 'N/A';
  };

  const getBuildingCountByCampus = (campusId: number) => {
    return buildings.filter(b => b.campusId === campusId).length;
  };

  // Controller Handlers
  const handleAddController = () => {
    setControllerForm({ status: 'Online', apCount: 0, totalClients: 0 });
    setAddControllerDialogOpen(true);
  };

  const handleEditController = (controller: Controller) => {
    setSelectedController(controller);
    setControllerForm({ ...controller });
    setEditControllerDialogOpen(true);
  };

  const handleDeleteController = (controller: Controller) => {
    setSelectedController(controller);
    setDeleteControllerDialogOpen(true);
  };

  const saveNewController = () => {
    const newController: Controller = {
      id: Math.max(...controllers.map(c => c.id), 0) + 1,
      name: controllerForm.name || '',
      ipAddress: controllerForm.ipAddress || '',
      version: controllerForm.version || '',
      location: controllerForm.location || '',
      status: 'Online',
      apCount: 0,
      totalClients: 0,
      campusId: controllerForm.campusId,
    };
    setControllers([...controllers, newController]);
    setAddControllerDialogOpen(false);
    setControllerForm({});
  };

  const saveEditController = () => {
    if (selectedController) {
      setControllers(controllers.map(c => c.id === selectedController.id ? { ...c, ...controllerForm } as Controller : c));
    }
    setEditControllerDialogOpen(false);
    setSelectedController(null);
    setControllerForm({});
  };

  const confirmDeleteController = () => {
    if (selectedController) {
      setControllers(controllers.filter(c => c.id !== selectedController.id));
    }
    setDeleteControllerDialogOpen(false);
    setSelectedController(null);
  };

  // AP Handlers
  const handleAddAP = () => {
    setAPForm({ status: 'Online', usage: 0, clients: 0, usagePercent: 0 });
    setAddAPDialogOpen(true);
  };

  const handleEditAP = (ap: AP) => {
    setSelectedAP(ap);
    setAPForm({ ...ap });
    setEditAPDialogOpen(true);
  };

  const handleDeleteAP = (ap: AP) => {
    setSelectedAP(ap);
    setDeleteAPDialogOpen(true);
  };

  const saveNewAP = () => {
    const newAP: AP = {
      id: Math.max(...aps.map(a => a.id), 0) + 1,
      name: apForm.name || '',
      location: apForm.location || '',
      building: apForm.building || '',
      uptime: '0h',
      ipModel: apForm.ipModel || '',
      controller: apForm.controller || '',
      clients: 0,
      usage: 0,
      status: 'Online',
      usagePercent: 0,
    };
    setAPs([...aps, newAP]);
    setAddAPDialogOpen(false);
    setAPForm({});
  };

  const saveEditAP = () => {
    if (selectedAP) {
      setAPs(aps.map(a => a.id === selectedAP.id ? { ...a, ...apForm } as AP : a));
    }
    setEditAPDialogOpen(false);
    setSelectedAP(null);
    setAPForm({});
  };

  const confirmDeleteAP = () => {
    if (selectedAP) {
      setAPs(aps.filter(a => a.id !== selectedAP.id));
    }
    setDeleteAPDialogOpen(false);
    setSelectedAP(null);
  };

  // Admin User Handlers
  const handleAddAdmin = () => {
    setAdminForm({ status: 'Active', role: systemRoles[0], group: userGroups[0] });
    setAddAdminDialogOpen(true);
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setAdminForm({ ...admin });
    setEditAdminDialogOpen(true);
  };

  const handleDeleteAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setDeleteAdminDialogOpen(true);
  };

  const handleLockAdmin = (admin: AdminUser) => {
    setAdminUsers(adminUsers.map(u => 
      u.id === admin.id ? { ...u, status: u.status === 'Active' ? 'Locked' : 'Active' } : u
    ));
  };

  const saveNewAdmin = () => {
    const newAdmin: AdminUser = {
      id: Math.max(...adminUsers.map(u => u.id)) + 1,
      username: adminForm.username || '',
      email: adminForm.email || '',
      role: adminForm.role || '',
      status: adminForm.status || 'Active',
      group: adminForm.group || '',
      accessTimeLimit: adminForm.accessTimeLimit,
    };
    setAdminUsers([...adminUsers, newAdmin]);
    setAddAdminDialogOpen(false);
    setAdminForm({});
  };

  const saveEditAdmin = () => {
    if (selectedAdmin) {
      setAdminUsers(adminUsers.map(u => u.id === selectedAdmin.id ? { ...u, ...adminForm } as AdminUser : u));
    }
    setEditAdminDialogOpen(false);
    setSelectedAdmin(null);
    setAdminForm({});
  };

  const confirmDeleteAdmin = () => {
    if (selectedAdmin) {
      setAdminUsers(adminUsers.filter(u => u.id !== selectedAdmin.id));
    }
    setDeleteAdminDialogOpen(false);
    setSelectedAdmin(null);
  };

  // IAM Handlers
  const handleAddIam = () => {
    setIamForm({ status: 'Active', appliedAPs: [] });
    setAddIamDialogOpen(true);
  };
  const handleEditIam = (item: IamConnection) => {
    setSelectedIam(item);
    setIamForm({ ...item });
    setEditIamDialogOpen(true);
  };
  const handleDeleteIam = (item: IamConnection) => {
    setSelectedIam(item);
    setDeleteIamDialogOpen(true);
  };
  const saveNewIam = () => {
    const newItem: IamConnection = {
      id: Math.max(...iamConnections.map(i => i.id), 0) + 1,
      name: iamForm.name || '',
      type: iamForm.type || 'Google Workspace',
      endpointUrl: iamForm.endpointUrl || '',
      clientId: iamForm.clientId || '',
      clientSecret: iamForm.clientSecret || '',
      appliedAPs: iamForm.appliedAPs || [],
      status: iamForm.status || 'Active',
    };
    setIamConnections([...iamConnections, newItem]);
    setAddIamDialogOpen(false);
    setIamForm({});
  };
  const saveEditIam = () => {
    if (selectedIam) {
      setIamConnections(iamConnections.map(i => i.id === selectedIam.id ? { ...i, ...iamForm } as IamConnection : i));
    }
    setEditIamDialogOpen(false);
    setSelectedIam(null);
    setIamForm({});
  };
  const confirmDeleteIam = () => {
    if (selectedIam) {
      setIamConnections(iamConnections.filter(i => i.id !== selectedIam.id));
    }
    setDeleteIamDialogOpen(false);
    setSelectedIam(null);
  };

  // RADIUS Handlers
  const handleAddRadius = () => {
    setRadiusForm({ protocol: 'RADIUS', port: 1812 });
    setAddRadiusDialogOpen(true);
  };
  const handleEditRadius = (item: RadiusConnection) => {
    setSelectedRadius(item);
    setRadiusForm({ ...item });
    setEditRadiusDialogOpen(true);
  };
  const handleDeleteRadius = (item: RadiusConnection) => {
    setSelectedRadius(item);
    setDeleteRadiusDialogOpen(true);
  };
  const saveNewRadius = () => {
    const newItem: RadiusConnection = {
      id: Math.max(...radiusConnections.map(i => i.id), 0) + 1,
      switchName: radiusForm.switchName || '',
      radiusServer: radiusForm.radiusServer || '',
      secretKey: radiusForm.secretKey || '',
      port: radiusForm.port || 1812,
      protocol: radiusForm.protocol || 'RADIUS',
    };
    setRadiusConnections([...radiusConnections, newItem]);
    setAddRadiusDialogOpen(false);
    setRadiusForm({});
  };
  const saveEditRadius = () => {
    if (selectedRadius) {
      setRadiusConnections(radiusConnections.map(i => i.id === selectedRadius.id ? { ...i, ...radiusForm } as RadiusConnection : i));
    }
    setEditRadiusDialogOpen(false);
    setSelectedRadius(null);
    setRadiusForm({});
  };
  const confirmDeleteRadius = () => {
    if (selectedRadius) {
      setRadiusConnections(radiusConnections.filter(i => i.id !== selectedRadius.id));
    }
    setDeleteRadiusDialogOpen(false);
    setSelectedRadius(null);
    setDeleteRadiusDialogOpen(false);
    setSelectedRadius(null);
  };

  // User Group Handlers
  const handleAddGroup = () => {
    setGroupForm({ 
      permissions: resources.map(r => ({ resource: r, canView: false, canEdit: false })) 
    });
    setAddGroupDialogOpen(true);
  };

  const handleEditGroup = (group: UserGroup) => {
    setSelectedGroup(group);
    setGroupForm(JSON.parse(JSON.stringify(group))); // Deep copy for permissions array
    setEditGroupDialogOpen(true);
  };

  const handleDeleteGroup = (group: UserGroup) => {
    setSelectedGroup(group);
    setDeleteGroupDialogOpen(true);
  };

  const saveNewGroup = () => {
    const newGroup: UserGroup = {
      id: Math.max(...groups.map(g => g.id), 0) + 1,
      name: groupForm.name || 'New Group',
      permissions: groupForm.permissions || [],
    };
    setGroups([...groups, newGroup]);
    setAddGroupDialogOpen(false);
    setGroupForm({});
  };

  const saveEditGroup = () => {
    if (selectedGroup) {
      setGroups(groups.map(g => g.id === selectedGroup.id ? { ...g, ...groupForm } as UserGroup : g));
    }
    setEditGroupDialogOpen(false);
    setSelectedGroup(null);
    setGroupForm({});
  };

  const confirmDeleteGroup = () => {
    if (selectedGroup) {
      setGroups(groups.filter(g => g.id !== selectedGroup.id));
    }
    setDeleteGroupDialogOpen(false);
    setSelectedGroup(null);
  };

  const handlePermissionChange = (resource: string, type: 'canView' | 'canEdit') => {
    if (!groupForm.permissions) return;
    
    const updatedPermissions = groupForm.permissions.map(p => {
      if (p.resource === resource) {
        return { ...p, [type]: !p[type] };
      }
      return p;
    });
    
    setGroupForm({ ...groupForm, permissions: updatedPermissions });
  };

  // Resource Handlers
  const handleAddResource = () => {
    if (resourceForm.name && !resources.includes(resourceForm.name)) {
      const newResources = [...resources, resourceForm.name];
      setResources(newResources);
      // Update existing groups
      setGroups(groups.map(g => ({
        ...g,
        permissions: [...g.permissions, { resource: resourceForm.name, canView: false, canEdit: false }]
      })));
      setResourceForm({ name: '' });
    }
  };

  const startEditResource = (resource: string) => {
    setEditingResource(resource);
    setEditResourceForm({ name: resource });
  };

  const cancelEditResource = () => {
    setEditingResource(null);
    setEditResourceForm({ name: '' });
  };

  const saveEditResource = () => {
    if (editingResource && editResourceForm.name && !resources.includes(editResourceForm.name)) {
      const newResources = resources.map(r => r === editingResource ? editResourceForm.name : r);
      setResources(newResources);
      // Update existing groups
      setGroups(groups.map(g => ({
        ...g,
        permissions: g.permissions.map(p => p.resource === editingResource ? { ...p, resource: editResourceForm.name } : p)
      })));
      setEditingResource(null);
      setEditResourceForm({ name: '' });
    }
  };

  const handleDeleteResource = (resource: string) => {
    setSelectedResource(resource);
    setDeleteResourceDialogOpen(true);
  };

  const confirmDeleteResource = () => {
    if (selectedResource) {
      const newResources = resources.filter(r => r !== selectedResource);
      setResources(newResources);
       // Update existing groups
      setGroups(groups.map(g => ({
        ...g,
        permissions: g.permissions.filter(p => p.resource !== selectedResource)
      })));
    }
    setDeleteResourceDialogOpen(false);
    setSelectedResource(null);
  };

  // IP Handlers
  const handleAddIp = () => {
    if (newIp && !allowedIps.includes(newIp)) {
      setAllowedIps([...allowedIps, newIp]);
      setNewIp('');
    }
  };

  const handleDeleteIp = (ip: string) => {
    setAllowedIps(allowedIps.filter(item => item !== ip));
  };


  // Portal Handlers
  const handleAddPortal = () => {
    setPortalForm({ isEnabled: true });
    setAddPortalDialogOpen(true);
  };
  const handleEditPortal = (item: CaptivePortalConfig) => {
    setSelectedPortal(item);
    setPortalForm({ ...item });
    setEditPortalDialogOpen(true);
  };
  const handleDeletePortal = (item: CaptivePortalConfig) => {
    setSelectedPortal(item);
    setDeletePortalDialogOpen(true);
  };
  const togglePortalStatus = (item: CaptivePortalConfig) => {
     setCaptivePortals(captivePortals.map(p => p.id === item.id ? { ...p, isEnabled: !p.isEnabled } : p));
  };
  const saveNewPortal = () => {
    const newItem: CaptivePortalConfig = {
      id: Math.max(...captivePortals.map(i => i.id), 0) + 1,
      deviceName: portalForm.deviceName || '',
      portalUrl: portalForm.portalUrl || '',
      isEnabled: portalForm.isEnabled ?? true,
    };
    setCaptivePortals([...captivePortals, newItem]);
    setAddPortalDialogOpen(false);
    setPortalForm({});
  };
  const saveEditPortal = () => {
    if (selectedPortal) {
      setCaptivePortals(captivePortals.map(i => i.id === selectedPortal.id ? { ...i, ...portalForm } as CaptivePortalConfig : i));
    }
    setEditPortalDialogOpen(false);
    setSelectedPortal(null);
    setPortalForm({});
  };
  const confirmDeletePortal = () => {
    if (selectedPortal) {
      setCaptivePortals(captivePortals.filter(i => i.id !== selectedPortal.id));
    }
    setDeletePortalDialogOpen(false);
    setSelectedPortal(null);
  };

  // State for Controller Selection Filtering
  const [selectedControllerFilter, setSelectedControllerFilter] = useState<string | null>(null);
  const [controllerCampusFilter, setControllerCampusFilter] = useState<string>('all');

  // Filter Controllers based on campus
  const filteredControllers = useMemo(() => {
    if (controllerCampusFilter === 'all') return controllers;
    return controllers.filter(c => c.campusId === parseInt(controllerCampusFilter));
  }, [controllers, controllerCampusFilter]);

  // Filter APs based on selected controller
  const filteredAPs = useMemo(() => {
    if (!selectedControllerFilter) return aps;
    return aps.filter(ap => ap.controller === selectedControllerFilter);
  }, [aps, selectedControllerFilter]);

  const handleControllerClick = (controllerName: string) => {
    if (selectedControllerFilter === controllerName) {
      setSelectedControllerFilter(null); // Deselect if already selected
    } else {
      setSelectedControllerFilter(controllerName);
    }
  };

  const handleViewLog = (log: LogEntry) => {
    setSelectedLog(log);
    setLogDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Card className="bg-white shadow-sm">
        <Tabs value={activeTab} className="space-y-6">


          {/* Tab 1: Users */}
          <TabsContent value="users" className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý Người dùng Hệ thống (Admin Users)</h3>
                <Button onClick={handleAddAdmin} className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={18} className="mr-2" />
                  Thêm người dùng
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  placeholder="Tìm kiếm theo tên đăng nhập hoặc email..."
                  value={adminSearchTerm}
                  onChange={(e) => setAdminSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Admin Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên đăng nhập</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Vai trò</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Nhóm</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Trạng thái</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminUsers.map((admin, index) => (
                      <tr
                        key={admin.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{admin.username}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{admin.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{admin.role}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{admin.group}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" title="Chỉnh sửa" onClick={() => handleEditAdmin(admin)}>
                              <Edit size={18} className="text-amber-600" />
                            </Button>
                            <Button variant="ghost" size="sm" title={admin.status === 'Active' ? 'Khóa' : 'Mở khóa'} onClick={() => handleLockAdmin(admin)}>
                              <Lock size={18} className={admin.status === 'Active' ? 'text-gray-600' : 'text-green-600'} />
                            </Button>
                            <Button variant="ghost" size="sm" title="Xóa" onClick={() => handleDeleteAdmin(admin)}>
                              <Trash2 size={18} className="text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              

            </div>
          </TabsContent>

          {/* Tab 2: Areas (Campus & Buildings) */}
          <TabsContent value="areas" className="p-6 space-y-6">
            {/* Campus Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Map size={20} className="text-blue-600" />
                    Quản lý Cơ sở (Campus)
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Quản lý các cơ sở/khuôn viên của trường</p>
                </div>
                <Button onClick={handleAddCampus} className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={18} className="mr-2" />
                  Thêm cơ sở
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {campuses.map((campus) => (
                  <div 
                    key={campus.id} 
                    className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCampusFilter === campus.id 
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-100' 
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedCampusFilter(selectedCampusFilter === campus.id ? 'all' : campus.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedCampusFilter === campus.id ? 'bg-blue-500' : 'bg-blue-100'
                        }`}>
                          <MapPin size={20} className={selectedCampusFilter === campus.id ? 'text-white' : 'text-blue-600'} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{campus.name}</h4>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{campus.code}</span>
                        </div>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => handleEditCampus(campus)}>
                          <Edit size={16} className="text-amber-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCampus(campus)}>
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{campus.address}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{campus.description}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        selectedCampusFilter === campus.id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {getBuildingCountByCampus(campus.id)} tòa nhà
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buildings Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 size={20} className="text-blue-600" />
                    Quản lý Tòa nhà
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Quản lý các tòa nhà trong từng cơ sở</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedCampusFilter === 'all' ? 'all' : String(selectedCampusFilter)}
                    onValueChange={(v) => setSelectedCampusFilter(v === 'all' ? 'all' : Number(v))}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Lọc theo cơ sở" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả cơ sở</SelectItem>
                      {campuses.map((campus) => (
                        <SelectItem key={campus.id} value={String(campus.id)}>{campus.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddBuilding} className="bg-blue-600 hover:bg-green-700">
                    <Plus size={18} className="mr-2" />
                    Thêm tòa nhà
                  </Button>
                </div>
              </div>
              
              {/* Buildings Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên tòa nhà</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Mã</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Cơ sở</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Số tầng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Mô tả</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuildings.map((building, index) => (
                      <tr
                        key={building.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            {building.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono text-xs">{building.code}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{getCampusName(building.campusId)}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{building.floors} tầng</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{building.description}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" title="Chỉnh sửa" onClick={() => handleEditBuilding(building)}>
                              <Edit size={18} className="text-amber-600" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Xóa" onClick={() => handleDeleteBuilding(building)}>
                              <Trash2 size={18} className="text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBuildings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          <Building2 size={40} className="mx-auto text-gray-300 mb-2" />
                          <p>Chưa có tòa nhà nào{selectedCampusFilter !== 'all' && ` trong cơ sở "${getCampusName(selectedCampusFilter)}"`}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Security */}
          <TabsContent value="security" className="p-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={20} />
                Thiết lập Bảo mật
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Password Policy */}
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Key size={16} className="text-gray-500" /> Chính sách Mật khẩu
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Yêu cầu</label>
                      <select className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50">
                        <option>Mạnh (8+ ký tự, A-Za-z0-9, đặc biệt)</option>
                        <option>Trung bình</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="text-xs text-gray-600 font-medium">Đổi sau (ngày)</label>
                        <Input type="number" placeholder="90" className="mt-1 h-8" />
                        </div>
                        <div>
                        <label className="text-xs text-gray-600 font-medium">Hết hạn (ngày)</label>
                        <Input type="number" placeholder="365" className="mt-1 h-8" />
                        </div>
                    </div>
                  </div>
                </div>


                {/* Login Restrictions */}
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield size={16} className="text-gray-500" /> Hạn chế Đăng nhập
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="text-xs text-gray-600 font-medium">Sai tối đa</label>
                        <Input type="number" placeholder="5 lần" className="mt-1 h-8" />
                        </div>
                        <div>
                        <label className="text-xs text-gray-600 font-medium">Khóa (phút)</label>
                        <Input type="number" placeholder="30" className="mt-1 h-8" />
                        </div>
                    </div>
                     <div className="pt-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                             <input type="checkbox" className="rounded border-gray-300" defaultChecked /> Tự động gửi cảnh báo qua Email
                        </label>
                     </div>
                  </div>
                </div>

                {/* Admin Network Restriction - Compact */}
                <div className="p-4 bg-white rounded-lg border border-gray-200 col-span-1 lg:col-span-2">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-600" />
                            <h4 className="text-sm font-semibold text-gray-900">Giới hạn IP Quản trị</h4>
                            <span className="text-xs text-gray-500 hidden sm:inline">(Chỉ cho phép truy cập từ các IP bên dưới)</span>
                        </div>
                         <div className="flex gap-2">
                            <Input 
                            placeholder="IP/CIDR (VD: 192.168.1.10)" 
                            value={newIp}
                            onChange={(e) => setNewIp(e.target.value)}
                            className="h-8 w-48 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddIp()}
                            />
                            <Button onClick={handleAddIp} disabled={!newIp} size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                            <Plus size={14} className="mr-1" /> Thêm
                            </Button>
                        </div>
                   </div>

                   <div className="flex flex-wrap gap-2">
                        {allowedIps.map((ip) => (
                          <div key={ip} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-mono transition-colors">
                             <span>{ip}</span>
                             <button onClick={() => handleDeleteIp(ip)} className="text-gray-400 hover:text-red-600">
                                <X size={14} />
                             </button>
                          </div>
                        ))}
                        {allowedIps.length === 0 && (
                             <span className="text-sm text-gray-500 italic py-1">Chưa có giới hạn nào. Truy cập công khai.</span>
                        )}
                   </div>
                </div>
              </div>

               <div className="mt-4 flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Lưu cài đặt bảo mật</Button>
              </div>
            </div>
          </TabsContent>

          

          {/* Tab 5: System Integration (Renamed from Technical) */}
          <TabsContent value="technical" className="p-6 space-y-8">
            
            {/* Area 1: IAM Integration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Globe size={24} className="text-blue-600" />
                    Kết nối Hệ thống Định danh (IAM Integration)
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Quản lý liên kết Federation với các IdP</p>
                </div>
                <Button onClick={handleAddIam} className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={18} className="mr-2" />
                  Thêm kết nối IAM
                </Button>
              </div>

              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên kết nối</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại IdP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {iamConnections.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{item.endpointUrl}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            item.status === 'Error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status === 'Active' ? 'Hoạt động' : item.status === 'Error' ? 'Lỗi' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <div className="flex justify-center gap-2">
                             <Button variant="ghost" size="sm" onClick={() => handleEditIam(item)}><Edit size={16} className="text-amber-600" /></Button>
                             <Button variant="ghost" size="sm" onClick={() => handleDeleteIam(item)}><Trash2 size={16} className="text-red-600" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {iamConnections.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Chưa có kết nối IAM nào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Area 2: Network Infrastructure */}
            {/* <div>
               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Network size={24} className="text-green-600" />
                  Kết nối Hạ tầng Mạng
               </h3>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium text-gray-800 flex items-center gap-2"><Key size={18}/> RADIUS trên Switch</h4>
                      <Button variant="outline" size="sm" onClick={handleAddRadius}><Plus size={16} className="mr-1"/> Thêm</Button>
                    </div>
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Thiết bị</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Server IP</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {radiusConnections.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 text-sm font-medium">{item.switchName}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{item.radiusServer}:{item.port}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditRadius(item)}><Edit size={14} className="text-amber-600"/></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteRadius(item)}><Trash2 size={14} className="text-red-600"/></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>

                 Captive Portal Table
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium text-gray-800 flex items-center gap-2"><Radio size={18}/> Captive Portal trên AP</h4>
                      <Button variant="outline" size="sm" onClick={handleAddPortal}><Plus size={16} className="mr-1"/> Thêm</Button>
                    </div>
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Thiết bị</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Portal URL</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Kích hoạt</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {captivePortals.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 text-sm font-medium">{item.deviceName}</td>
                              <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-[150px]">{item.portalUrl}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center">
                                  <Checkbox 
                                    checked={item.isEnabled} 
                                    onCheckedChange={() => togglePortalStatus(item)}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditPortal(item)}><Edit size={14} className="text-amber-600"/></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeletePortal(item)}><Trash2 size={14} className="text-red-600"/></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
               </div> 
            </div> */}

            {/* Area 3: External Services */}
            <div>
               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Cloud size={24} className="text-purple-600" />
                  Cấu hình Hệ thống Khác
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Database Card */}
                 <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-blue-800">
                      <Database size={20} />
                      <h4 className="font-semibold">Cơ sở Dữ liệu</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Database Host</label>
                        <Input className="mt-1 h-8 text-sm" defaultValue="db.hcmus.edu.vn" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Port</label>
                        <Input className="mt-1 h-8 text-sm" defaultValue="5432" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Username</label>
                        <Input className="mt-1 h-8 text-sm" defaultValue="admin" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Password</label>
                        <Input type="password" className="mt-1 h-8 text-sm" defaultValue="******" />
                      </div>
                      <Button size="sm" className="w-full mt-2" variant="outline">Kiểm tra kết nối</Button>
                    </div>
                 </div>

                 {/* Email Card */}
                 <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-orange-800">
                      <Mail size={20} />
                      <h4 className="font-semibold">Email Hệ thống</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">SMTP Server</label>
                        <Input className="mt-1 h-8 text-sm" defaultValue="mail.hcmus.edu.vn" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Port</label>
                        <Input className="mt-1 h-8 text-sm" defaultValue="587" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Sender Email</label>
                        <Input className="mt-1 h-8 text-sm" defaultValue="noreply@hcmus.edu.vn" />
                      </div>
                      <Button size="sm" className="w-full mt-2" variant="outline">Gửi mail test</Button>
                    </div>
                 </div>

                 {/* Zalo Card */}
                 <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-blue-600">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" className="w-5 h-5" />
                      <h4 className="font-semibold">Zalo Integration</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <label className="text-xs font-medium text-gray-700">Kích hoạt ZNS</label>
                         <Checkbox defaultChecked />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Zalo OA ID</label>
                        <Input className="mt-1 h-8 text-sm" placeholder="Nhập OA ID" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">ZNS API Key</label>
                        <Input type="password" className="mt-1 h-8 text-sm" placeholder="Nhập API Key" />
                      </div>
                       <Button size="sm" className="w-full mt-2" variant="outline">Đồng bộ OA</Button>
                    </div>
                 </div>
               </div>
               
               <div className="mt-6 flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700">Lưu cấu hình hệ thống</Button>
               </div>
            </div>
          </TabsContent>

          {/* Tab 5: Access (Resources & User Groups) */}
          <TabsContent value="access" className="p-6 space-y-8">
            

            {/* User Groups Section (Moved from Users tab) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users size={20} className="text-blue-600" />
                    Quản lý Nhóm (Groups)
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tạo nhóm và phân quyền truy cập cho từng nhóm.
                  </p>
                </div>
<div>
 <Button onClick={() => setManagePermissionsOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Database size={18} className="mr-2" />
                  Quản lý Danh sách Quyền
                </Button>
                 <Button onClick={handleAddGroup} className="bg-blue-600 hover:bg-blue-700 ml-5">
                  <Plus size={18} className="mr-2" />
                  Thêm nhóm
                </Button>
</ div>
              </div>
              
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 w-16">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Tên nhóm</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Quyền hạn (Permissions)</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 w-32">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groups.map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500 text-center">{group.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{group.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {group.permissions.filter(p => p.canView || p.canEdit).length > 0 ? (
                              group.permissions.filter(p => p.canView || p.canEdit).slice(0, 3).map((p, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full border border-gray-200">
                                  {p.resource} ({p.canEdit ? 'Edit' : 'View'})
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 italic">Chưa phân quyền</span>
                            )}
                            {group.permissions.filter(p => p.canView || p.canEdit).length > 3 && (
                              <span className="text-gray-500 text-xs self-center">
                                +{group.permissions.filter(p => p.canView || p.canEdit).length - 3} more...
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditGroup(group)}>
                              <Edit size={16} className="text-amber-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteGroup(group)}>
                              <Trash2 size={16} className="text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Tab 6: System Logs */}
          <TabsContent value="logs" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý Nhật ký (Logs)</h3>
              
              {/* Log Filter */}
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={logFilter === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('all')}
                  className={logFilter === 'all' ? 'bg-blue-600' : ''}
                >
                  Tất cả
                </Button>
                <Button 
                  variant={logFilter === 'access' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('access')}
                  className={logFilter === 'access' ? 'bg-blue-600' : ''}
                >
                  Truy cập
                </Button>
                <Button 
                  variant={logFilter === 'error' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('error')}
                  className={logFilter === 'error' ? 'bg-blue-600' : ''}
                >
                  Lỗi
                </Button>
                <Button 
                  variant={logFilter === 'config' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('config')}
                  className={logFilter === 'config' ? 'bg-blue-600' : ''}
                >
                  Cấu hình
                </Button>
                <Button 
                  variant={logFilter === 'account' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLogFilter('account')}
                  className={logFilter === 'account' ? 'bg-blue-600' : ''}
                >
                  Tài khoản
                </Button>
              </div>
              
              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Thời gian</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Người dùng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Hành động</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Loại</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => (
                      <tr
                        key={log.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{log.timestamp}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.user}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.action}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            log.type === 'access' ? 'bg-blue-100 text-blue-800' :
                            log.type === 'error' ? 'bg-red-100 text-red-800' :
                            log.type === 'config' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {log.type === 'access' ? 'Truy cập' :
                             log.type === 'error' ? 'Lỗi' :
                             log.type === 'config' ? 'Cấu hình' : 'Tài khoản'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="ghost" size="sm" onClick={() => handleViewLog(log)}>
                            <Eye size={18} className="text-blue-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Tab 7: Devices */}
          <TabsContent value="devices" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Controller Management - Left */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Server size={20} className="text-blue-600" />
                      Quản lý Controller
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Danh sách bộ điều khiển WiFi</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={controllerCampusFilter} onValueChange={setControllerCampusFilter}>
                      <SelectTrigger className="w-[150px] h-8 text-xs">
                        <SelectValue placeholder="Lọc theo cơ sở" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả cơ sở</SelectItem>
                        {campuses.map((campus) => (
                          <SelectItem key={campus.id} value={campus.id.toString()}>
                            {campus.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddController} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus size={16} className="mr-1" />
                      Thêm
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">Tên</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">IP</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900">Trạng thái</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredControllers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-gray-500 text-sm">
                            Không có Controller nào trong cơ sở này.
                          </td>
                        </tr>
                      ) : filteredControllers.map((controller) => (
                        <tr 
                          key={controller.id} 
                          className={`cursor-pointer transition-colors ${
                            selectedControllerFilter === controller.name 
                              ? 'bg-blue-50 border-l-4 border-blue-500' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleControllerClick(controller.name)}
                        >
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">
                            {controller.name}
                            {selectedControllerFilter === controller.name && (
                              <span className="ml-1 text-xs text-blue-600 font-normal">(Xem)</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 font-mono text-xs">{controller.ipAddress}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              controller.status === 'Online' ? 'bg-green-100 text-green-800' : 
                              controller.status === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {controller.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditController(controller)}>
                                <Edit size={14} className="text-amber-600" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDeleteController(controller)}>
                                <Trash2 size={14} className="text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AP Management - Right */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Wifi size={20} className="text-green-600" />
                      Quản lý AP
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedControllerFilter 
                        ? <span>Controller: <strong>{selectedControllerFilter}</strong> <Button variant="link" className="h-auto p-0 text-xs" onClick={() => setSelectedControllerFilter(null)}>(Xem tất cả)</Button></span>
                        : "Tất cả thiết bị phát sóng"}
                    </p>
                  </div>
                  <Button onClick={handleAddAP} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Plus size={16} className="mr-1" />
                    Thêm
                  </Button>
                </div>

                <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">Tên AP</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">Vị trí</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900">Trạng thái</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAPs.length === 0 ? (
                         <tr>
                           <td colSpan={4} className="px-3 py-6 text-center text-gray-500 text-sm">
                             Không tìm thấy AP nào.
                           </td>
                         </tr>
                      ) : filteredAPs.map((ap) => (
                        <tr key={ap.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">{ap.name}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{ap.building}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              ap.status === 'Online' ? 'bg-green-100 text-green-800' : 
                              ap.status === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {ap.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditAP(ap)}>
                                <Edit size={14} className="text-amber-600" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDeleteAP(ap)}>
                                <Trash2 size={14} className="text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Add Admin User Dialog */}
      <Dialog open={addAdminDialogOpen} onOpenChange={setAddAdminDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={20} />
              Thêm Người dùng Hệ thống
            </DialogTitle>
            <DialogDescription>
              Tạo tài khoản quản trị viên mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-username">Tên đăng nhập</Label>
              <Input
                id="admin-username"
                value={adminForm.username || ''}
                onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                placeholder="admin_user"
              />
            </div>
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={adminForm.email || ''}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                placeholder="admin@hcmus.edu.vn"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Mật khẩu</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Nhập mật khẩu"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="admin-role">Vai trò Hệ thống</Label>
                <Select
                  value={adminForm.role}
                  onValueChange={(value) => setAdminForm({ ...adminForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemRoles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-group">Nhóm</Label>
                <Select
                  value={adminForm.group}
                  onValueChange={(value) => setAdminForm({ ...adminForm, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    {userGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="admin-status">Trạng thái tài khoản</Label>
              <Select
                value={adminForm.status}
                onValueChange={(value) => setAdminForm({ ...adminForm, status: value as AdminUser['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Hoạt động</SelectItem>
                  <SelectItem value="Locked">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="admin-time-limit">Giới hạn thời gian truy cập (tùy chọn)</Label>
              <Input
                id="admin-time-limit"
                type="datetime-local"
                value={adminForm.accessTimeLimit || ''}
                onChange={(e) => setAdminForm({ ...adminForm, accessTimeLimit: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAdminDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveNewAdmin} className="bg-blue-600 hover:bg-blue-700">Thêm người dùng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin User Dialog */}
      <Dialog open={editAdminDialogOpen} onOpenChange={setEditAdminDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Người dùng Hệ thống</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tài khoản quản trị viên
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-admin-username">Tên đăng nhập</Label>
              <Input
                id="edit-admin-username"
                value={adminForm.username || ''}
                onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-admin-email">Email</Label>
              <Input
                id="edit-admin-email"
                type="email"
                value={adminForm.email || ''}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-admin-role">Vai trò Hệ thống</Label>
                <Select
                  value={adminForm.role}
                  onValueChange={(value) => setAdminForm({ ...adminForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemRoles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-admin-group">Nhóm</Label>
                <Select
                  value={adminForm.group}
                  onValueChange={(value) => setAdminForm({ ...adminForm, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    {userGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-admin-status">Trạng thái tài khoản</Label>
              <Select
                value={adminForm.status}
                onValueChange={(value) => setAdminForm({ ...adminForm, status: value as AdminUser['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Hoạt động</SelectItem>
                  <SelectItem value="Locked">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-admin-time-limit">Giới hạn thời gian truy cập (tùy chọn)</Label>
              <Input
                id="edit-admin-time-limit"
                type="datetime-local"
                value={adminForm.accessTimeLimit || ''}
                onChange={(e) => setAdminForm({ ...adminForm, accessTimeLimit: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAdminDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEditAdmin} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin User Dialog */}
      <AlertDialog open={deleteAdminDialogOpen} onOpenChange={setDeleteAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedAdmin?.username}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAdmin} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permission Matrix Dialog */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={20} />
              Cấu hình Phân quyền
            </DialogTitle>
            <DialogDescription>
              Thiết lập phân quyền cho các nhóm người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Chọn nhóm người dùng</Label>
              <Select defaultValue={userGroups[0]}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm" />
                </SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Tài nguyên</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900">Quyền Xem</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900">Quyền Sửa</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGroupPermissions.map((perm, idx) => (
                    <tr key={perm.resource} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm text-gray-900">{perm.resource}</td>
                      <td className="px-4 py-2 text-center">
                        <Checkbox 
                          checked={perm.canView}
                          onCheckedChange={(checked) => {
                            const newPerms = [...selectedGroupPermissions];
                            newPerms[idx].canView = !!checked;
                            setSelectedGroupPermissions(newPerms);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Checkbox 
                          checked={perm.canEdit}
                          onCheckedChange={(checked) => {
                            const newPerms = [...selectedGroupPermissions];
                            newPerms[idx].canEdit = !!checked;
                            setSelectedGroupPermissions(newPerms);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => setPermissionDialogOpen(false)} className="bg-blue-600 hover:bg-blue-700">Lưu phân quyền</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Detail Dialog */}
      <Dialog open={logDetailDialogOpen} onOpenChange={setLogDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={20} />
              Chi tiết Nhật ký
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Thời gian</Label>
                  <p className="text-sm font-mono">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Người dùng</Label>
                  <p className="text-sm font-medium">{selectedLog.user}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Hành động</Label>
                <p className="text-sm">{selectedLog.action}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Loại</Label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  selectedLog.type === 'access' ? 'bg-blue-100 text-blue-800' :
                  selectedLog.type === 'error' ? 'bg-red-100 text-red-800' :
                  selectedLog.type === 'config' ? 'bg-amber-100 text-amber-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedLog.type === 'access' ? 'Truy cập' :
                   selectedLog.type === 'error' ? 'Lỗi' :
                   selectedLog.type === 'config' ? 'Cấu hình' : 'Tài khoản'}
                </span>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Chi tiết</Label>
                <p className="text-sm p-3 bg-gray-50 rounded-lg border">{selectedLog.details}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogDetailDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Campus Dialog */}
      <Dialog open={addCampusDialogOpen} onOpenChange={setAddCampusDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Thêm Cơ sở mới
            </DialogTitle>
            <DialogDescription>Nhập thông tin cơ sở/khuôn viên mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tên cơ sở <span className="text-red-500">*</span></Label>
                <Input
                  value={campusForm.name || ''}
                  onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })}
                  placeholder="VD: Cơ sở Dĩ An"
                />
              </div>
              <div>
                <Label>Mã cơ sở <span className="text-red-500">*</span></Label>
                <Input
                  value={campusForm.code || ''}
                  onChange={(e) => setCampusForm({ ...campusForm, code: e.target.value.toUpperCase() })}
                  placeholder="VD: DA"
                />
              </div>
            </div>
            <div>
              <Label>Địa chỉ</Label>
              <Input
                value={campusForm.address || ''}
                onChange={(e) => setCampusForm({ ...campusForm, address: e.target.value })}
                placeholder="Nhập địa chỉ cơ sở"
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input
                value={campusForm.description || ''}
                onChange={(e) => setCampusForm({ ...campusForm, description: e.target.value })}
                placeholder="Mô tả ngắn về cơ sở"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCampusDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveNewCampus} disabled={!campusForm.name || !campusForm.code}>Thêm cơ sở</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campus Dialog */}
      <Dialog open={editCampusDialogOpen} onOpenChange={setEditCampusDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={20} className="text-amber-600" />
              Chỉnh sửa Cơ sở
            </DialogTitle>
            <DialogDescription>Cập nhật thông tin cơ sở "{selectedCampus?.name}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tên cơ sở <span className="text-red-500">*</span></Label>
                <Input
                  value={campusForm.name || ''}
                  onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Mã cơ sở <span className="text-red-500">*</span></Label>
                <Input
                  value={campusForm.code || ''}
                  onChange={(e) => setCampusForm({ ...campusForm, code: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
            <div>
              <Label>Địa chỉ</Label>
              <Input
                value={campusForm.address || ''}
                onChange={(e) => setCampusForm({ ...campusForm, address: e.target.value })}
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input
                value={campusForm.description || ''}
                onChange={(e) => setCampusForm({ ...campusForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCampusDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEditCampus} disabled={!campusForm.name || !campusForm.code}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Campus Dialog */}
      <AlertDialog open={deleteCampusDialogOpen} onOpenChange={setDeleteCampusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa cơ sở</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cơ sở <strong>{selectedCampus?.name}</strong>?
              <br /><br />
              <span className="text-red-600 font-medium">
                Cảnh báo: Tất cả {getBuildingCountByCampus(selectedCampus?.id || 0)} tòa nhà trong cơ sở này cũng sẽ bị xóa!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCampus} className="bg-red-600 hover:bg-red-700">
              Xóa cơ sở
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Building Dialog */}
      <Dialog open={addBuildingDialogOpen} onOpenChange={setAddBuildingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 size={20} className="text-green-600" />
              Thêm Tòa nhà mới
            </DialogTitle>
            <DialogDescription>Nhập thông tin tòa nhà mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Thuộc cơ sở <span className="text-red-500">*</span></Label>
              <Select
                value={String(buildingForm.campusId)}
                onValueChange={(v) => setBuildingForm({ ...buildingForm, campusId: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={String(campus.id)}>{campus.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tên tòa nhà <span className="text-red-500">*</span></Label>
                <Input
                  value={buildingForm.name || ''}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                  placeholder="VD: Tòa nhà A"
                />
              </div>
              <div>
                <Label>Mã tòa nhà <span className="text-red-500">*</span></Label>
                <Input
                  value={buildingForm.code || ''}
                  onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value.toUpperCase() })}
                  placeholder="VD: A"
                />
              </div>
            </div>
            <div>
              <Label>Số tầng</Label>
              <Input
                type="number"
                min={1}
                value={buildingForm.floors || 1}
                onChange={(e) => setBuildingForm({ ...buildingForm, floors: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input
                value={buildingForm.description || ''}
                onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })}
                placeholder="Mô tả ngắn về tòa nhà"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBuildingDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveNewBuilding} disabled={!buildingForm.name || !buildingForm.code || !buildingForm.campusId}>
              Thêm tòa nhà
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Building Dialog */}
      <Dialog open={editBuildingDialogOpen} onOpenChange={setEditBuildingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={20} className="text-amber-600" />
              Chỉnh sửa Tòa nhà
            </DialogTitle>
            <DialogDescription>Cập nhật thông tin tòa nhà "{selectedBuilding?.name}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Thuộc cơ sở <span className="text-red-500">*</span></Label>
              <Select
                value={String(buildingForm.campusId)}
                onValueChange={(v) => setBuildingForm({ ...buildingForm, campusId: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={String(campus.id)}>{campus.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tên tòa nhà <span className="text-red-500">*</span></Label>
                <Input
                  value={buildingForm.name || ''}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Mã tòa nhà <span className="text-red-500">*</span></Label>
                <Input
                  value={buildingForm.code || ''}
                  onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
            <div>
              <Label>Số tầng</Label>
              <Input
                type="number"
                min={1}
                value={buildingForm.floors || 1}
                onChange={(e) => setBuildingForm({ ...buildingForm, floors: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input
                value={buildingForm.description || ''}
                onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBuildingDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEditBuilding} disabled={!buildingForm.name || !buildingForm.code || !buildingForm.campusId}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Building Dialog */}
      <AlertDialog open={deleteBuildingDialogOpen} onOpenChange={setDeleteBuildingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tòa nhà</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tòa nhà <strong>{selectedBuilding?.name}</strong> thuộc cơ sở <strong>{getCampusName(selectedBuilding?.campusId || 0)}</strong>?
              <br /><br />
              Các Access Point đang được gán cho tòa nhà này có thể bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBuilding} className="bg-red-600 hover:bg-red-700">
              Xóa tòa nhà
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Controller Dialog */}
      <Dialog open={addControllerDialogOpen} onOpenChange={setAddControllerDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm Controller Mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên Controller</Label>
              <Input value={controllerForm.name || ''} onChange={e => setControllerForm({...controllerForm, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Địa chỉ IP</Label>
              <Input value={controllerForm.ipAddress || ''} onChange={e => setControllerForm({...controllerForm, ipAddress: e.target.value})} />
            </div>
            
            <div className="grid gap-2">
              <Label>Phiên bản (Version)</Label>
              <Input value={controllerForm.version || ''} onChange={e => setControllerForm({...controllerForm, version: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Vị trí đặt máy chủ</Label>
              <Input value={controllerForm.location || ''} onChange={e => setControllerForm({...controllerForm, location: e.target.value})} />
            </div>
<div className="grid gap-2">
              <Label>Cơ sở</Label>
              <Select 
                value={controllerForm.campusId?.toString() || ''} 
                onValueChange={(v) => setControllerForm({...controllerForm, campusId: parseInt(v)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id.toString()}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveNewController}>Lưu Controller</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Controller Dialog */}
      <Dialog open={editControllerDialogOpen} onOpenChange={setEditControllerDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Controller</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên Controller</Label>
              <Input value={controllerForm.name || ''} onChange={e => setControllerForm({...controllerForm, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Địa chỉ IP</Label>
              <Input value={controllerForm.ipAddress || ''} onChange={e => setControllerForm({...controllerForm, ipAddress: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Cơ sở</Label>
              <Select 
                value={controllerForm.campusId?.toString() || ''} 
                onValueChange={(v) => setControllerForm({...controllerForm, campusId: parseInt(v)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id.toString()}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Phiên bản</Label>
              <Input value={controllerForm.version || ''} onChange={e => setControllerForm({...controllerForm, version: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Vị trí</Label>
              <Input value={controllerForm.location || ''} onChange={e => setControllerForm({...controllerForm, location: e.target.value})} />
            </div>
             <div className="grid gap-2">
              <Label>Trạng thái</Label>
              <Select value={controllerForm.status} onValueChange={(v: any) => setControllerForm({...controllerForm, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveEditController}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Controller Dialog */}
      <AlertDialog open={deleteControllerDialogOpen} onOpenChange={setDeleteControllerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Controller?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa controller "{selectedController?.name}" khỏi hệ thống.
              Các AP được quản lý bởi controller này sẽ bị mất kết nối quản lý.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteController} className="bg-red-600 hover:bg-red-700">
              Xóa Controller
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add AP Dialog */}
      <Dialog open={addAPDialogOpen} onOpenChange={setAddAPDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm AP Mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid gap-2">
              <Label>Tên AP</Label>
              <Input value={apForm.name || ''} onChange={e => setAPForm({...apForm, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Địa chỉ IP / Model</Label>
              <Input value={apForm.ipModel || ''} onChange={e => setAPForm({...apForm, ipModel: e.target.value})} />
            </div>
             <div className="grid gap-2">
              <Label>Vị trí chi tiết</Label>
              <Input value={apForm.location || ''} onChange={e => setAPForm({...apForm, location: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Tòa nhà</Label>
               <Select value={apForm.building} onValueChange={(v) => setAPForm({...apForm, building: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tòa nhà" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="227NVC">227 NVC</SelectItem>
                  <SelectItem value="Dĩ An">Dĩ An</SelectItem>
                  <SelectItem value="Thủ Đức">Thủ Đức</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid gap-2">
              <Label>Controller quản lý</Label>
               <Select value={apForm.controller} onValueChange={(v) => setAPForm({...apForm, controller: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn Controller" />
                </SelectTrigger>
                <SelectContent>
                  {controllers.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveNewAP}>Lưu AP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Edit AP Dialog */}
      <Dialog open={editAPDialogOpen} onOpenChange={setEditAPDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa AP</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid gap-2">
              <Label>Tên AP</Label>
              <Input value={apForm.name || ''} onChange={e => setAPForm({...apForm, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Địa chỉ IP / Model</Label>
              <Input value={apForm.ipModel || ''} onChange={e => setAPForm({...apForm, ipModel: e.target.value})} />
            </div>
             <div className="grid gap-2">
              <Label>Vị trí chi tiết</Label>
              <Input value={apForm.location || ''} onChange={e => setAPForm({...apForm, location: e.target.value})} />
            </div>
             <div className="grid gap-2">
              <Label>Controller quản lý</Label>
               <Select value={apForm.controller} onValueChange={(v) => setAPForm({...apForm, controller: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {controllers.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid gap-2">
              <Label>Trạng thái</Label>
              <Select value={apForm.status} onValueChange={(v: any) => setAPForm({...apForm, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveEditAP}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AP Dialog */}
      <AlertDialog open={deleteAPDialogOpen} onOpenChange={setDeleteAPDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa AP?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa AP "{selectedAP?.name}" khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAP} className="bg-red-600 hover:bg-red-700">
              Xóa AP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* IAM Connection Dialog */}
      <Dialog open={addIamDialogOpen || editIamDialogOpen} onOpenChange={(open) => !open && (addIamDialogOpen ? setAddIamDialogOpen(false) : setEditIamDialogOpen(false))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{addIamDialogOpen ? 'Thêm kết nối IAM' : 'Chỉnh sửa kết nối IAM'}</DialogTitle>
            <DialogDescription>Cấu hình thông tin tích hợp Identity Provider</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Tên kết nối</Label>
              <Input 
                value={iamForm.name || ''} 
                onChange={(e) => setIamForm({ ...iamForm, name: e.target.value })} 
                placeholder="VD: Google Workspace Staff" 
              />
            </div>
            <div>
              <Label>Loại IdP</Label>
              <Select 
                value={iamForm.type || 'Google Workspace'} 
                onValueChange={(val: any) => setIamForm({ ...iamForm, type: val })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google Workspace">Google Workspace</SelectItem>
                  <SelectItem value="Microsoft Azure AD">Microsoft Azure AD</SelectItem>
                  <SelectItem value="IAM Broker">IAM Broker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Endpoint URL</Label>
              <Input 
                value={iamForm.endpointUrl || ''} 
                onChange={(e) => setIamForm({ ...iamForm, endpointUrl: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client ID</Label>
                <Input 
                   value={iamForm.clientId || ''} 
                   onChange={(e) => setIamForm({ ...iamForm, clientId: e.target.value })} 
                />
              </div>
              <div>
                <Label>Client Secret</Label>
                <Input 
                   type="password"
                   value={iamForm.clientSecret || ''} 
                   onChange={(e) => setIamForm({ ...iamForm, clientSecret: e.target.value })} 
                />
              </div>
            </div>
             <div>
              <Label>AP List (Áp dụng cho)</Label>
               <Popover>
                 <PopoverTrigger asChild>
                   <Button
                     variant="outline"
                     role="combobox"
                     className="w-full justify-between mt-1 font-normal"
                   >
                     {iamForm.appliedAPs && iamForm.appliedAPs.length > 0
                       ? `${iamForm.appliedAPs.length} AP đã chọn`
                       : "Chọn APs..."}
                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-[400px] p-0" align="start">
                   <Command>
                     <CommandInput placeholder="Tìm kiếm AP..." />
                     <CommandList>
                       <CommandEmpty>Không tìm thấy AP.</CommandEmpty>
                       <CommandGroup>
                        <CommandItem
                           value="all"
                           onSelect={() => {
                             if (iamForm.appliedAPs?.includes('All')) {
                               setIamForm({ ...iamForm, appliedAPs: [] });
                             } else {
                               setIamForm({ ...iamForm, appliedAPs: ['All'] });
                             }
                           }}
                         >
                           <Check
                             className={cn(
                               "mr-2 h-4 w-4",
                               iamForm.appliedAPs?.includes('All') ? "opacity-100" : "opacity-0"
                             )}
                           />
                           All APs
                         </CommandItem>
                         {aps.map((ap) => (
                           <CommandItem
                             key={ap.id}
                             value={ap.name}
                             onSelect={() => {
                               const currentValue = ap.name;
                               const currentApplied = iamForm.appliedAPs || [];
                               let newApplied;
                               
                               // If 'All' is selected, clear it when selecting specific items
                               const cleanApplied = currentApplied.filter(i => i !== 'All');

                               if (cleanApplied.includes(currentValue)) {
                                 newApplied = cleanApplied.filter((value) => value !== currentValue);
                               } else {
                                 newApplied = [...cleanApplied, currentValue];
                               }
                               setIamForm({ ...iamForm, appliedAPs: newApplied });
                             }}
                           >
                             <Check
                               className={cn(
                                 "mr-2 h-4 w-4",
                                 iamForm.appliedAPs?.includes(ap.name) ? "opacity-100" : "opacity-0"
                               )}
                             />
                             {ap.name}
                             <span className="ml-2 text-xs text-gray-500">
                               ({ap.ipModel} - {ap.location})
                             </span>
                           </CommandItem>
                         ))}
                       </CommandGroup>
                     </CommandList>
                   </Command>
                 </PopoverContent>
               </Popover>
               <div className="flex flex-wrap gap-1 mt-2">
                  {iamForm.appliedAPs?.map((apName) => (
                    <span key={apName} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                      {apName}
                      <button 
                        className="ml-1 hover:text-blue-900"
                        onClick={() => setIamForm({
                          ...iamForm, 
                          appliedAPs: iamForm.appliedAPs?.filter(a => a !== apName)
                        })}
                      >
                        ×
                      </button>
                    </span>
                  ))}
               </div>
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => { setAddIamDialogOpen(false); setEditIamDialogOpen(false); }}>Hủy</Button>
             <Button onClick={addIamDialogOpen ? saveNewIam : saveEditIam}>{addIamDialogOpen ? 'Thêm mới' : 'Lưu thay đổi'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete IAM Dialog */}
      <AlertDialog open={deleteIamDialogOpen} onOpenChange={setDeleteIamDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa kết nối IAM?</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa kết nối "{selectedIam?.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteIam} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* RADIUS Dialog */}
      <Dialog open={addRadiusDialogOpen || editRadiusDialogOpen} onOpenChange={(open) => !open && (addRadiusDialogOpen ? setAddRadiusDialogOpen(false) : setEditRadiusDialogOpen(false))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{addRadiusDialogOpen ? 'Thêm RADIUS Server' : 'Sửa RADIUS Server'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Tên Switch/Thiết bị</Label>
              <Input 
                value={radiusForm.switchName || ''} 
                onChange={(e) => setRadiusForm({ ...radiusForm, switchName: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Server IP</Label>
                <Input 
                   value={radiusForm.radiusServer || ''} 
                   onChange={(e) => setRadiusForm({ ...radiusForm, radiusServer: e.target.value })} 
                />
              </div>
              <div>
                <Label>Port</Label>
                <Input 
                   type="number"
                   value={radiusForm.port || 1812}
                   onChange={(e) => setRadiusForm({ ...radiusForm, port: parseInt(e.target.value) })} 
                />
              </div>
            </div>
            <div>
               <Label>Shared Secret</Label>
               <Input 
                  type="password"
                  value={radiusForm.secretKey || ''} 
                  onChange={(e) => setRadiusForm({ ...radiusForm, secretKey: e.target.value })} 
               />
            </div>
            <div>
               <Label>Giao thức</Label>
               <Select value={radiusForm.protocol || 'RADIUS'} onValueChange={(v:any) => setRadiusForm({...radiusForm, protocol: v})}>
                 <SelectTrigger><SelectValue/></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="RADIUS">RADIUS</SelectItem>
                   <SelectItem value="TACACS">TACACS+</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => { setAddRadiusDialogOpen(false); setEditRadiusDialogOpen(false); }}>Hủy</Button>
             <Button onClick={addRadiusDialogOpen ? saveNewRadius : saveEditRadius}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete RADIUS Dialog */}
       <AlertDialog open={deleteRadiusDialogOpen} onOpenChange={setDeleteRadiusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cấu hình RADIUS?</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa cấu hình cho thiết bị "{selectedRadius?.switchName}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRadius} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Group Dialog */}
      <Dialog open={addGroupDialogOpen} onOpenChange={setAddGroupDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm Nhóm người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo nhóm mới và thiết lập quyền hạn truy cập tài nguyên.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group-name" className="text-right">
                Tên nhóm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="group-name"
                value={groupForm.name || ''}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                className="col-span-3"
                placeholder="Ví dụ: Kỹ thuật viên"
              />
            </div>
            
            <div className="col-span-4 mt-2">
              <Label className="mb-2 block font-medium">Phân quyền Tài nguyên System</Label>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Tài nguyên</th>
                      <th className="px-4 py-2 text-center w-24">Xem (View)</th>
                      <th className="px-4 py-2 text-center w-24">Sửa (Edit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupForm.permissions?.map((perm) => (
                      <tr key={perm.resource}>
                        <td className="px-4 py-2 text-gray-700">{perm.resource}</td>
                        <td className="px-4 py-2 text-center">
                          <Checkbox 
                            checked={perm.canView} 
                            onCheckedChange={() => handlePermissionChange(perm.resource, 'canView')}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                           <Checkbox 
                            checked={perm.canEdit} 
                            onCheckedChange={() => handlePermissionChange(perm.resource, 'canEdit')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddGroupDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveNewGroup} className="bg-blue-600 hover:bg-blue-700" disabled={!groupForm.name}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Group Dialog */}
      <Dialog open={editGroupDialogOpen} onOpenChange={setEditGroupDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Nhóm người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và quyền hạn cho nhóm: {selectedGroup?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-group-name" className="text-right">
                Tên nhóm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-group-name"
                value={groupForm.name || ''}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>
             <div className="col-span-4 mt-2">
              <Label className="mb-2 block font-medium">Phân quyền Tài nguyên System</Label>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Tài nguyên</th>
                      <th className="px-4 py-2 text-center w-24">Xem (View)</th>
                      <th className="px-4 py-2 text-center w-24">Sửa (Edit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupForm.permissions?.map((perm) => (
                      <tr key={perm.resource}>
                        <td className="px-4 py-2 text-gray-700">{perm.resource}</td>
                        <td className="px-4 py-2 text-center">
                          <Checkbox 
                            checked={perm.canView} 
                            onCheckedChange={() => handlePermissionChange(perm.resource, 'canView')}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                           <Checkbox 
                            checked={perm.canEdit} 
                            onCheckedChange={() => handlePermissionChange(perm.resource, 'canEdit')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGroupDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveEditGroup} className="bg-blue-600 hover:bg-blue-700" disabled={!groupForm.name}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Group Alert */}
      <AlertDialog open={deleteGroupDialogOpen} onOpenChange={setDeleteGroupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Nhóm người dùng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa nhóm <strong>{selectedGroup?.name}</strong> khỏi hệ thống. Những người dùng thuộc nhóm này sẽ cần được gán lại nhóm khác. Bạn có chắc chắn không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGroup} className="bg-red-600 hover:bg-red-700">
              Xóa nhóm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manage Permissions Dialog */}
      <Dialog open={managePermissionsOpen} onOpenChange={setManagePermissionsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
         
          
          <div className="flex-1 overflow-y-auto py-4 pr-1">
             {/* Add New Section */}
             <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-100">
                <h4 className="text-sm font-semibold text-purple-900 mb-3">Thêm Quyền mới</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={resourceForm.name}
                      onChange={(e) => setResourceForm({ name: e.target.value })}
                      placeholder="Nhập tên quyền (ví dụ: QuanLyLog)..."
                      className="bg-white"
                       onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddResource();
                        }}
                    />
                  </div>
                  <Button onClick={handleAddResource} className="bg-purple-600 hover:bg-purple-700 text-white shrink-0" disabled={!resourceForm.name}>
                    <Plus size={18} className="mr-2" />
                    Thêm
                  </Button>
                </div>
             </div>

             {/* Permissions List */}
             <div className="space-y-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 px-1">Danh sách quyền hiện có ({resources.length})</h4>
                <div className="bg-white border rounded-lg divide-y">
                   {resources.map((resource, index) => (
                      <div key={resource} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                         {editingResource === resource ? (
                            <div className="flex items-center gap-2 flex-1 mr-2">
                               <Input 
                                  value={editResourceForm.name}
                                  onChange={(e) => setEditResourceForm({ name: e.target.value })}
                                  className="h-8 text-sm"
                                  autoFocus
                                   onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEditResource();
                                      if (e.key === 'Escape') cancelEditResource();
                                    }}
                               />
                               <Button size="sm" onClick={saveEditResource} className="bg-green-600 hover:bg-green-700 h-8">
                                  Lưu
                               </Button>
                               <Button size="sm" variant="ghost" onClick={cancelEditResource} className="h-8">
                                  Hủy
                               </Button>
                            </div>
                         ) : (
                            <>
                               <div className="flex items-center gap-3">
                                  <span className="text-gray-400 text-xs w-6">{index + 1}</span>
                                  <span className="text-sm font-medium text-gray-700">{resource}</span>
                               </div>
                               <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => startEditResource(resource)} className="h-8 w-8 p-0">
                                     <Edit size={14} className="text-amber-600" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(resource)} className="h-8 w-8 p-0">
                                     <Trash2 size={14} className="text-red-600" />
                                  </Button>
                               </div>
                            </>
                         )}
                      </div>
                   ))}
                   {resources.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                         Chưa có quyền nào được định nghĩa.
                      </div>
                   )}
                </div>
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setManagePermissionsOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       {/* Delete Resource Alert */}
      <AlertDialog open={deleteResourceDialogOpen} onOpenChange={setDeleteResourceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Quyền hệ thống?</AlertDialogTitle>
             <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa quyền <strong>{selectedResource}</strong>? 
              <br/>
              <span className="text-red-600">Cảnh báo:</span> Hành động này sẽ xóa quyền này khỏi TẤT CẢ các nhóm người dùng hiện tại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteResource} className="bg-red-600 hover:bg-red-700">
              Xóa quyền
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Captive Portal Dialog */}
      <Dialog open={addPortalDialogOpen || editPortalDialogOpen} onOpenChange={(open) => !open && (addPortalDialogOpen ? setAddPortalDialogOpen(false) : setEditPortalDialogOpen(false))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{addPortalDialogOpen ? 'Thêm Portal' : 'Sửa Portal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
             <div>
              <Label>Thiết bị Gán (AP/Controller)</Label>
              <Input 
                value={portalForm.deviceName || ''} 
                onChange={(e) => setPortalForm({ ...portalForm, deviceName: e.target.value })} 
              />
            </div>
             <div>
              <Label>Portal URL</Label>
              <Input 
                value={portalForm.portalUrl || ''} 
                onChange={(e) => setPortalForm({ ...portalForm, portalUrl: e.target.value })} 
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
               <Checkbox 
                 checked={portalForm.isEnabled ?? true} 
                 onCheckedChange={(c) => setPortalForm({ ...portalForm, isEnabled: c as boolean })}
               />
               <Label>Kích hoạt ngay</Label>
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => { setAddPortalDialogOpen(false); setEditPortalDialogOpen(false); }}>Hủy</Button>
             <Button onClick={addPortalDialogOpen ? saveNewPortal : saveEditPortal}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       {/* Delete Portal Dialog */}
       <AlertDialog open={deletePortalDialogOpen} onOpenChange={setDeletePortalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Portal?</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa cấu hình Portal cho "{selectedPortal?.deviceName}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <AlertDialogCancel>Hủy</AlertDialogCancel>
             <AlertDialogAction onClick={confirmDeletePortal} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
