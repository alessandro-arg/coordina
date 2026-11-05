import { TaskStatus } from "@/app/features/tasks/types";

const DEMO_STORAGE_KEY = "coordina-demo-data";

export type DemoProject = {
  $id: string;
  name: string;
  imageUrl?: string | null;
  workspaceId: string;
};

export type DemoMember = {
  $id: string;
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
};

export type DemoTask = {
  $id: string;
  name: string;
  status: TaskStatus;
  workspaceId: string;
  assigneeId: string;
  projectId: string;
  position: number;
  dueDate: string;
  description: string | null;
};

export type DemoWorkspace = {
  $id: string;
  name: string;
  imageUrl?: string | null;
  inviteCode: string;
  userId: string;
};

export type DemoData = {
  workspaces: DemoWorkspace[];
  members: DemoMember[];
  projects: DemoProject[];
  tasks: DemoTask[];
};

export const defaultDemoData: DemoData = {
  workspaces: [
    {
      $id: "demo-workspace-1",
      name: "Demo Workspace",
      imageUrl: "/demo/workspace.png",
      inviteCode: "DEMO2026",
      userId: "6a3058e1c43b19767960b825",
    },
  ],
  members: [
    {
      $id: "demo-member-1",
      workspaceId: "demo-workspace-1",
      userId: "6a3058e1c43b19767960b825",
      name: "Demo User",
      email: "demo@coordina.app",
      role: "ADMIN",
    },
    {
      $id: "demo-member-2",
      workspaceId: "demo-workspace-1",
      userId: "demo-user-2",
      name: "Mia Schneider",
      email: "mia.demo@coordina.app",
      role: "MEMBER",
    },
    {
      $id: "demo-member-3",
      workspaceId: "demo-workspace-1",
      userId: "demo-user-3",
      name: "Jonas Weber",
      email: "jonas.demo@coordina.app",
      role: "ADMIN",
    },
  ],
  projects: [
    {
      $id: "demo-project-1",
      name: "Website Relaunch",
      imageUrl: "/demo/website.png",
      workspaceId: "demo-workspace-1",
    },
    {
      $id: "demo-project-2",
      name: "Mobile App",
      imageUrl: "/demo/mobile.png",
      workspaceId: "demo-workspace-1",
    },
  ],
  tasks: [
    {
      $id: "demo-task-1",
      name: "Landing page layout vorbereiten",
      status: TaskStatus.TODO,
      workspaceId: "demo-workspace-1",
      assigneeId: "demo-member-1",
      projectId: "demo-project-1",
      position: 1000,
      dueDate: new Date().toISOString(),
      description: "Erste Demo Task.",
    },
    {
      $id: "demo-task-2",
      name: "Kanban Board testen",
      status: TaskStatus.IN_PROGRESS,
      workspaceId: "demo-workspace-1",
      assigneeId: "demo-member-1",
      projectId: "demo-project-1",
      position: 1000,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      description: "Diese Task kann lokal verschoben werden.",
    },
    {
      $id: "demo-task-3",
      name: "Dashboard prüfen",
      status: TaskStatus.DONE,
      workspaceId: "demo-workspace-1",
      assigneeId: "demo-member-1",
      projectId: "demo-project-2",
      position: 1000,
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      description: "Fertige Demo Task.",
    },
  ],
};

export function getDemoData(): DemoData {
  if (typeof window === "undefined") {
    return defaultDemoData;
  }

  const stored = window.localStorage.getItem(DEMO_STORAGE_KEY);

  if (!stored) {
    window.localStorage.setItem(
      DEMO_STORAGE_KEY,
      JSON.stringify(defaultDemoData),
    );
    return defaultDemoData;
  }

  try {
    return JSON.parse(stored) as DemoData;
  } catch {
    window.localStorage.setItem(
      DEMO_STORAGE_KEY,
      JSON.stringify(defaultDemoData),
    );
    return defaultDemoData;
  }
}

export function setDemoData(data: DemoData) {
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
}

export function resetDemoData() {
  setDemoData(defaultDemoData);
  return defaultDemoData;
}

export function createDemoId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function generateDemoTasks(workspaceId: string): number {
  const demoData = getDemoData();

  const projects = demoData.projects.filter(
    (project) => project.workspaceId === workspaceId,
  );

  const members = demoData.members.filter(
    (member) => member.workspaceId === workspaceId,
  );

  if (!projects.length || !members.length) {
    return 0;
  }

  const titles = [
    "Design landing page",
    "Fix mobile navigation",
    "Review pull requests",
    "Implement search filters",
    "Update project documentation",
    "Optimize dashboard performance",
    "Test authentication flow",
    "Create onboarding screens",
    "Improve form validation",
    "Fix responsive layout",
    "Add notification preferences",
    "Review accessibility issues",
    "Prepare release notes",
    "Refactor API handlers",
    "Test Kanban drag and drop",
    "Update user settings",
    "Investigate loading states",
    "Improve error handling",
    "Design project overview",
    "Run regression tests",
  ];

  const statuses = Object.values(TaskStatus);
  const tasks = [...demoData.tasks];

  for (const [index, name] of titles.entries()) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const dueDate = new Date();
    const daysOffset = index < 6 ? 0 : Math.floor(Math.random() * 45) - 10;

    dueDate.setDate(dueDate.getDate() + daysOffset);

    const highestPosition = tasks.reduce(
      (max, task) =>
        task.workspaceId === workspaceId && task.status === status
          ? Math.max(max, task.position)
          : max,
      0,
    );

    tasks.push({
      $id: createDemoId("demo-task"),
      name,
      status,
      workspaceId,
      projectId: projects[Math.floor(Math.random() * projects.length)].$id,
      assigneeId: members[Math.floor(Math.random() * members.length)].$id,
      position: highestPosition + 1000,
      dueDate: dueDate.toISOString(),
      description: "Generated sample task for demo testing.",
    });
  }

  setDemoData({ ...demoData, tasks });

  return titles.length;
}
