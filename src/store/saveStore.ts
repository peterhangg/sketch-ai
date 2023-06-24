import { create } from "zustand";
import { createStoreWithSelectors } from "./util";

interface ISaveStore {
  saveSketch: boolean;
  saveAiImage: boolean;
  setSaveSketch: (saveState: boolean) => void;
  setSaveAiImage: (saveState: boolean) => void;
  reset: () => void;
}

const initialState = {
  saveSketch: false,
  saveAiImage: false,
};

export const saveStore = create<ISaveStore>(
  (set, _get): ISaveStore => ({
    ...initialState,
    setSaveSketch: (saveState: boolean) => {
      return set((state) => ({
        ...state,
        saveSketch: saveState,
      }));
    },
    setSaveAiImage: (saveState: boolean) => {
      return set((state) => ({
        ...state,
        saveAiImage: saveState,
      }));
    },
    reset: () => {
      return set(() => ({
        ...initialState,
      }));
    },
  })
);

export const useSaveStore = createStoreWithSelectors(saveStore);
