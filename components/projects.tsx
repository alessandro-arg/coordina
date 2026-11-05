"use client";

import { useGetProjects } from "@/app/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/app/features/projects/components/project-avatar";
import { useCreateProjectModal } from "@/app/features/projects/hooks/use-create-project-modal";
import { useWorkspaceId } from "@/app/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";
import { NavigationPendingIndicator } from "./navigation-pending-indicator";

interface ProjectsProps {
  showCreateButtons?: boolean;
}

export const Projects = ({ showCreateButtons = true }: ProjectsProps) => {
  const pathname = usePathname();
  const { open } = useCreateProjectModal();
  const workspaceId = useWorkspaceId();
  const { data } = useGetProjects({
    workspaceId,
  });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium uppercase text-muted-foreground">
          Projects
        </p>
        {showCreateButtons && (
          <button
            type="button"
            onClick={open}
            aria-label="Create project"
            className="cursor-pointer rounded-sm p-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RiAddCircleFill aria-hidden="true" className="size-5" />
          </button>
        )}
      </div>
      {data?.rows.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
        const isActive = pathname === href;

        return (
          <Link href={href} key={project.$id}>
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-md border border-transparent p-2.5 transition-colors hover:text-primary",
                isActive && "border-border bg-background text-primary",
              )}
            >
              <ProjectAvatar
                image={project.imageUrl ?? undefined}
                name={project.name ?? "Project"}
              />
              <span className="min-w-0 flex-1 truncate">{project.name}</span>
              <NavigationPendingIndicator />
            </div>
          </Link>
        );
      })}
    </div>
  );
};
