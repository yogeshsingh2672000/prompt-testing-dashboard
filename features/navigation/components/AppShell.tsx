"use client";

import { BarChart3, CalendarClock, FileSpreadsheet, FlaskConical, FolderKanban, GitCompareArrows, History, LayoutDashboard, LineChart, Settings, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/shared/lib/utils";
import { SurfaceCard } from "@/shared/ui/SurfaceCard";
import { LanguageToggle } from "@/shared/ui/LanguageToggle";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { ToastViewport } from "@/shared/ui/ToastViewport";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";

const navItems = [
    { href: "/workspace", label: "Workspace", icon: LayoutDashboard, accent: "teal" },
    { href: "/results", label: "Results", icon: BarChart3, accent: "blue" },
    { href: "/analytics", label: "Analytics", icon: LineChart, accent: "indigo" },
    { href: "/history", label: "History", icon: History, accent: "amber" },
    { href: "/compare", label: "Compare", icon: GitCompareArrows, accent: "emerald" },
    { href: "/datasets", label: "Datasets", icon: FolderKanban, accent: "orange" },
    { href: "/schedules", label: "Schedules", icon: CalendarClock, accent: "cyan" },
    { href: "/reviews", label: "Reviews", icon: FileSpreadsheet, accent: "rose" },
    { href: "/settings", label: "Settings", icon: Settings, accent: "zinc" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
    const t = useTranslations("common");
    const pathname = usePathname();
    const router = useRouter();
    const { toasts, dismissToast, loading, runEvaluation, results } = useDashboardWorkspace();

    const handleRun = async () => {
        await runEvaluation();
        router.push("/results");
    };

    return (
        <div className="min-h-screen bg-transparent">
            <ToastViewport toasts={toasts} onDismiss={dismissToast} />
            <div className="mx-auto flex min-h-screen w-full max-w-[1700px] gap-6 px-4 py-4 md:px-6 lg:px-8">
                <aside className="hidden w-[280px] shrink-0 xl:flex">
                    <SurfaceCard className="shell-panel sticky top-4 flex h-[calc(100vh-2rem)] w-full flex-col overflow-hidden p-6">
                        <div className="space-y-3 border-b border-zinc-200 pb-6 dark:border-zinc-800">
                            <div className="inline-flex w-fit items-center gap-3 rounded-2xl bg-zinc-900 px-4 py-2 text-white shadow-xl dark:bg-white dark:text-zinc-900">
                                <Sparkles size={16} />
                                <span className="text-sm font-black tracking-[0.2em]">PROMITLY</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Prompt QA Platform</h1>
                                <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">Sharper navigation, clearer hierarchy, and a base visual system for the next product phases.</p>
                            </div>
                        </div>

                        <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                                            isActive
                                                ? "bg-zinc-900 text-white shadow-xl dark:bg-white dark:text-zinc-900"
                                                : "text-zinc-600 hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/70 dark:hover:text-white"
                                        )}
                                    >
                                        <Icon size={18} className={cn("transition-transform group-hover:scale-110", isActive && "scale-110")} />
                                        <span className="flex-1">{item.label}</span>
                                        {item.href === "/results" && results.length > 0 && (
                                            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black", isActive ? "bg-white/15 dark:bg-zinc-900/10" : "bg-zinc-200 dark:bg-zinc-800")}>
                                                {results.length}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-6 flex shrink-0 items-center gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                            <ThemeToggle />
                            <LanguageToggle />
                        </div>
                    </SurfaceCard>
                </aside>

                <div className="min-w-0 flex-1">
                    <SurfaceCard className="shell-panel sticky top-4 z-30 mb-6 p-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="section-kicker">
                                        <FlaskConical size={14} />
                                        Route Navigation
                                    </div>
                                    <p className="mt-3 text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                                        {pathname === "/workspace" && "Build and refine your prompt workspace"}
                                        {pathname === "/results" && "Review evaluation quality, latency, and cost"}
                                        {pathname === "/analytics" && "Track quality trends, rubrics, and regressions over time"}
                                        {pathname === "/history" && "Load and inspect previous evaluation runs"}
                                        {pathname === "/compare" && "Compare prompt versions and models"}
                                        {pathname === "/datasets" && "Manage reusable prompt test suites"}
                                        {pathname === "/schedules" && "Create recurring evaluation checks from saved prompt versions"}
                                        {pathname === "/reviews" && "Review failures and annotate runs"}
                                        {pathname === "/settings" && "Tune models, defaults, and workspace behavior"}
                                    </p>
                                </div>

                                <div className="hidden items-center gap-3 md:flex xl:hidden">
                                    <ThemeToggle />
                                    <LanguageToggle />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 overflow-x-auto xl:hidden">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "whitespace-nowrap rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition-all shadow-sm",
                                                isActive
                                                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                                                    : "border-zinc-200 bg-white/80 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {results.length > 0 ? `${results.length} result rows currently loaded in this workspace.` : "No results loaded yet. Run an evaluation from any page."}
                                </div>
                                <button
                                    onClick={handleRun}
                                    disabled={loading}
                                    className="inline-flex min-w-[180px] items-center justify-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-black text-white shadow-xl transition-all hover:translate-y-[-1px] hover:scale-[1.01] disabled:opacity-60 dark:border-zinc-200 dark:bg-white dark:text-zinc-900"
                                >
                                    <Sparkles size={16} className={cn(loading && "animate-pulse")} />
                                    {loading ? t("evaluating") : t("runTest")}
                                </button>
                            </div>
                        </div>
                    </SurfaceCard>

                    <main>{children}</main>
                </div>
            </div>
        </div>
    );
}
