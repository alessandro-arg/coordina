import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "./navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Projects } from "./projects";

export const Sidebar = () => {
  return (
    <aside className="h-full w-full lg:border-r bg-neutral-100 p-4 dark:bg-muted">
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
      <div className="my-[15px] h-px bg-border -mx-4 hidden lg:block" />
      <Separator className="my-4 lg:hidden" />
      <WorkspaceSwitcher />
      <Separator className="my-4" />
      <Navigation />
      <Separator className="my-4" />
      <Projects />
    </aside>
  );
};
