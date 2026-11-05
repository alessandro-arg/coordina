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

  const {
    data: initialValues,
    isFetching,
    isFetchedAfterMount,
    isError,
  } = useGetWorkspaceInfo({
    workspaceId,
    inviteCode,
  });

  const hasFreshResult = isFetchedAfterMount && !isFetching;

  useEffect(() => {
    if (hasFreshResult && !isError && initialValues?.isMember) {
      router.replace(`/workspaces/${initialValues.$id}`);
    }
  }, [
    hasFreshResult,
    isError,
    initialValues?.isMember,
    initialValues?.$id,
    router,
  ]);

  if (!hasFreshResult) {
    return <PageLoader />;
  }

  if (isError || !initialValues) {
    return <PageError message="Workspace info not found" />;
  }

  if (initialValues.isMember) {
    return <PageLoader />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm initialValues={initialValues} />
    </div>
  );
};
