import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";
import { connectToDatabase } from "@/lib/db/connect";
import {
  MemberModel,
  MemberRole,
  WorkspaceModel,
  TaskModel,
  ProjectModel,
} from "@/lib/db/models";
import { TaskStatus } from "../../tasks/types";
import { getMember } from "../../members/utils";
import { generateInviteCode } from "@/lib/utils";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { uploadImage } from "@/lib/cloudinary";
import { z } from "zod";

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
      const { name, image } = c.req.valid("form");

      await connectToDatabase();

      let imageUrl: string | null = null;

      if (image instanceof File) {
        imageUrl = await uploadImage(image, "coordina/workspaces");
      } else if (typeof image === "string" && image.length > 0) {
        imageUrl = image;
      }

      const workspace = await WorkspaceModel.create({
        name,
        imageUrl,
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

  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const user = c.get("user");
      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");

      await connectToDatabase();

      const member = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const updateData: {
        name?: string;
        imageUrl?: string | null;
      } = {};

      if (name !== undefined) {
        updateData.name = name;
      }

      if (image instanceof File) {
        updateData.imageUrl = await uploadImage(image, "coordina/workspaces");
      } else if (typeof image === "string") {
        updateData.imageUrl = image.length > 0 ? image : null;
      }

      const workspace = await WorkspaceModel.findByIdAndUpdate(
        workspaceId,
        updateData,
        { new: true },
      ).lean();

      if (!workspace) {
        return c.json({ error: "Workspace not found" }, 404);
      }

      return c.json({
        data: serializeWorkspace(workspace),
      });
    },
  )

  .get("/:workspaceId/info", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    await connectToDatabase();

    const member = await getMember({
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
      data: {
        $id: String(workspace._id),
        name: workspace.name,
        imageUrl: workspace.imageUrl,
      },
    });
  })

  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({ inviteCode: z.string() })),
    async (c) => {
      const user = c.get("user");
      const { workspaceId } = c.req.param();
      const { inviteCode } = c.req.valid("json");

      await connectToDatabase();

      const existingMember = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (existingMember) {
        return c.json({ error: "Already a member" }, 400);
      }

      const workspace = await WorkspaceModel.findById(workspaceId).lean();

      if (!workspace) {
        return c.json({ error: "Workspace not found" }, 404);
      }

      if (workspace.inviteCode !== inviteCode) {
        return c.json({ error: "Invalid invite code" }, 400);
      }

      await MemberModel.create({
        workspaceId,
        userId: user.id,
        role: MemberRole.MEMBER,
      });

      return c.json({
        data: serializeWorkspace(workspace),
      });
    },
  )

  .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    await connectToDatabase();

    const member = await getMember({
      workspaceId,
      userId: user.id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const workspace = await WorkspaceModel.findByIdAndUpdate(
      workspaceId,
      {
        inviteCode: generateInviteCode(8),
      },
      { new: true },
    ).lean();

    if (!workspace) {
      return c.json({ error: "Workspace not found" }, 404);
    }

    return c.json({
      data: serializeWorkspace(workspace),
    });
  })

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
  })

  .get("/:workspaceId/analytics", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    await connectToDatabase();

    const member = await getMember({
      workspaceId,
      userId: user.id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const now = new Date();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const [
      thisMonthTasks,
      lastMonthTasks,
      thisMonthAssignedTasks,
      lastMonthAssignedTasks,
      thisMonthIncompleteTasks,
      lastMonthIncompleteTasks,
      thisMonthCompletedTasks,
      lastMonthCompletedTasks,
      thisMonthOverdueTasks,
      lastMonthOverdueTasks,
    ] = await Promise.all([
      TaskModel.countDocuments({
        workspaceId,
        createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }),

      TaskModel.countDocuments({
        workspaceId,
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),

      TaskModel.countDocuments({
        workspaceId,
        assigneeId: String(member._id),
        createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }),

      TaskModel.countDocuments({
        workspaceId,
        assigneeId: String(member._id),
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),

      TaskModel.countDocuments({
        workspaceId,
        status: { $ne: TaskStatus.DONE },
        createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }),

      TaskModel.countDocuments({
        workspaceId,
        status: { $ne: TaskStatus.DONE },
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),

      TaskModel.countDocuments({
        workspaceId,
        status: TaskStatus.DONE,
        createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }),

      TaskModel.countDocuments({
        workspaceId,
        status: TaskStatus.DONE,
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),

      TaskModel.countDocuments({
        workspaceId,
        status: { $ne: TaskStatus.DONE },
        dueDate: { $lt: now },
        createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }),

      TaskModel.countDocuments({
        workspaceId,
        status: { $ne: TaskStatus.DONE },
        dueDate: { $lt: now },
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),
    ]);

    return c.json({
      data: {
        taskCount: thisMonthTasks,
        taskDifference: thisMonthTasks - lastMonthTasks,

        assignedTaskCount: thisMonthAssignedTasks,
        assignedTaskDifference: thisMonthAssignedTasks - lastMonthAssignedTasks,

        completedTaskCount: thisMonthCompletedTasks,
        completedTaskDifference:
          thisMonthCompletedTasks - lastMonthCompletedTasks,

        incompleteTaskCount: thisMonthIncompleteTasks,
        incompleteTaskDifference:
          thisMonthIncompleteTasks - lastMonthIncompleteTasks,

        overdueTaskCount: thisMonthOverdueTasks,
        overdueTaskDifference: thisMonthOverdueTasks - lastMonthOverdueTasks,
      },
    });
  })

  .delete("/:workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    await connectToDatabase();

    const member = await getMember({
      workspaceId,
      userId: user.id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await WorkspaceModel.findByIdAndDelete(workspaceId);

    await MemberModel.deleteMany({ workspaceId });
    await ProjectModel.deleteMany({ workspaceId });
    await TaskModel.deleteMany({ workspaceId });

    return c.json({
      data: {
        $id: workspaceId,
      },
    });
  });

export default app;
