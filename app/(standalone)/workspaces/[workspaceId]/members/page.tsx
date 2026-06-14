import { auth } from "@/auth";
import MemberList from "@/app/features/members/components/members-list";
import { redirect } from "next/navigation";

const WorkspaceIdMembersPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="w-full lg:max-w-xl">
      <MemberList />
    </div>
  );
};

export default WorkspaceIdMembersPage;
