import { create } from 'zustand';

export const useAllMeateStore = create((set) => ({
  meals: [],
  setAllMeals: (meals) => set({ meals }),
}));

export const useCreateMealForUser = create((set) => ({
  meals: [],
  setAllMeals: (meals) => set({ meals }),
}));

export const useUserMeals = create((set) => ({
  userMeals: [],
  setUserMeals: (userMeals) => set({ userMeals }),
}));

// export const useMealTime = create((set) => ({
//   selectedDateTime: '',
//   setSelectedDateTime: (time) => set({ selectedDateTime: time }),
// }));

export const useAddMealModalVisible = create((set) => ({
  modalIsVisible: false,
  setModalIsVisible: (state) => set({ modalIsVisible: state }),
}));

export const useMealStore = create((set) => ({
  meal: {},
  setMeal: (meal) => set({ meal }),
}));

export const useMealStatStore = create((set) => ({
  mealsStats: [],
  setMealsStat: (data) => set({ mealsStats: data }),
}));
