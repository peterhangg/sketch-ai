import React from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion } from "framer-motion";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { displayToast, ToastVariant } from "./ui/Toast";
import { ErrorMessage } from "./ui/ErrorMessage";
import { useDrawStore } from "@/store/drawStore";
import { useGenerateStore } from "@/store/generateStore";
import { useSaveStore } from "@/store/saveStore";
import { promptSchema } from "@/lib/validations";
import { blobUrlToDataURL } from "@/lib/blob";
import { sleep } from "@/lib/utils";
import { FAILED, SOMETHING_WENT_WRONG, SUCCEEDED } from "@/lib/constants";

type FormData = z.infer<typeof promptSchema>;

export function PromptForm() {
  const {
    setGeneratedImage,
    loading,
    setLoading,
    setError,
    setSubmitted,
    setPrompt,
  } = useGenerateStore([
    "setGeneratedImage",
    "loading",
    "setLoading",
    "setError",
    "setSubmitted",
    "setPrompt",
  ]);
  const { sketch } = useDrawStore(["sketch"]);
  const { setSaveAiImage } = useSaveStore(["setSaveAiImage"]);

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      prompt: "",
    },
  });
  const promptValue = watch("prompt");

  const generatePhoto = async (
    imageUrl: string,
    prompt: string
  ): Promise<void> => {
    try {
      setError("");
      setSaveAiImage(false);

      const sketchDataUrl = await blobUrlToDataURL(imageUrl);
      const response = await fetch("/api/prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: sketchDataUrl, prompt }),
      });
      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData?.message || SOMETHING_WENT_WRONG);
        displayToast(
          responseData?.message || SOMETHING_WENT_WRONG,
          ToastVariant.ERROR
        );
        return;
      }

      const startTime = Date.now();
      const timeout = 60000;
      let predictionImage = null;

      while (!predictionImage) {
        const response = await fetch(`/api/prediction/${responseData.id}`);
        const data = await response.json();
        const timeoutDelta = Date.now() - startTime;

        if (data.status === SUCCEEDED) {
          predictionImage = data.output;
        }
        if (data.status === FAILED || timeoutDelta >= timeout) {
          setError(SOMETHING_WENT_WRONG);
          displayToast(SOMETHING_WENT_WRONG, ToastVariant.ERROR);
          return;
        }
        await sleep(1500);
      }

      if (predictionImage) {
        const [_negativeImage, promptImage] = predictionImage;
        setGeneratedImage(promptImage);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateRateLimitExceeded = async () => {
    const rateLimitResponse = await fetch("/api/rate-limit");
    const rateLimitData = await rateLimitResponse.json();

    if (rateLimitResponse.status === 429) {
      displayToast(
        rateLimitData?.message || SOMETHING_WENT_WRONG,
        ToastVariant.ERROR
      );
      return true;
    }
    return false;
  };

  const onSubmit: SubmitHandler<FormData> = async (
    data,
    event?: React.BaseSyntheticEvent
  ): Promise<void> => {
    event?.preventDefault();
    if (loading || !sketch || !data) return;

    const ratelimitExceeded = await validateRateLimitExceeded();
    if (ratelimitExceeded) return;

    setLoading(true);
    setSubmitted(true);
    setPrompt(data.prompt);
    generatePhoto(sketch, data.prompt);
  };

  return (
    <form
      className="my-3 flex w-full flex-col p-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <motion.div
        className="flex w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        variants={{
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 },
        }}
      >
        <Input
          id="prompt"
          className="rounded-r-none"
          placeholder="Describe the image you want to create..."
          {...register("prompt")}
        />
        <Button className="rounded-l-none" disabled={loading || !promptValue}>
          Submit
        </Button>
      </motion.div>
      {errors?.prompt && <ErrorMessage message={errors.prompt.message} />}
    </form>
  );
}
