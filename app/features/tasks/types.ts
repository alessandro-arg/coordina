import { Member } from "../members/types";
import { Project } from "../projects/types";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

export type Task = {
  $id: string;
  name: string;
  status: TaskStatus;
  workspaceId: string;
  assigneeId: string;
  projectId: string;
  position: number;
  dueDate: string | Date;
  description: string | null;
  assignee?: Partial<Member>;
  project?: Partial<Project>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
