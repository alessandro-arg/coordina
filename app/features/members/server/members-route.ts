import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { sessionMiddleware } from "@/lib/session-middleware";
import { connectToDatabase } from "@/lib/db/connect";
import { MemberModel, MemberRole } from "@/lib/db/models";
import { getMember } from "../utils";

const serializeMember = (member: {
  _id: unknown;
  userId: string;
  workspaceId: string;
  role: string;
  name?: string;
  email?: string;
}) => ({
  ...member,
  $id: String(member._id),
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

      const currentMember = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (!currentMember) {
        return c.json(
          { error: "You are not a member of this workspace." },
          403,
        );
      }

      const members = await MemberModel.find({ workspaceId }).lean();

      const populatedMembers = members.map((member) =>
        serializeMember({
          _id: member._id,
          userId: member.userId,
          workspaceId: member.workspaceId,
          role: member.role,
          name: member.userId === user.id ? (user.name ?? "") : "",
          email: member.userId === user.id ? (user.email ?? "") : "",
        }),
      );

      return c.json({
        data: {
          rows: populatedMembers,
          total: populatedMembers.length,
        },
      });
    },
  )

  .delete("/:memberId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { memberId } = c.req.param();

    await connectToDatabase();

    const memberToDelete = await MemberModel.findById(memberId).lean();

    if (!memberToDelete) {
      return c.json({ error: "Member not found" }, 404);
    }

    const allMembersInWorkspace = await MemberModel.find({
      workspaceId: memberToDelete.workspaceId,
    }).lean();

    const currentMember = await getMember({
      workspaceId: memberToDelete.workspaceId,
      userId: user.id,
    });

    if (!currentMember) {
      return c.json({ error: "You are not a member of this workspace." }, 403);
    }

    if (
      String(currentMember._id) !== String(memberToDelete._id) &&
      currentMember.role !== MemberRole.ADMIN
    ) {
      return c.json(
        { error: "You don't have permission to remove this member." },
        403,
      );
    }

    if (allMembersInWorkspace.length === 1) {
      return c.json(
        { error: "You cannot remove the last member of the workspace." },
        400,
      );
    }

    await MemberModel.findByIdAndDelete(memberId);

    return c.json({ data: { $id: memberId } });
  })

  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.enum(MemberRole) })),
    async (c) => {
      const user = c.get("user");
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");

      await connectToDatabase();

      const memberToUpdate = await MemberModel.findById(memberId).lean();

      if (!memberToUpdate) {
        return c.json({ error: "Member not found" }, 404);
      }

      const allMembersInWorkspace = await MemberModel.find({
        workspaceId: memberToUpdate.workspaceId,
      }).lean();

      const currentMember = await getMember({
        workspaceId: memberToUpdate.workspaceId,
        userId: user.id,
      });

      if (!currentMember) {
        return c.json(
          { error: "You are not a member of this workspace." },
          403,
        );
      }

      if (currentMember.role !== MemberRole.ADMIN) {
        return c.json(
          { error: "You don't have permission to update this member." },
          403,
        );
      }

      if (allMembersInWorkspace.length === 1 && role !== MemberRole.ADMIN) {
        return c.json({ error: "You cannot downgrade the last admin" }, 400);
      }

      await MemberModel.findByIdAndUpdate(memberId, { role });

      return c.json({ data: { $id: memberId } });
    },
  );

export default app;
