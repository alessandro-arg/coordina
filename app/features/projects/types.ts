export type Project = {
  $id: string;
  name: string;
  imageUrl?: string | null;
  workspaceId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
