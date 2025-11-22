"use client";
import { Centroid } from "@/app/home/components/Icons";
import { Braces, CreditCard, List } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const NavInteractive = () => {
  return (
    <div
      className={`flex flex-col items-center z-20 w-16 h-screen bg-transparent fixed left-0 top-0 transition duration-300 ease-in-out print:hidden`}
    >
      <nav
        className="flex flex-col items-center space-between min-h-screen py-8"
        aria-label="Primary"
      >
        <div className="flex flex-col items-center gap-y-6 text-black dark:text-white">
          <Link
            href="/"
            title="plan your budget"
            className="w-12 h-12 min-w-12 min-h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[oklch(27.4%_.006_286.033)] rounded-sm cursor-pointer"
          >
            <Centroid />
          </Link>
          <Link
            href="/bills"
            title="plan your budget"
            className="w-12 h-12 min-w-12 min-h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[oklch(27.4%_.006_286.033)] rounded-sm cursor-pointer"
          >
            <List />
          </Link>

          <Link
            href="/paymentSources"
            title="plan your budget"
            className="w-12 h-12 min-w-12 min-h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[oklch(27.4%_.006_286.033)] rounded-sm cursor-pointer"
          >
            <CreditCard />
          </Link>
          <Link
            href="/swagger"
            title="Developer API Docs"
            className="w-12 h-12 min-w-12 min-h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[oklch(27.4%_.006_286.033)] rounded-sm cursor-pointer"
          >
            <Braces />
          </Link>
          <ThemeToggle />
        </div>
        <div className="w-12 h-12 min-w-12 min-h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[oklch(27.4%_.006_286.033)] rounded-sm cursor-pointer"></div>
      </nav>
    </div>
  );
};

export default NavInteractive;
