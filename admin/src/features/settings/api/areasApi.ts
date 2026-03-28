import { Campus, Building, Location } from '../types';

const INITIAL_CAMPUSES: Campus[] = [
  { id: 1, name: 'Cơ sở Nguyễn Văn Cừ', code: 'NVC', address: '227 Nguyễn Văn Cừ, Quận 5' },
  { id: 2, name: 'Cơ sở Linh Trung', code: 'LT', address: 'Linh Trung, Thủ Đức' },
];

const INITIAL_BUILDINGS: Building[] = [
  { id: 1, campusId: 1, name: 'Tòa nhà C', code: 'NVC-C', floors: 5, description: 'Tòa nhà văn phòng khoa CNTT' },
  { id: 2, campusId: 1, name: 'Tòa nhà E', code: 'NVC-E', floors: 11, description: 'Tòa nhà điều hành' },
  { id: 3, campusId: 2, name: 'Nhà học D1', code: 'LT-D1', floors: 3 },
  { id: 4, campusId: 2, name: 'Nhà điều hành LT', code: 'LT-DH', floors: 4 },
];

const INITIAL_LOCATIONS: Location[] = [
  { id: 1, buildingId: 1, name: 'Phòng Server C11', code: 'C11', description: 'Server core mạng NVC' },
  { id: 2, buildingId: 1, name: 'Phòng Lab C31', code: 'C31', description: 'Phòng Lab Mạng máy tính' },
  { id: 3, buildingId: 3, name: 'Giảng đường D1', code: 'D11', description: 'Giảng đường lớn' },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const areasApi = {
  getCampuses: async (): Promise<Campus[]> => { await delay(300); return [...INITIAL_CAMPUSES]; },
  getBuildings: async (): Promise<Building[]> => { await delay(300); return [...INITIAL_BUILDINGS]; },
  getLocations: async (): Promise<Location[]> => { await delay(300); return [...INITIAL_LOCATIONS]; }
};
