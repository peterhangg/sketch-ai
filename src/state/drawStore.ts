import { create } from "zustand";

interface IDrawStore {
  prompt: string;
  sketch: string;
  sketchBlob: Blob | null;
  generatedImage: string;
  submitted: boolean;
  loading: boolean;
  generateError: string | null;
  srcFromGallery: boolean;
  saved: boolean;
  setPrompt: (promptMsg: string) => void;
  setSketch: (imageUrl: string) => void;
  setSketchBlob: (imageUrl: Blob) => void;
  setGeneratedImage: (imageUrl: string) => void;
  setLoading: (loadingState: boolean) => void;
  setSubmitted: (submittedState: boolean) => void;
  setGenerateError: (errorMessage: string) => void;
  setSaved: (savedState: boolean) => void;
  setSrcFromGallery: (srcState: boolean) => void;
  reset: () => void;
}

const initialState = {
  prompt: "",
  sketch: "",
  sketchBlob: null,
  generatedImage: "",
  submitted: false,
  loading: false,
  generateError: null,
  srcFromGallery: false,
  saved: false,
};

export const useDrawStore = create<IDrawStore>(
  (set, _get): IDrawStore => ({
    ...initialState,
    setPrompt: (promptMsg: string) => {
      return set((state) => ({
        ...state,
        prompt: promptMsg,
      }));
    },
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
    setGeneratedImage: (imageUrl: string) => {
      return set((state) => ({
        ...state,
        generatedImage: imageUrl,
      }));
    },
    setSubmitted: (submittedState: boolean) => {
      return set((state) => ({
        ...state,
        submitted: submittedState,
      }));
    },
    setLoading: (loadingState: boolean) => {
      return set((state) => ({
        ...state,
        loading: loadingState,
      }));
    },
    setGenerateError: (errorMessage: string) => {
      return set((state) => ({
        ...state,
        generateError: errorMessage,
      }));
    },
    setSaved: (savedState: boolean) => {
      return set((state) => ({
        ...state,
        saved: savedState,
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
