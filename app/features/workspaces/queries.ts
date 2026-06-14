import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { MemberModel, WorkspaceModel } from "@/lib/db/models";

export const getWorkspaces = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return { rows: [], total: 0 };
  }

  await connectToDatabase();

  const members = await MemberModel.find({
    userId: session.user.id,
  }).lean();

  if (members.length === 0) {
    return { rows: [], total: 0 };
  }

  const workspaceIds = members.map((member) => member.workspaceId);

  const workspaces = await WorkspaceModel.find({
    _id: { $in: workspaceIds },
  })
    .sort({ createdAt: -1 })
    .lean();

  return {
    rows: workspaces.map((workspace) => ({
      ...workspace,
      $id: workspace._id.toString(),
    })),
    total: workspaces.length,
  };
};
