import { create } from "zustand";
import { createStoreWithSelectors } from "./utils";

interface IColorPickerStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggleOpen: () => void;
}

const colorPickerStore = create<IColorPickerStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const useColorPickerStore = createStoreWithSelectors(colorPickerStore);
