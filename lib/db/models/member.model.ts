import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export enum MemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

const memberSchema = new Schema(
  {
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(MemberRole),
      required: true,
      default: MemberRole.MEMBER,
    },
  },
  {
    timestamps: true,
  },
);

memberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export type MemberDocument = InferSchemaType<typeof memberSchema>;

export const MemberModel =
  (mongoose.models.Member as Model<MemberDocument>) ||
  mongoose.model("Member", memberSchema);
