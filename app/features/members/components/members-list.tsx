"use client";

import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftCircleIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import DottedSeparator from "@/components/dotted-separator";
import { useGetMembers } from "../../members/api/use-get-members";
import { Fragment } from "react/jsx-runtime";
import { MemberAvatar } from "../../members/components/members-avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteMember } from "../../members/api/use-delete-member";
import { useUpdateMember } from "../../members/api/use-update-member";
import { MemberRole } from "../../members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { useCurrent } from "../../auth/api/use-current";

export const MemberList = () => {
  const workspaceId = useWorkspaceId();
  const { data: currentUser } = useCurrent();

  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "This member will be removed from the workspace",
    "destructive",
  );

  const { data } = useGetMembers({ workspaceId });
  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const currentMember = data?.rows.find(
    (member) => member.userId === currentUser?.id,
  );

  const isCurrentUserAdmin = currentMember?.role === MemberRole.ADMIN;

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      json: { role },
      param: { memberId },
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteMember({ param: { memberId } });
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Link href={`/workspaces/${workspaceId}`}>
          <Button size="sm" variant="secondary">
            <ArrowLeftCircleIcon className="size-4 mr-1" />
            Back
          </Button>
        </Link>
        <CardTitle className="text-xl font-bold">Members list</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        {data?.rows.map((member, index) => {
          const isSelf = member.userId === currentUser?.id;
          const canManageMember = isCurrentUserAdmin && !isSelf;

          return (
            <Fragment key={member.$id}>
              <div className="flex items-center gap-2">
                <MemberAvatar
                  className="size-10"
                  fallbackClassName="text-lg"
                  name={member.name ?? "User"}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium">
                    {member.name ?? "User"}
                    {member.role === MemberRole.ADMIN && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-muted text-blue-700 dark:text-blue-500 font-semibold ml-2">
                        ADMIN
                      </span>
                    )}

                    {isSelf && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-muted text-neutral-600 dark:text-neutral-300 font-semibold ml-2">
                        YOU
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.email ?? "No email"}
                  </p>
                </div>

                {canManageMember && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="ml-auto"
                        variant="secondary"
                        size="icon"
                      >
                        <MoreVerticalIcon className="size-4 text-muted-foreground dark:text-primary" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end">
                      <DropdownMenuItem
                        className="font-medium"
                        onClick={() =>
                          handleUpdateMember(member.$id, MemberRole.ADMIN)
                        }
                        disabled={
                          isUpdatingMember || member.role === MemberRole.ADMIN
                        }
                      >
                        Set as Administrator
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="font-medium"
                        onClick={() =>
                          handleUpdateMember(member.$id, MemberRole.MEMBER)
                        }
                        disabled={
                          isUpdatingMember || member.role === MemberRole.MEMBER
                        }
                      >
                        Set as Member
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="font-medium text-amber-700 dark:text-red-400"
                        onClick={() => handleDeleteMember(member.$id)}
                        disabled={isDeletingMember}
                      >
                        Remove {member.name ?? "User"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {index < data.rows.length - 1 && <Separator className="my-2.5" />}
            </Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default MemberList;
