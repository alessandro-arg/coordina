"use client";

import { useGetWorkspace } from "@/app/features/workspaces/api/use-get-workspace";
import { EditWorkspaceForm } from "@/app/features/workspaces/components/edit-workspace-form";
import { useWorkspaceId } from "@/app/features/workspaces/hooks/use-workspace-id";
import { Workspace } from "@/app/features/workspaces/types";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const WorkspaceIdSettingsClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: initialValues, isPending } = useGetWorkspace({ workspaceId });

  if (isPending) {
    return <PageLoader className="h-auto min-h-[50vh] w-full" />;
  }

  if (!initialValues) {
    return <PageError message="Workspace not found" />;
  }

  const workspace = initialValues as unknown as Workspace;

  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={workspace} />
    </div>
  );
};
