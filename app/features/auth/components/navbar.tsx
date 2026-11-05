"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar } from "./mobile-sidebar";
import { UserButton } from "./user-button";
import { ThemeToggle } from "@/components/theme-toggle";

const pathnameMap = {
  tasks: {
    title: "My tasks",
    description: "View all of your tasks here",
  },
  projects: {
    title: "My project",
    description: "View the tasks of your project here",
  },
  settings: {
    title: "Settings",
    description: "Manage your workspace settings",
  },
  members: {
    title: "Members",
    description: "Manage your workspace members",
  },
  join: {
    title: "Join workspace",
    description: "Accept a workspace invitation",
  },
};

const defaultMap = {
  title: "Home",
  description: "Monitor all of your projects and tasks",
};

interface NavbarProps {
  showCreateButtons?: boolean;
  showWorkspaceNavigation?: boolean;
}

export const Navbar = ({
  showCreateButtons = true,
  showWorkspaceNavigation = true,
}: NavbarProps) => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b bg-neutral-100 px-6 dark:bg-muted">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MobileSidebar
        showCreateButtons={showCreateButtons}
        showWorkspaceNavigation={showWorkspaceNavigation}
      />
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserButton />
      </div>
    </nav>
  );
};
