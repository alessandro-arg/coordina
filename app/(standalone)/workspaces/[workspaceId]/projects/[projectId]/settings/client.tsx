"use client";

import { useGetProject } from "@/app/features/projects/api/use-get-project";
import { EditProjectForm } from "@/app/features/projects/components/edit-project-form";
import { useProjectId } from "@/app/features/projects/hooks/use-project-id";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Project } from "@/app/features/projects/types";

export const ProjectIdSettingsClient = () => {
  const projectId = useProjectId();
  const { data: initialValues, isLoading } = useGetProject({ projectId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!initialValues) {
    return <PageError message="Project not found" />;
  }

  const project = initialValues as unknown as Project;

  return (
    <div className="w-full lg:max-w-xl">
      <EditProjectForm initialValues={project} />
    </div>
  );
};
