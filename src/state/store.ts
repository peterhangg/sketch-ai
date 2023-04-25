import { create } from "zustand";

interface IDrawStore {
  prompt: string;
  sketch: string;
  generatedImage: string;
  submitted: boolean;
  loading: boolean;
  error: { message: string } | null;
  setPrompt: (promptMsg: string) => void;
  setSketch: (imageUrl: string) => void;
  setGeneratedImage: (imageUrl: string) => void;
  setLoading: (payload: boolean) => void;
  setError: (payload: { message: string }) => void;
  setSubmitted: (submittedState: boolean) => void;
  reset: () => void;
}

const initialState = {
  prompt: "",
  sketch: "",
  generatedImage: "",
  submitted: false,
  loading: false,
  error: null,
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
    setError: (error: { message: string }) => {
      return set((state) => ({
        ...state,
        error,
      }));
    },
    reset: () => {
      return set((state) => ({
        ...state,
        submitted: false,
        generatedImage: "",
        sketch: "",
      }));
    },
  })
);
