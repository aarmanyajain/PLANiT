import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = '@tasks';

const useTaskStore = create((set, get) => ({
  tasks: [],
   lastSynced: null,

  loadTasks: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (jsonValue != null) {
        set({ tasks: JSON.parse(jsonValue) });
      }
    } catch (e) {
      console.log('Failed to load tasks', e);
    }
  },

  addTask: async (task) => {
    console.log("addTask called with:", task);
    const newTasks = [...get().tasks, task];
    set({ tasks: newTasks });
    console.log("Tasks inside store after add:", newTasks);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
  },

  updateTask: async (updatedTask) => {
    console.log("updateTask called with:", updatedTask);
    const newTasks = get().tasks.map(t =>
      t.id === updatedTask.id ? { ...t, ...updatedTask } : t
    );
    set({ tasks: newTasks });
    console.log("Tasks inside store after update:", newTasks);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
  },

  deleteTask: async (id) => {
    const newTasks = get().tasks.filter(t => t.id !== id);
    set({ tasks: newTasks });
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
  },

  toggleTaskCompleted: async (id) => {
    const newTasks = get().tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    set({ tasks: newTasks });
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
  },

syncTasks: async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 5000));

    set({ lastSynced: new Date().toISOString() });
  } catch (e) {
    set({ lastSynced: "offline" });
  }
}

}));

export default useTaskStore;
