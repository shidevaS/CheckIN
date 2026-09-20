"use client";

import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";

export function SignOutButton({ label = "Sign out" }: { label?: string }) {
  const router = useRouter();
  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };
  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      {label}
    </Button>
  );
}