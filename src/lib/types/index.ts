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

export enum ImageFileExtension {
  PNG = ".png",
  JPG = ".jpg",
  JPEG = ".jpeg",
}
