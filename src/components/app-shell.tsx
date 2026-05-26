"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  Home,
  Lightbulb,
  Mail,
  Search,
  Settings,
  Target,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Research", href: "/research", icon: Search },
  { label: "Competitors", href: "/competitors", icon: BarChart3 },
  { label: "Pain Points", href: "/pain-points", icon: Lightbulb },
  { label: "ICP", href: "/icp", icon: Users },
  { label: "Strategy", href: "/strategy", icon: Target },
  { label: "Content", href: "/content", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

function titleFromPath(pathname: string) {
  const item = navItems.find((nav) => pathname === nav.href);
  return item?.label ?? "Workspace";
}

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen text-slate-950 dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 dark:shadow-black/20 lg:block">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/20">
            <Mail className="size-5" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">LaunchPilot AI</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI chief of staff for growth</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-slate-950 text-white shadow-lg shadow-blue-500/10 dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-sm font-semibold">Autonomous guidance on</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Fallback data stays labeled. Keys stay server-side.
          </p>
        </div>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                LaunchPilot AI / <span className="text-slate-800 dark:text-slate-200">{titleFromPath(pathname)}</span>
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Link
                href="/research"
                className="hidden rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] lg:inline-flex"
              >
                Analyze Startup Idea
              </Link>
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="space-y-6 px-4 py-6 sm:px-6 lg:px-8"
        >
          <section className="rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-xl shadow-slate-200/50 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-200">AI chief of staff for startup growth</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
          </section>
          {children}
        </motion.div>
      </section>
    </main>
  );
}
