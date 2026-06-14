import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const projectSchema = new Schema(
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
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.index({ workspaceId: 1, createdAt: -1 });

export type ProjectDocument = InferSchemaType<typeof projectSchema>;

export const ProjectModel =
  (mongoose.models.Project as Model<ProjectDocument>) ||
  mongoose.model("Project", projectSchema);
