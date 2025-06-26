import { create } from 'zustand';

export const useAllWorkoutStore = create((set) => ({
  workouts: [],
  setWorkouts: (workouts) => set({ workouts }),
}));

export const useUserWorkouts = create((set) => ({
  userWorkouts: [],
  setUserWorkouts: (workouts) => set({ userWorkouts: workouts }),
}));

export const useWorkoutStore = create((set) => ({
  workout: {},
  setWorkout: (workout) => set({ workout }),
}));

export const useWorkoutStatStore = create((set) => ({
  workoutsStats: [],
  setWorkoutsStat: (data) => set({ workoutsStats: data }),
}));
