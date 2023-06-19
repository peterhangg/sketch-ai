import { create } from "zustand";

interface IDrawStore {
  sketch: string;
  sketchBlob: Blob | null;
  srcFromGallery: boolean;
  setSketch: (imageUrl: string) => void;
  setSketchBlob: (imageUrl: Blob) => void;
  setSrcFromGallery: (srcState: boolean) => void;
  reset: () => void;
}

const initialState = {
  sketch: "",
  sketchBlob: null,
  srcFromGallery: false,
};

export const useDrawStore = create<IDrawStore>(
  (set, _get): IDrawStore => ({
    ...initialState,
    setSketch: (imageUrl: string) => {
      return set((state) => ({
        ...state,
        sketch: imageUrl,
      }));
    },
    setSketchBlob: (sketch: Blob) => {
      return set((state) => ({
        ...state,
        sketchBlob: sketch,
      }));
    },
    setSrcFromGallery: (srcState: boolean) => {
      return set((state) => ({
        ...state,
        srcFromGallery: srcState,
      }));
    },
    reset: () => {
      return set(() => ({
        ...initialState,
      }));
    },
  })
);
