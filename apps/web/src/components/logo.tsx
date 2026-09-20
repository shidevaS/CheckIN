import Link from "next/link";
import { APP_NAME } from "@tuiton/shared";
import { clsx } from "clsx";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={clsx("font-serif text-xl font-semibold tracking-tight text-foreground", className)}
    >
      {APP_NAME}
      <span className="text-[rgb(var(--primary))]">.</span>
    </Link>
  );
}