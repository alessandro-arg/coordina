import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "./navigation";
import { WorkspaceSwithcer } from "./workspace-switcher";
import { Projects } from "./projects";

export const Sidebar = () => {
  return (
    <aside className="h-full w-full p-4 bg-background lg:bg-muted dark:lg:bg-card">
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="logo"
          width={164}
          height={48}
          loading="eager"
          className="w-41 h-12 dark:hidden"
        />
        <Image
          src="/logo-dark.svg"
          alt="logo"
          width={164}
          height={48}
          loading="eager"
          className="w-41 h-12 hidden dark:block"
        />
      </Link>
      <Separator className="my-4" />
      <WorkspaceSwithcer />
      <Separator className="my-4" />
      <Navigation />
      <Separator className="my-4" />
      <Projects />
    </aside>
  );
};
