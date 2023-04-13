import React from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useDrawStore } from "@/state/store";
import { promptSchema } from "@/lib/validations";
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

  const generatePhoto = async (imageUrl: string, prompt: string) => {
    try {
      const res = await fetch("/api/prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl, prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
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
  ) => {
    event?.preventDefault();
    if (loading) return;

    setLoading(true);
    setSubmitted(true);
    generatePhoto(sketch, data.prompt);
  };

  return (
    <form className="my-3 flex flex-col p-2" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-1">
        <Input
          id="prompt"
          className="rounded-r-none"
          placeholder="Describe the image you want to create..."
          {...register("prompt")}
        />
        <Button className="rounded-l-none" size="lg" disabled={loading}>
          Submit
        </Button>
      </div>
      {errors?.prompt && <ErrorMessage message={errors.prompt.message} />}
    </form>
  );
}
