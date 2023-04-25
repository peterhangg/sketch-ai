import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export async function createBlob(
  source: Response | HTMLCanvasElement
): Promise<Blob> {
  let blob;

  if (source instanceof Response) {
    blob = await source.blob();
  } else if (source instanceof HTMLCanvasElement) {
    blob = await new Promise((resolve) => source.toBlob(resolve));
  } else {
    throw new Error(
      "Invalid argument. Expected a Response object or a canvas."
    );
  }
  return blob as Blob;
}

export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsDataURL(blob);
  });
}

export async function blobUrlToDataURL(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  const dataUrl = await blobToDataURL(blob);

  return dataUrl;
}

export function createDownload(blobUrl: string): void {
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = "sketch-ai.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function downloadImage(imageUrl: string): Promise<void> {
  try {
    const response = await fetch(imageUrl, {
      method: "GET",
      headers: {
        Origin: location.origin,
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const blob = await createBlob(response);
    const blobUrl = URL.createObjectURL(blob);
    createDownload(blobUrl);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error(`Error fetching image: ${error}`);
  }
}
