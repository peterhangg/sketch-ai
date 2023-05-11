import { create } from "zustand";

interface IColorPickerStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggleOpen: () => void;
}

const useColorPickerStore = create<IColorPickerStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export default useColorPickerStore;
