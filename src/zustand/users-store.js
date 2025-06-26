import { create } from 'zustand';
import { API_ENDPOINT } from '../utils/endpoints';

export const useAllUserState = create((set) => ({
  allUsers: [],
  setAllUsers: (users) => set({ allUsers: users }),
}));

export const useSeletedUserForMealState = create((set) => ({
  selectedUserForMeal: {},
  setSelectedUserForMeal: (user) => set({ selectedUserForMeal: user }),
}));

export const useDieticianState = create((set) => ({
  dietician: {},
  setDietician: (dietician) => set({ dietician }),
}));

export const useAllDieticiansState = create((set) => ({
  allDietitians: [],
  loading: false,
  error: null,
  setAllDieticians: (newDieticians) => set({ allDietitians: newDieticians }),
  setLoading: (newLoading) => set({ loading: newLoading }),
  setError: (newError) => set({ error: newError }),
}));

export const useSeletedUserForWorkoutState = create((set) => ({
  selectedUserForWorkout: {},
  setSelectedUserForWorkout: (user) => set({ selectedUserForWorkout: user }),
}));

export const useSeletedUser = create((set) => ({
  user: {},
  setUser: (user) => set({ user }),
}));

export const useLoginPending = create((set) => ({
  dietLoginPending: false,
  setDietLoginPending: (state) => set({ dietLoginPending: state }),
}));

export const useUserInfo = create((set) => ({
  userInfo: null,
  setUserInfo: (info) => set({ userInfo: info }),
}));
