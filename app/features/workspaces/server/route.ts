import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";
import { connectToDatabase } from "@/lib/db/connect";
import { MemberModel, MemberRole, WorkspaceModel } from "@/lib/db/models";
import { generateInviteCode } from "@/lib/utils";
import { createWorkspaceSchema } from "../schemas";

const serializeWorkspace = (workspace: {
  _id: unknown;
  name?: string;
  imageUrl?: string | null;
  inviteCode?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) => ({
  ...workspace,
  $id: String(workspace._id),
});

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const user = c.get("user");

    await connectToDatabase();

    const members = await MemberModel.find({ userId: user.id }).lean();

    if (members.length === 0) {
      return c.json({
        data: {
          rows: [],
          total: 0,
        },
      });
    }

    const workspaceIds = members.map((member) => member.workspaceId);

    const workspaces = await WorkspaceModel.find({
      _id: { $in: workspaceIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    return c.json({
      data: {
        rows: workspaces.map(serializeWorkspace),
        total: workspaces.length,
      },
    });
  })

  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createWorkspaceSchema),
    async (c) => {
      const user = c.get("user");
      const { name } = c.req.valid("form");

      await connectToDatabase();

      const workspace = await WorkspaceModel.create({
        name,
        imageUrl: null,
        inviteCode: generateInviteCode(8),
        userId: user.id,
      });

      await MemberModel.create({
        workspaceId: workspace._id.toString(),
        userId: user.id,
        role: MemberRole.ADMIN,
      });

      return c.json({
        data: serializeWorkspace(workspace.toObject()),
      });
    },
  )

  .get("/:workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    await connectToDatabase();

    const member = await MemberModel.findOne({
      workspaceId,
      userId: user.id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const workspace = await WorkspaceModel.findById(workspaceId).lean();

    if (!workspace) {
      return c.json({ error: "Workspace not found" }, 404);
    }

    return c.json({
      data: serializeWorkspace(workspace),
    });
  });

export default app;
