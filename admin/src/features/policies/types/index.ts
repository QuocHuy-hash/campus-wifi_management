import { WifiPolicy, AuthPolicy } from '@/data/mockData';

export interface PoliciesState {
  data: WifiPolicy[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  
  // Filters
  filterRole: string;
  filterArea: string;
  filterTime: string;
  filterController: string;
  filterSearch: string;
  
  // Dialog & Form States
  addPolicyDialogOpen: boolean;
  editPolicyDialogOpen: boolean;
  deletePolicyDialogOpen: boolean;
  selectedPolicy: WifiPolicy | null;
  policyForm: Partial<WifiPolicy>;
}

export interface AuthPoliciesState {
  data: AuthPolicy[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;

  // Dialog & Form States
  addAuthPolicyDialogOpen: boolean;
  editAuthPolicyDialogOpen: boolean;
  deleteAuthPolicyDialogOpen: boolean;
  selectedAuthPolicy: AuthPolicy | null;
  authPolicyForm: Partial<AuthPolicy>;
  validationError: string | null;
}
