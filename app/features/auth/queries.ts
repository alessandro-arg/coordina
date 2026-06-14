import { auth } from "@/auth";

export const getCurrent = async () => {
  const session = await auth();

  return session?.user ?? null;
};
