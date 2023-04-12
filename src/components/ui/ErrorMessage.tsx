interface ErrorMessageProps {
  message: string | undefined;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="mt-2 max-w-max rounded-md border-2 border-red-500 border-opacity-50 bg-red-50 p-3">
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}
