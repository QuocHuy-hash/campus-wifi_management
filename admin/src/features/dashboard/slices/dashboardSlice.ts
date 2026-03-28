import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
  filterUnit: string;
  selectedDate: string;
  startDate: string;
  endDate: string;
}

const initialState: DashboardState = {
  filterUnit: 'all',
  selectedDate: '2023-05-23',
  startDate: '2025-05-21',
  endDate: '2025-05-24',
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setFilterUnit: (state, action: PayloadAction<string>) => {
      state.filterUnit = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload;
    },
  },
});

export const { setFilterUnit, setSelectedDate, setStartDate, setEndDate } = dashboardSlice.actions;

export default dashboardSlice.reducer;
