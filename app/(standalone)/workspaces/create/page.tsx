import { auth } from "@/auth";
import { CreateWorkspaceForm } from "@/app/features/workspaces/components/create-workspace-form";
import { redirect } from "next/navigation";

const WorkspacesCreatePage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="w-full lg:max-w-xl">
      <CreateWorkspaceForm />
    </div>
  );
};

export default WorkspacesCreatePage;
