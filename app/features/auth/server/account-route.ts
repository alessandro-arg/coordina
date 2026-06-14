import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/db/connect";
import { UserModel } from "@/lib/db/models";
import { registerSchema } from "../schemas";

const app = new Hono().post(
  "/register",
  zValidator("json", registerSchema),
  async (c) => {
    const { name, email, password } = c.req.valid("json");

    await connectToDatabase();

    const existingUser = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return c.json({ error: "Email already in use" }, 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      emailVerified: null,
      image: null,
    });

    return c.json({
      data: {
        $id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  },
);

export default app;
