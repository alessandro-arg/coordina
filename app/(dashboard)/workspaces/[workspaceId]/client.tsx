"use client";

import { formatDistanceToNow } from "date-fns";
import { useGetMembers } from "@/app/features/members/api/use-get-members";
import { useGetProjects } from "@/app/features/projects/api/use-get-projects";
import { useCreateProjectModal } from "@/app/features/projects/hooks/use-create-project-modal";
import { useGetTasks } from "@/app/features/tasks/api/use-get-tasks";
import { useCreateTaskModal } from "@/app/features/tasks/hooks/use-create-task-modal";
import { useGetWorkspaceAnalytics } from "@/app/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/app/features/workspaces/hooks/use-workspace-id";
import { Analytics } from "@/components/analytics";
import DottedSeparator from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectAvatar } from "@/app/features/projects/components/project-avatar";
import { MemberAvatar } from "@/app/features/members/components/members-avatar";
import { Task } from "@/app/features/tasks/types";
import { Project } from "@/app/features/projects/types";
import { Member } from "@/app/features/members/types";
import { useCurrent } from "@/app/features/auth/api/use-current";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useCurrent();
  const isDemo = currentUser?.isDemo;
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      toast.info(
        "Demo mode enabled. All changes are stored locally and won't affect other users.",
      );

      router.replace(`/workspaces/${workspaceId}`);
    }
  }, [searchParams, router, workspaceId]);

  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isFetching: isFetchingAnalytics,
  } = useGetWorkspaceAnalytics({ workspaceId });

  const {
    data: tasks,
    isLoading: isLoadingTasks,
    isFetching: isFetchingTasks,
  } = useGetTasks({ workspaceId });

  const {
    data: projects,
    isLoading: isLoadingProjects,
    isFetching: isFetchingProjects,
  } = useGetProjects({ workspaceId });

  const {
    data: members,
    isLoading: isLoadingMembers,
    isFetching: isFetchingMembers,
  } = useGetMembers({ workspaceId });

  const isLoading =
    isLoadingCurrentUser ||
    isLoadingAnalytics ||
    isLoadingTasks ||
    isLoadingProjects ||
    isLoadingMembers ||
    isFetchingAnalytics ||
    isFetchingTasks ||
    isFetchingProjects ||
    isFetchingMembers;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isLoading && (!analytics || !tasks || !projects || !members)) {
    return <PageError message="Failed to load workspace data" />;
  }

  if (!analytics || !tasks || !projects || !members) {
    return <PageLoader />;
  }

  const taskRows = tasks.rows as unknown as Task[];
  const projectRows = projects.rows as unknown as Project[];
  const memberRows = members.rows as unknown as Member[];

  return (
    <div className="h-full flex flex-col space-y-4">
      {isDemo && (
        <div className="rounded-lg border bg-muted p-4">
          <p className="font-medium">Demo Mode</p>
          <p className="text-sm text-muted-foreground">
            Changes are stored locally and won't affect other users.
          </p>
        </div>
      )}
      <Analytics data={analytics} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TaskList data={taskRows} total={tasks.total} />
        <ProjectList data={projectRows} total={projects.total} />
        <MembersList data={memberRows} total={members.total} />
      </div>
    </div>
  );
};

interface TaskListProps {
  data: Task[];
  total: number;
}

export const TaskList = ({ data, total }: TaskListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createTask } = useCreateTaskModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted dark:bg-neutral-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Tasks ({total})</p>
          <Button variant="muted" size="icon" onClick={createTask}>
            <PlusIcon className="size-5 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="flex flex-col gap-y-4">
          {data.map((task) => (
            <li key={task.$id}>
              <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition py-0">
                  <CardContent className="p-4">
                    <p className="text-lg font-medium truncate">{task.name}</p>
                    <div className="flex items-center gap-x-2">
                      <p>{task.project?.name}</p>
                      <div className="size-1 rounded-full bg-neutral-300" />
                      <div className="text-sm text-muted-foreground flex items-center">
                        <CalendarIcon className="size-3 mr-1" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(task.dueDate))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No tasks found
          </li>
        </ul>
        <Button variant="muted" className="mt-4 w-full" asChild>
          <Link href={`/workspaces/${workspaceId}/tasks`}>Show all</Link>
        </Button>
      </div>
    </div>
  );
};

interface ProjectListProps {
  data: Project[];
  total: number;
}

export const ProjectList = ({ data, total }: ProjectListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Projects ({total})</p>
          <Button variant="secondary" size="icon" onClick={createProject}>
            <PlusIcon className="size-5 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map((project) => (
            <li key={project.$id}>
              <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                <Card className="dark:bg-card dark:border-border shadow-none rounded-lg hover:opacity-75 transition py-0">
                  <CardContent className="p-4 flex items-center gap-x-2.5">
                    <ProjectAvatar
                      name={project.name}
                      image={project.imageUrl ?? undefined}
                      className="size-12"
                      fallbackClassName="text-lg"
                    />
                    <p className="text-lg font-medium truncate">
                      {project.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No projects found
          </li>
        </ul>
      </div>
    </div>
  );
};

interface MembersListProps {
  data: Member[];
  total: number;
}

export const MembersList = ({ data, total }: MembersListProps) => {
  const workspaceId = useWorkspaceId();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Members ({total})</p>
          <Button variant="secondary" size="icon" asChild>
            <Link href={`/workspaces/${workspaceId}/members`}>
              <SettingsIcon className="size-5 text-neutral-400" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((member) => (
            <li key={member.$id}>
              <Card className="dark:bg-card dark:border-border shadow-none rounded-lg overflow-hidden py-0">
                <CardContent className="p-3 flex flex-col items-center gap-x-2">
                  <MemberAvatar
                    name={member.name ?? "User"}
                    className="size-12"
                  />
                  <div className="flex flex-col items-center overflow-hidden">
                    <p className="text-lg font-medium line-clamp-1">
                      {member.name}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {member.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No members found
          </li>
        </ul>
      </div>
    </div>
  );
};
