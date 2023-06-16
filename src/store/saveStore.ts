import { create } from "zustand";

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

export const useSaveStore = create<ISaveStore>(
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
