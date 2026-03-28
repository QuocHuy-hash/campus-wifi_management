import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Filter state chung cho phần lớn các báo cáo
export interface FiltersState {
  dateRange: string;
  startDate: string;
  endDate: string;
  controllerFilter: string;
  campusFilter: string;
}

const initialState: FiltersState = {
  dateRange: 'week',
  startDate: '2024-01-11',
  endDate: '2024-01-15',
  controllerFilter: 'all',
  campusFilter: 'all',
};

const filtersSlice = createSlice({
  name: 'reportsFilters',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<string>) => { state.dateRange = action.payload; },
    setStartDate: (state, action: PayloadAction<string>) => { state.startDate = action.payload; },
    setEndDate: (state, action: PayloadAction<string>) => { state.endDate = action.payload; },
    setControllerFilter: (state, action: PayloadAction<string>) => { state.controllerFilter = action.payload; },
    setCampusFilter: (state, action: PayloadAction<string>) => { state.campusFilter = action.payload; },
    resetFilters: (state) => {
      // Đưa về giá trị mặc định
      state.dateRange = 'week';
      state.controllerFilter = 'all';
      state.campusFilter = 'all';
    }
  },
});

export const { 
  setDateRange, setStartDate, setEndDate, 
  setControllerFilter, setCampusFilter, resetFilters 
} = filtersSlice.actions;

export default filtersSlice.reducer;
