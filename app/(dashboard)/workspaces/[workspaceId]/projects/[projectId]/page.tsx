import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProjectIdClient } from "./client";

const ProjectIdPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return <ProjectIdClient />;
};

export default ProjectIdPage;
