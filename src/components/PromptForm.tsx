import React from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion } from "framer-motion";
import { useDrawStore } from "@/state/store";
import { promptSchema } from "@/lib/validations";
import { blobUrlToDataURL } from "@/lib/utils";
import { ErrorMessage } from "./ui/ErrorMessage";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

type FormData = z.infer<typeof promptSchema>;

export function PromptForm() {
  const store = useDrawStore((state) => state);
  const {
    sketch,
    setGeneratedImage,
    loading,
    setLoading,
    setError,
    setSubmitted,
    setPrompt,
  } = store;

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const generatePhoto = async (
    imageUrl: string,
    prompt: string
  ): Promise<void> => {
    try {
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
        setError(data);
        return;
      }

      setGeneratedImage(data);
    } catch (reason) {
      setError({ message: "unexpected error try again" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = (
    data,
    event?: React.BaseSyntheticEvent
  ): void => {
    event?.preventDefault();
    if (loading || !sketch || !data) return;

    setLoading(true);
    setSubmitted(true);
    setPrompt(data.prompt);
    generatePhoto(sketch, data.prompt);
  };

  return (
    <form className="my-3 flex flex-col p-2" onSubmit={handleSubmit(onSubmit)}>
      <motion.div
        className="flex flex-1"
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
        <Button className="rounded-l-none" size="lg" disabled={loading}>
          Submit
        </Button>
      </motion.div>
      {errors?.prompt && <ErrorMessage message={errors.prompt.message} />}
    </form>
  );
}
