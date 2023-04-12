import React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useDrawStore } from "@/state/store";
import { promptSchema } from "@/lib/validations";
import { ErrorMessage } from "./ui/ErrorMessage";

type FormData = z.infer<typeof promptSchema>;

const PromptForm = () => {
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
    <form className="my-3 flex flex-col p-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-1">
        <input
          id="prompt"
          type="text"
          className="flex-1 rounded-l-md border border-gray-300 px-4 py-2"
          placeholder="Describe the image you want to create..."
          {...register("prompt")}
        />
        <button
          className="rounded-r-md bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
          disabled={loading}
        >
          Submit
        </button>
      </div>
      {errors?.prompt && <ErrorMessage message={errors.prompt.message} />}
    </form>
  );
};

export default PromptForm;
