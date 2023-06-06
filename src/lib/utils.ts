import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

export async function pollUntilDone<T>(
  fn: () => Promise<T>,
  intervalMs = 1000,
  timeoutMs = 20000
): Promise<T> {
  const start = Date.now();

  while (true) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      if (Date.now() - start > timeoutMs) {
        if (error instanceof Error) {
          throw new Error(
            `Function timed out after ${timeoutMs} ms: ${error.message}`
          );
        } else {
          throw new Error(
            `Function timed out after ${timeoutMs} ms: Unknown error occurred`
          );
        }
      }
    }
    await sleep(intervalMs);
  }
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
