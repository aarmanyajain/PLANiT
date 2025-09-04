import { create } from 'zustand';

const useThemeStore = create((set) => ({
  darkTheme: false,
  toggleTheme: () => set((state) => ({ darkTheme: !state.darkTheme })),
  setTheme: (value) => set({ darkTheme: value }),
}));

export default useThemeStore;
