import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const workspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    inviteCode: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

workspaceSchema.index({ userId: 1, createdAt: -1 });

export type WorkspaceDocument = InferSchemaType<typeof workspaceSchema>;

export const WorkspaceModel =
  (mongoose.models.Workspace as Model<WorkspaceDocument>) ||
  mongoose.model("Workspace", workspaceSchema);
