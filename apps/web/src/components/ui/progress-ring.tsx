import { ReactNode } from "react";

export function ProgressRing({
  className,
  size = "lg",
  strokeWidth = 4,
  ...rest
}: {
  className?: string;
  size?: string;
  strokeWidth?: number;
  rest?: Record<string, any>;
}) {
  const sizes = {
    sm: "32",
    md: "40",
    lg: "48",
    xl: "56",
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={sizes[size as keyof typeof sizes]}
      height={sizes[size as keyof typeof sizes]}
      stroke="currentColor"
      fill="none"
      {...rest}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"
      />
      <path
        fill="currentColor"
        d="M12 3a1 1 0 0 1 1 1v8m0-8a7 7 0 1 1 0 14A7 7 0 0 1 12 3z"
      />
    </svg>
  );
}