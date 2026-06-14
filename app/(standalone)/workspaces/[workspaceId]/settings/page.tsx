import { redirect } from "next/navigation";
import { WorkspaceIdSettingsClient } from "./client";
import { auth } from "@/auth";

const WorkspaceIdSettingsPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return <WorkspaceIdSettingsClient />;
};

export default WorkspaceIdSettingsPage;
