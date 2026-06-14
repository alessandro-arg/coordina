import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { sessionMiddleware } from "@/lib/session-middleware";
import { connectToDatabase } from "@/lib/db/connect";
import { MemberModel, ProjectModel, TaskModel } from "@/lib/db/models";
import { getMember } from "../../members/utils";
import { createTaskSchema } from "../schemas";
import { TaskStatus } from "../types";

const serializeTask = (task: { _id: unknown; [key: string]: unknown }) => ({
  ...task,
  $id: String(task._id),
});

const serializeProject = (project: {
  _id: unknown;
  [key: string]: unknown;
}) => ({
  ...project,
  $id: String(project._id),
});

const serializeMember = (member: { _id: unknown; [key: string]: unknown }) => ({
  ...member,
  $id: String(member._id),
});

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.enum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const { workspaceId, projectId, status, search, assigneeId, dueDate } =
        c.req.valid("query");

      await connectToDatabase();

      const member = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const filter: Record<string, unknown> = {
        workspaceId,
      };

      if (projectId) filter.projectId = projectId;
      if (status) filter.status = status;
      if (assigneeId) filter.assigneeId = assigneeId;
      if (dueDate) filter.dueDate = new Date(dueDate);
      if (search) filter.name = { $regex: search, $options: "i" };

      const tasks = await TaskModel.find(filter).sort({ createdAt: -1 }).lean();

      const projectIds = [...new Set(tasks.map((task) => task.projectId))];
      const assigneeIds = [...new Set(tasks.map((task) => task.assigneeId))];

      const projects = await ProjectModel.find({
        _id: { $in: projectIds },
      }).lean();

      const members = await MemberModel.find({
        _id: { $in: assigneeIds },
      }).lean();

      const populatedTasks = tasks.map((task) => {
        const project = projects.find(
          (project) => String(project._id) === task.projectId,
        );

        const assignee = members.find(
          (member) => String(member._id) === task.assigneeId,
        );

        return serializeTask({
          ...task,
          project: project ? serializeProject(project) : undefined,
          assignee: assignee
            ? serializeMember({
                ...assignee,
                name: assignee.userId === user.id ? (user.name ?? "") : "",
                email: assignee.userId === user.id ? (user.email ?? "") : "",
              })
            : undefined,
        });
      });

      return c.json({
        data: {
          rows: populatedTasks,
          total: populatedTasks.length,
        },
      });
    },
  )

  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const user = c.get("user");
      const { name, status, workspaceId, projectId, dueDate, assigneeId } =
        c.req.valid("json");

      await connectToDatabase();

      const member = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const highestPositionTask = await TaskModel.findOne({
        workspaceId,
        status,
      })
        .sort({ position: -1 })
        .lean();

      const newPosition = highestPositionTask
        ? highestPositionTask.position + 1000
        : 1000;

      const task = await TaskModel.create({
        name,
        status,
        workspaceId,
        projectId,
        dueDate,
        assigneeId,
        position: newPosition,
        description: null,
      });

      return c.json({
        data: serializeTask(task.toObject()),
      });
    },
  )

  .get("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { taskId } = c.req.param();

    await connectToDatabase();

    const task = await TaskModel.findById(taskId).lean();

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    const currentMember = await getMember({
      workspaceId: task.workspaceId,
      userId: user.id,
    });

    if (!currentMember) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const project = await ProjectModel.findById(task.projectId).lean();
    const assignee = await MemberModel.findById(task.assigneeId).lean();

    return c.json({
      data: serializeTask({
        ...task,
        project: project ? serializeProject(project) : undefined,
        assignee: assignee
          ? serializeMember({
              ...assignee,
              name: assignee.userId === user.id ? (user.name ?? "") : "",
              email: assignee.userId === user.id ? (user.email ?? "") : "",
            })
          : undefined,
      }),
    });
  })

  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const user = c.get("user");
      const { taskId } = c.req.param();
      const { name, status, description, projectId, dueDate, assigneeId } =
        c.req.valid("json");

      await connectToDatabase();

      const existingTask = await TaskModel.findById(taskId).lean();

      if (!existingTask) {
        return c.json({ error: "Task not found" }, 404);
      }

      const member = await getMember({
        workspaceId: existingTask.workspaceId,
        userId: user.id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const task = await TaskModel.findByIdAndUpdate(
        taskId,
        {
          ...(name !== undefined && { name }),
          ...(status !== undefined && { status }),
          ...(projectId !== undefined && { projectId }),
          ...(assigneeId !== undefined && { assigneeId }),
          ...(dueDate !== undefined && { dueDate }),
          ...(description !== undefined && { description }),
        },
        { new: true },
      ).lean();

      return c.json({
        data: serializeTask(task!),
      });
    },
  )

  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { taskId } = c.req.param();

    await connectToDatabase();

    const task = await TaskModel.findById(taskId).lean();

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    const member = await getMember({
      workspaceId: task.workspaceId,
      userId: user.id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await TaskModel.findByIdAndDelete(taskId);

    return c.json({
      data: {
        $id: taskId,
      },
    });
  })

  .post(
    "/bulk-update",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.enum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          }),
        ),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const { tasks } = c.req.valid("json");

      await connectToDatabase();

      const taskIds = tasks.map((task) => task.$id);

      const tasksToUpdate = await TaskModel.find({
        _id: { $in: taskIds },
      }).lean();

      const workspaceIds = new Set(
        tasksToUpdate.map((task) => task.workspaceId),
      );

      if (workspaceIds.size !== 1) {
        return c.json(
          { error: "All tasks must belong to the same workspace" },
          400,
        );
      }

      const workspaceId = workspaceIds.values().next().value as string;

      const member = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const updatedTasks = await Promise.all(
        tasks.map((task) =>
          TaskModel.findByIdAndUpdate(
            task.$id,
            {
              status: task.status,
              position: task.position,
            },
            { new: true },
          ).lean(),
        ),
      );

      return c.json({
        data: updatedTasks.filter(Boolean).map((task) => serializeTask(task!)),
      });
    },
  );

export default app;
