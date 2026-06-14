export type Workspace = {
  $id: string;
  name: string;
  imageUrl?: string | null;
  inviteCode: string;
  userId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
