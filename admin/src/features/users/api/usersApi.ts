import { User, initialUsers, initialPolicies, WifiPolicy } from '@/data/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let mockUsers = [...initialUsers];

export const fetchUsers = async (): Promise<User[]> => {
  await delay(800);
  return [...mockUsers];
};

export const fetchPolicies = async (): Promise<WifiPolicy[]> => {
  await delay(500);
  return [...initialPolicies];
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
  await delay(600);
  const newUser = { ...user, id: Math.max(...mockUsers.map(u => u.id)) + 1 };
  mockUsers.push(newUser);
  return newUser;
};

export const updateUser = async (user: User): Promise<User> => {
  await delay(600);
  mockUsers = mockUsers.map(u => u.id === user.id ? user : u);
  return user;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await delay(600);
  mockUsers = mockUsers.filter(u => u.id !== userId);
};

export const assignPolicy = async (userId: number, policyData: Partial<User>): Promise<User> => {
  await delay(600);
  let updatedUser;
  mockUsers = mockUsers.map(u => {
    if (u.id === userId) {
      updatedUser = { ...u, ...policyData };
      return updatedUser;
    }
    return u;
  });
  if (!updatedUser) throw new Error("User not found");
  return updatedUser;
};
