import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TaskIdClient } from "./client";

const TaskIdPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return <TaskIdClient />;
};

export default TaskIdPage;
