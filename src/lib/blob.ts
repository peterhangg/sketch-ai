export async function createBlob(
  source: string | HTMLCanvasElement | Response
): Promise<Blob> {
  let blob;
  if (typeof source === "string") {
    const response = await fetch(source);
    const buffer = await response.arrayBuffer();
    blob = new Blob([buffer], { type: "image/png" });
  } else if (source instanceof HTMLCanvasElement) {
    blob = await new Promise((resolve) => source.toBlob(resolve));
  } else if (source instanceof Response) {
    blob = await source.blob();
  } else {
    throw new Error(
      "Invalid argument. Expected a Response object, a canvas, a data/image URL."
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

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64String = reader.result;
      if (typeof base64String === "string") {
        resolve(base64String.split(",")[1]);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
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
      throw new Error("Unexpected error occurred during download.");
    }

    const blob = await createBlob(response);
    const blobUrl = URL.createObjectURL(blob);
    createDownload(blobUrl);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error(`Error fetching image: ${error}`);
  }
}
