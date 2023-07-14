import React from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { isValidUrl } from "@/lib/utils";
import { AiImage, Sketch } from "@prisma/client";
import { GalleryCard } from "@/components/GalleryCard";
import { displayToast, ToastVariant } from "@/components/ui/Toast";
import { Toggle } from "@/components/ui/Toggle";
import { GalleryLoader } from "@/components/GalleryLoader";
import { useIntersection } from "@/hooks/useIntersection";
import { useDrawStore } from "@/store/drawStore";
import { useGenerateStore } from "@/store/generateStore";
import { AI_IMAGE, SKETCH, SOMETHING_WENT_WRONG } from "@/lib/constants";

export default function GalleryPage() {
  const [sketchList, setSketchList] = React.useState<Sketch[]>([]);
  const [aiImageList, setAiImageList] = React.useState<AiImage[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [_error, setError] = React.useState<string | null>(null);
  const [hasMoreDataForSketches, setHasMoreDataForSketches] =
    React.useState<boolean>(false);
  const [hasMoreDataForAiImages, setHasMoreDataForAiImages] =
    React.useState<boolean>(false);
  const [nextCursorForSketches, setNextCursorForSketches] = React.useState<
    string | null
  >(null);
  const [nextCursorForAiImages, setNextCursorForAiImages] = React.useState<
    string | null
  >(null);
  const [showAiModel, setShowAiModel] = React.useState<boolean>(false);
  const intersectionRef = React.useRef<HTMLDivElement>(null);

  const { setSketch, setSrcFromGallery, reset } = useDrawStore([
    "setSketch",
    "setSrcFromGallery",
    "reset",
  ]);
  const { reset: resetGenerate } = useGenerateStore(["reset"]);

  const router = useRouter();
  const { data: session } = useSession();
  const user = React.useMemo(() => {
    return session?.user;
  }, [session]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [sketchesRes, aiImagesRes] = await Promise.all([
          fetch(`/api/images?cursor=${""}&imageModel=${SKETCH}`),
          fetch(`/api/images?cursor=${""}&imageModel=${AI_IMAGE}`),
        ]);
        const sketchesData = await sketchesRes.json();
        const aiImagesData = await aiImagesRes.json();

        setSketchList(sketchesData.images);
        setNextCursorForSketches(sketchesData.cursor);
        setHasMoreDataForSketches(sketchesData.hasMore);

        setAiImageList(aiImagesData.images);
        setNextCursorForAiImages(aiImagesData.cursor);
        setHasMoreDataForAiImages(aiImagesData.hasMore);
      } catch (error) {
        console.error(error);
        displayToast(SOMETHING_WENT_WRONG, ToastVariant.ERROR);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getImagesHandler = React.useCallback(async () => {
    let imageModel = SKETCH;
    let cursor = nextCursorForSketches as string | null;
    let hasMoreData = hasMoreDataForSketches as boolean | null;

    if (showAiModel) {
      imageModel = AI_IMAGE;
      cursor = nextCursorForAiImages;
      hasMoreData = hasMoreDataForAiImages;
    }

    if (!cursor || loading || !hasMoreData) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/images?cursor=${cursor}&imageModel=${imageModel}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || SOMETHING_WENT_WRONG);
        displayToast(data?.message || SOMETHING_WENT_WRONG, ToastVariant.ERROR);
        return;
      }

      if (showAiModel) {
        setAiImageList((prev) => [...prev, ...data.images]);
        setNextCursorForAiImages(data.cursor);
        setHasMoreDataForAiImages(data.hasMore);
      } else {
        setSketchList((prev) => [...prev, ...data.images]);
        setNextCursorForSketches(data.cursor);
        setHasMoreDataForSketches(data.hasMore);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    showAiModel,
    nextCursorForSketches,
    nextCursorForAiImages,
    hasMoreDataForSketches,
    hasMoreDataForAiImages,
  ]);

  const deleteHandler = React.useCallback(
    async (imageUrl: string) => {
      if (!user || !imageUrl) return;

      const validateUrl = isValidUrl(imageUrl);
      if (!validateUrl) return;

      const imageModel = showAiModel ? AI_IMAGE : SKETCH;

      try {
        setError(null);
        const response = await fetch(
          `/api/upload?imageUrl=${imageUrl}&imageModel=${imageModel}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data?.message || SOMETHING_WENT_WRONG);
          displayToast(
            data?.message || SOMETHING_WENT_WRONG,
            ToastVariant.ERROR
          );
          return;
        }

        if (showAiModel) {
          const updatedAiImages = aiImageList.filter(
            (aiImage) => aiImage.url !== imageUrl
          );
          setAiImageList(updatedAiImages);
          displayToast("AI image successfully deleted", ToastVariant.SUCCESS);
        } else {
          const updatedSketches = sketchList.filter(
            (sketch) => sketch.url !== imageUrl
          );
          setSketchList(updatedSketches);
          displayToast("Sketch successfully deleted", ToastVariant.SUCCESS);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [user, sketchList, aiImageList, showAiModel]
  );

  const setSketchHandler = React.useCallback(
    (sketchUrl: string) => {
      if (!user || !sketchUrl) return;

      reset();
      resetGenerate();
      setSketch(sketchUrl);
      setSrcFromGallery(true);
      router.push("/");
    },
    [user, router, setSketch, reset, setSrcFromGallery, resetGenerate]
  );

  useIntersection({ targetRef: intersectionRef, callback: getImagesHandler });

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <h1 className="mt-4 text-2xl font-semibold tracking-tighter">Gallery</h1>
      <Toggle
        showAiModel={showAiModel}
        setShowAiModel={() => setShowAiModel((prev) => !prev)}
      />
      <div className="container my-2 grid flex-1 grid-cols-1 gap-3 p-2 md:grid-cols-2 lg:grid-cols-3">
        {showAiModel
          ? aiImageList.map((aiImage) => (
              <GalleryCard
                key={aiImage.id}
                image={aiImage}
                imageModel={AI_IMAGE}
                setImageHandler={setSketchHandler}
                deleteHandler={deleteHandler}
              />
            ))
          : sketchList.map((sketch) => (
              <GalleryCard
                key={sketch.id}
                image={sketch}
                imageModel={SKETCH}
                setImageHandler={setSketchHandler}
                deleteHandler={deleteHandler}
              />
            ))}
      </div>
      {loading && <GalleryLoader />}
      <div ref={intersectionRef}></div>
    </div>
  );
}
