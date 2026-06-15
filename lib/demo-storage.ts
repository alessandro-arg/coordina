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
      imageUrl: null,
      inviteCode: "DEMO2026",
      userId: "demo-user",
    },
  ],
  members: [
    {
      $id: "demo-member-1",
      workspaceId: "demo-workspace-1",
      userId: "demo-user",
      name: "Demo User",
      email: "demo@coordina.app",
      role: "ADMIN",
    },
  ],
  projects: [
    {
      $id: "demo-project-1",
      name: "Website Relaunch",
      imageUrl: null,
      workspaceId: "demo-workspace-1",
    },
    {
      $id: "demo-project-2",
      name: "Mobile App",
      imageUrl: null,
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
