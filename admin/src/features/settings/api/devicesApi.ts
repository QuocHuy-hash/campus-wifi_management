import { Controller, AP } from '../types';
import { initialControllers, initialAPs } from '../../../data/mockData';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const devicesApi = {
  getControllers: async (): Promise<Controller[]> => { await delay(400); return [...initialControllers]; },
  getAPs: async (): Promise<AP[]> => { await delay(400); return [...initialAPs]; }
};
