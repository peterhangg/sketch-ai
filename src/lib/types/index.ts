import { DefaultSession } from "next-auth";

export type Point = { x: number; y: number };

export type Draw = {
  ctx: CanvasRenderingContext2D;
  currPoint: Point;
  prevPoint: Point | null;
  color?: string;
  width?: number;
};

export type User = DefaultSession["user"] & {
  id: string;
};

export type ImageModel = "sketch" | "ai-image";

export enum ImageFileExtension {
  PNG = ".png",
  JPG = ".jpg",
  JPEG = ".jpeg",
}

export interface PollOptions<T> {
  fn: () => Promise<T>;
  validateFn: (result: T) => boolean;
  exitFn: (result: T) => boolean;
  interval?: number;
  timeout?: number;
}

export interface Replicate {
  id: string;
  version: string;
  urls: ReplicateMetricsUrls;
  created_at: Date;
  started_at: Date;
  completed_at: Date;
  source: string;
  status: string;
  input: ReplicateInput;
  output: string[];
  error: null;
  logs: string;
  metrics: ReplicateMetrics;
}

interface ReplicateInput {
  prompt: string;
}

interface ReplicateMetrics {
  predict_time: number;
}

interface ReplicateMetricsUrls {
  get: string;
  cancel: string;
}
