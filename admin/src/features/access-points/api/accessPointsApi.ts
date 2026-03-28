import { AP, Controller, initialAPs, initialControllers } from "@/data/mockData";

// Simulate network delay of 800ms
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchAPs = async (): Promise<AP[]> => {
  await delay(800);
  return [...initialAPs];
};

export const fetchControllers = async (): Promise<Controller[]> => {
  await delay(800);
  return [...initialControllers];
};
