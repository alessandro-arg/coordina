import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "../features/auth/components/navbar";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface StandaloneLayoutProps {
  children: React.ReactNode;
}

const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 flex w-full bg-neutral-100 dark:bg-muted">
        {/* Desktop logo */}
        <div className="hidden h-20 w-[264px] shrink-0 items-center border-b border-r px-4 lg:flex">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Coordina"
              width={164}
              height={48}
              loading="eager"
              className="h-12 w-41 dark:hidden"
            />
            <Image
              src="/logo-dark.svg"
              alt="Coordina"
              width={164}
              height={48}
              loading="eager"
              className="hidden h-12 w-41 dark:block"
            />
          </Link>
        </div>

        {/* Shared dashboard navbar */}
        <div className="min-w-0 flex-1">
          <Navbar showCreateButtons={false} showWorkspaceNavigation={false} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        {children}
      </div>
    </div>
  );
};

export default StandaloneLayout;
