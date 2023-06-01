import React from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion } from "framer-motion";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { displayToast, ToastVariant } from "./ui/Toast";
import { useDrawStore } from "@/state/drawStore";
import useColorPickerStore from "@/state/colorPickerStore";
import { promptSchema } from "@/lib/validations";
import { blobUrlToDataURL } from "@/lib/blob";
import { ErrorMessage } from "./ui/ErrorMessage";
import { SOMETHING_WENT_WRONG } from "@/lib/constants";

type FormData = z.infer<typeof promptSchema>;

export function PromptForm() {
  const {
    sketch,
    setGeneratedImage,
    loading,
    setLoading,
    setGenerateError,
    setSubmitted,
    setPrompt,
  } = useDrawStore((state) => state);
  const { onClose } = useColorPickerStore((state) => state);

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
      setGenerateError("");
      const sketchDataUrl = await blobUrlToDataURL(imageUrl);

      const response = await fetch("/api/prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: sketchDataUrl, prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGenerateError(data?.message || SOMETHING_WENT_WRONG);
        displayToast(data?.message || SOMETHING_WENT_WRONG, ToastVariant.ERROR);
        return;
      }

      setGeneratedImage(data);
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
          onClick={onClose}
        />
        <Button className="rounded-l-none" disabled={loading || !promptValue}>
          Submit
        </Button>
      </motion.div>
      {errors?.prompt && <ErrorMessage message={errors.prompt.message} />}
    </form>
  );
}
