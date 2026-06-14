import "server-only";

import { auth } from "@/auth";
import { createMiddleware } from "hono/factory";

type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type AdditionalContext = {
  Variables: {
    user: AuthUser;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const session = await auth();

    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user", {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    });

    await next();
  },
);
