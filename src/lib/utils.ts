import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PollOptions } from "./types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function poll<T>({
  fn,
  validateFn,
  exitFn,
  interval = 1000,
  timeout = 60000,
}: PollOptions<T>): Promise<T> {
  const startTime = Date.now();
  let result: T;

  while (Date.now() - startTime < timeout) {
    result = await fn();
    // TODO: Integrate logger
    if (process.env.NEXT_PUBLIC_DEBUG) {
      console.log({ result });
    }
    if (validateFn(result)) {
      return result;
    }
    if (exitFn(result)) {
      throw new Error(`Polling exited early after ${timeout} ms`);
    }
    await sleep(interval);
  }
  throw new Error(`Polling timed out after ${timeout} ms`);
}

export function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return {
    hours,
    minutes,
    seconds: remainingSeconds,
  };
}
