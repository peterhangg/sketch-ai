import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
}

const initialState = {
  prompt: "",
  sketch: "",
  generatedImage: "",
  submitted: false,
  loading: false,
  error: null,
};

export const useDrawStore = create(
  persist<IDrawStore>(
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
    }),
    {
      name: "draw-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
