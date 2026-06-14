import { MemberModel } from "@/lib/db/models";

interface GetMemberParams {
  userId: string;
  workspaceId: string;
}

export const getMember = async ({ workspaceId, userId }: GetMemberParams) => {
  return MemberModel.findOne({
    workspaceId,
    userId,
  }).lean();
};
