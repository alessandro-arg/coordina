import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      required: true,
      default: TaskStatus.TODO,
      index: true,
    },
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    assigneeId: {
      type: String,
      required: true,
      index: true,
    },
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    position: {
      type: Number,
      required: true,
      default: 1000,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ workspaceId: 1, createdAt: -1 });
taskSchema.index({ workspaceId: 1, status: 1, position: 1 });
taskSchema.index({ workspaceId: 1, projectId: 1 });
taskSchema.index({ workspaceId: 1, assigneeId: 1 });
taskSchema.index({ name: "text" });

export type TaskDocument = InferSchemaType<typeof taskSchema>;

export const TaskModel =
  (mongoose.models.Task as Model<TaskDocument>) ||
  mongoose.model("Task", taskSchema);
