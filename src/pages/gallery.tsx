import React from "react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { AnimatePresence } from "framer-motion";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidUrl } from "@/lib/utils";
import { AiImage, Sketch, User } from "@prisma/client";
import { GalleryCard } from "@/components/GalleryCard";
import { displayToast, ToastVariant } from "@/components/ui/Toast";
import { Toggle } from "@/components/ui/Toggle";
import { useIntersection } from "@/hooks/useIntersection";
import { useDrawStore } from "@/state/drawStore";
import { AI_IMAGE, SKETCH, SOMETHING_WENT_WRONG } from "@/lib/constants";

interface GalleryPageProps {
  user: User;
  initialSketches: Sketch[];
  initialAiImages: AiImage[];
  hasMoreSketches: boolean;
  hasMoreAiImages: boolean;
  cursorForSketches: string | null;
  cursorForAiImages: string | null;
}

export default function GalleryPage({
  user,
  initialSketches,
  initialAiImages,
  hasMoreSketches,
  hasMoreAiImages,
  cursorForSketches,
  cursorForAiImages,
}: GalleryPageProps) {
  const [sketchList, setSketchList] = React.useState<Sketch[]>(initialSketches);
  const [aiImageList, setAiImageList] =
    React.useState<Sketch[]>(initialAiImages);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [_error, setError] = React.useState<string | null>(null);
  const [hasMoreDataForSketches, setHasMoreDataForSketches] =
    React.useState<boolean>(hasMoreSketches);
  const [hasMoreDataForAiImages, setHasMoreDataForAiImages] =
    React.useState<boolean>(hasMoreAiImages);
  const [nextCursorForSketches, setNextCursorForSketches] = React.useState<
    string | null
  >(cursorForSketches);
  const [nextCursorForAiImages, setNextCursorForAiImages] = React.useState<
    string | null
  >(cursorForAiImages);
  const [showAiModel, setShowAiModel] = React.useState<boolean>(false);
  const { setSketch, setSrcFromGallery, reset } = useDrawStore(
    (state) => state
  );
  const intersectionRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

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

    setLoading(true);

    try {
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
      setSketch(sketchUrl);
      setSrcFromGallery(true);
      router.push("/");
    },
    [user, router, setSketch, reset, setSrcFromGallery]
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
        <AnimatePresence>
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
        </AnimatePresence>
        <div ref={intersectionRef}></div>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);
  const userId = session?.user.id;

  const sketches = await prisma.sketch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  const hasMoreSketches = sketches.length === 6;
  const cursorForSketches = hasMoreSketches
    ? sketches[sketches.length - 1].createdAt.toISOString()
    : null;
  const formattedSketches = sketches.map((sketch) => ({
    ...sketch,
    createdAt: sketch.createdAt.toISOString(),
  }));

  const aiImages = await prisma.aiImage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  const hasMoreAiImages = aiImages.length === 6;
  const cursorForAiImages = hasMoreAiImages
    ? aiImages[aiImages.length - 1].createdAt.toISOString()
    : null;
  const formattedAiImages = aiImages.map((aiImage) => ({
    ...aiImage,
    createdAt: aiImage.createdAt.toISOString(),
  }));

  return {
    props: {
      user: session?.user || null,
      initialSketches: formattedSketches,
      initialAiImages: formattedAiImages,
      hasMoreSketches,
      cursorForSketches,
      hasMoreAiImages,
      cursorForAiImages,
    },
  };
}
