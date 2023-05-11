import React, { ReactElement, ReactNode } from "react";
import toast from "react-hot-toast";
import { cva, VariantProps } from "class-variance-authority";
import {
  CheckCircleIcon,
  XMarkIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastStyles> {
  message: string;
  toastVisible: boolean;
  variant: ToastVariant;
  handler: () => void;
  className?: string;
}

export enum ToastVariant {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  DEFAULT = "default",
}

const toastStyles = cva(
  "relative flex max-w-xs items-center space-x-4 rounded-lg p-3 shadow justify-between",
  {
    variants: {
      variant: {
        default: "bg-white text-slate-700",
        success: "bg-green-600 text-white",
        error: "bg-red-600 text-white",
        warning: "bg-yellow-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const TOAST_DURATION = 2000;

const getToastIcon = (
  variant: ToastVariant,
  className?: string
): React.ReactElement => {
  switch (variant) {
    case ToastVariant.SUCCESS:
      return (
        <CheckCircleIcon className={cn("h-5 w-5 fill-white", className)} />
      );
    case ToastVariant.ERROR:
      return <XCircleIcon className={cn("h-5 w-5 fill-white", className)} />;
    case ToastVariant.WARNING:
      return (
        <ExclamationCircleIcon
          className={cn("h-5 w-5 fill-white", className)}
        />
      );
    default:
      return (
        <CheckCircleIcon className={cn("h-5 w-5 fill-white", className)} />
      );
  }
};

export const Toast = ({
  message,
  toastVisible,
  variant,
  className,
  handler,
  ...props
}: ToastProps) => (
  <div
    className={cn(
      toastStyles({
        variant,
        className,
      }),
      toastVisible && "animate-fade-in-left"
    )}
    {...props}
  >
    <span>{getToastIcon(variant)}</span>
    <p data-testid={`toast-${variant}`} className="p-1">
      {message}
    </p>
    <div onClick={handler}>
      <XMarkIcon className="h-5 w-5 fill-white" />
    </div>
  </div>
);

export function displayToast(
  message: string,
  variant: ToastVariant,
  duration = TOAST_DURATION
) {
  switch (variant) {
    case ToastVariant.SUCCESS:
      return toast.custom(
        (t) => (
          <Toast
            className={cn(toastStyles({ variant: ToastVariant.SUCCESS }))}
            message={message}
            toastVisible={t.visible}
            variant={ToastVariant.SUCCESS}
            handler={() => toast.remove(t.id)}
          />
        ),
        { duration, position: "bottom-right" }
      );
    case ToastVariant.ERROR:
      return toast.custom(
        (t) => (
          <Toast
            className={cn(toastStyles({ variant: ToastVariant.ERROR }))}
            message={message}
            toastVisible={t.visible}
            variant={ToastVariant.ERROR}
            handler={() => toast.remove(t.id)}
          />
        ),
        { duration, position: "bottom-right" }
      );
    case ToastVariant.WARNING:
      return toast.custom(
        (t) => (
          <Toast
            className={cn(toastStyles({ variant: ToastVariant.WARNING }))}
            message={message}
            toastVisible={t.visible}
            variant={ToastVariant.WARNING}
            handler={() => toast.remove(t.id)}
          />
        ),
        { duration, position: "bottom-right" }
      );
    default:
      return toast.custom(
        (t) => (
          <Toast
            className={cn(toastStyles({ variant: ToastVariant.DEFAULT }))}
            message={message}
            toastVisible={t.visible}
            variant={ToastVariant.DEFAULT}
            handler={() => toast.remove(t.id)}
          />
        ),
        { duration, position: "bottom-right" }
      );
  }
}
