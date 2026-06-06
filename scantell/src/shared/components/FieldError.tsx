interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 mt-1.5 pl-1" role="alert">
      {message}
    </p>
  );
}
