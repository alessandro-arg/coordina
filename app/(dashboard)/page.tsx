import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getWorkspaces } from "../features/workspaces/queries";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.isDemo) {
    redirect("/workspaces/demo-workspace-1");
  }

  const workspaces = await getWorkspaces();

  if (workspaces.total === 0) {
    redirect("/workspaces/create");
  }

  redirect(`/workspaces/${workspaces.rows[0].$id}`);
}
