import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export function useRedirectAuthenticated(path: string = "/") {
  const { status } = useSession();
  const router = useRouter();

  if (status === "authenticated") router.push(path);
}
