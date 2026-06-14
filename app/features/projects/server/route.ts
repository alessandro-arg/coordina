import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { sessionMiddleware } from "@/lib/session-middleware";
import { connectToDatabase } from "@/lib/db/connect";
import { ProjectModel, TaskModel } from "@/lib/db/models";
import { getMember } from "../../members/utils";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { TaskStatus } from "../../tasks/types";

const serializeProject = (project: {
  _id: unknown;
  name?: string;
  imageUrl?: string | null;
  workspaceId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) => ({
  ...project,
  $id: String(project._id),
});

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get("user");
      const { workspaceId } = c.req.valid("query");

      await connectToDatabase();

      const member = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const projects = await ProjectModel.find({ workspaceId })
        .sort({ createdAt: -1 })
        .lean();

      return c.json({
        data: {
          rows: projects.map(serializeProject),
          total: projects.length,
        },
      });
    },
  )

  .get("/:projectId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { projectId } = c.req.param();

    await connectToDatabase();

    const project = await ProjectModel.findById(projectId).lean();

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    const member = await getMember({
      workspaceId: project.workspaceId,
      userId: user.id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    return c.json({
      data: serializeProject(project),
    });
  })

  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const user = c.get("user");
      const { name, workspaceId } = c.req.valid("form");

      await connectToDatabase();

      const member = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const project = await ProjectModel.create({
        name,
        workspaceId,
        imageUrl: null,
      });

      return c.json({
        data: serializeProject(project.toObject()),
      });
    },
  )

  .patch(
    "/:projectId",
    sessionMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => {
      const user = c.get("user");
      const { projectId } = c.req.param();
      const { name } = c.req.valid("form");

      await connectToDatabase();

      const existingProject = await ProjectModel.findById(projectId).lean();

      if (!existingProject) {
        return c.json({ error: "Project not found" }, 404);
      }

      const member = await getMember({
        workspaceId: existingProject.workspaceId,
        userId: user.id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const project = await ProjectModel.findByIdAndUpdate(
        projectId,
        {
          name,
        },
        { new: true },
      ).lean();

      return c.json({
        data: serializeProject(project!),
      });
    },
  )

  .delete("/:projectId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { projectId } = c.req.param();

    await connectToDatabase();

    const existingProject = await ProjectModel.findById(projectId).lean();

    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }

    const member = await getMember({
      workspaceId: existingProject.workspaceId,
      userId: user.id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await ProjectModel.findByIdAndDelete(projectId);

    return c.json({
      data: {
        $id: projectId,
      },
    });
  })

  .get("/:projectId/analytics", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { projectId } = c.req.param();

    await connectToDatabase();

    const project = await ProjectModel.findById(projectId).lean();

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    const member = await getMember({
      workspaceId: project.workspaceId,
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
        projectId,
        createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }),
      TaskModel.countDocuments({
        projectId,
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),
      TaskModel.countDocuments({
        projectId,
        assigneeId: String(member._id),
        createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }),
      TaskModel.countDocuments({
        projectId,
        assigneeId: String(member._id),
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),
      TaskModel.countDocuments({
        projectId,
        status: { $ne: TaskStatus.DONE },
        createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }),
      TaskModel.countDocuments({
        projectId,
        status: { $ne: TaskStatus.DONE },
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),
      TaskModel.countDocuments({
        projectId,
        status: TaskStatus.DONE,
        createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }),
      TaskModel.countDocuments({
        projectId,
        status: TaskStatus.DONE,
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),
      TaskModel.countDocuments({
        projectId,
        status: { $ne: TaskStatus.DONE },
        dueDate: { $lt: now },
        createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }),
      TaskModel.countDocuments({
        projectId,
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
  });

export default app;
