import { Hono } from "hono";
import { auth } from "@/auth";

const app = new Hono().get("/", async (c) => {
  const session = await auth();

  if (!session?.user) {
    return c.json({ data: null }, 401);
  }

  return c.json({
    data: session.user,
  });
});

export default app;
