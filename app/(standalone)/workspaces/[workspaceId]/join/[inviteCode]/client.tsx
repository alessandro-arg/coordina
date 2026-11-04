"use client";
import { useGetWorkspaceInfo } from "@/app/features/workspaces/api/use-get-workspace-info";
import { useInviteCode } from "@/app/features/workspaces/hooks/use-invite-code";
import { JoinWorkspaceForm } from "@/app/features/workspaces/components/join-workspace-form";
import { useWorkspaceId } from "@/app/features/workspaces/hooks/use-workspace-id";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const WorkspaceIdJoinClient = () => {
  const workspaceId = useWorkspaceId();
  const inviteCode = useInviteCode();
  const router = useRouter();

  const { data: initialValues, isLoading } = useGetWorkspaceInfo({
    workspaceId,
    inviteCode,
  });

  useEffect(() => {
    if (initialValues?.isMember) {
      router.replace(`/workspaces/${initialValues.$id}`);
    }
  }, [initialValues?.isMember, initialValues?.$id, router]);

  if (isLoading || initialValues?.isMember) {
    return <PageLoader />;
  }

  if (!initialValues) {
    return <PageError message="Workspace info not found" />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm initialValues={initialValues} />
    </div>
  );
};
