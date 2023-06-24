import { create } from "zustand";
import { createStoreWithSelectors } from "./utils";

interface IGenerateStore {
  prompt: string;
  submitted: boolean;
  loading: boolean;
  error: string | null;
  generatedImage: string;
  setPrompt: (promptMsg: string) => void;
  setLoading: (loadingState: boolean) => void;
  setSubmitted: (submittedState: boolean) => void;
  setError: (errorMessage: string) => void;
  setGeneratedImage: (imageUrl: string) => void;
  reset: () => void;
}

const initialState = {
  prompt: "",
  submitted: false,
  loading: false,
  error: null,
  generatedImage: "",
};

export const generateStore = create<IGenerateStore>(
  (set, _get): IGenerateStore => ({
    ...initialState,
    setPrompt: (promptMsg: string) => {
      return set((state) => ({
        ...state,
        prompt: promptMsg,
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
    setError: (errorMessage: string) => {
      return set((state) => ({
        ...state,
        error: errorMessage,
      }));
    },
    setGeneratedImage: (imageUrl: string) => {
      return set((state) => ({
        ...state,
        generatedImage: imageUrl,
      }));
    },
    reset: () => {
      return set(() => ({
        ...initialState,
      }));
    },
  })
);

export const useGenerateStore = createStoreWithSelectors(generateStore);
