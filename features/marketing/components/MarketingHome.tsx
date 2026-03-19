import { ArrowRight, BarChart3, FileCheck2, GitCompareArrows, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { SITE_NAME } from "@/shared/constants/site";
import { SurfaceCard } from "@/shared/ui/SurfaceCard";

const featureCards = [
    {
        title: "Private local prompt testing",
        description: "Run prompt evaluations in your own environment so your prompts are not exposed to a third-party hosted testing platform.",
        icon: Sparkles,
    },
    {
        title: "Prompt evaluation and scoring",
        description: "Run prompt test suites with semantic scoring, rubric scoring, latency tracking, token usage, and cost visibility.",
        icon: BarChart3,
    },
    {
        title: "Prompt version comparison",
        description: "Compare prompt versions side by side, inspect deltas, review winning cases, and catch regressions before shipping.",
        icon: GitCompareArrows,
    },
    {
        title: "Structured output validation",
        description: "Validate JSON, prefixes, substrings, and regex output rules so format-sensitive prompts stay production-ready.",
        icon: ShieldCheck,
    },
    {
        title: "Human review workflow",
        description: "Layer manual approvals, reviewer notes, and override decisions on top of automated LLM evaluation results.",
        icon: FileCheck2,
    },
] as const;

const useCases = [
    "Test prompts locally without exposing them to hosted platforms",
    "Prompt regression testing before release",
    "Prompt QA for support bots and agent workflows",
    "Dataset-driven evaluation of Bedrock and LLM prompts",
    "Open-source prompt engineering experimentation",
];

export function MarketingHome({ locale }: { locale: string }) {
    return (
        <div className="min-h-screen bg-transparent">
            <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-10 px-4 py-6 md:px-6 lg:px-8">
                <SurfaceCard className="overflow-hidden">
                    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] xl:items-end">
                        <div className="space-y-6">
                            <div className="section-kicker">
                                <Sparkles size={14} />
                                Local-first Prompt QA
                            </div>
                            <div className="space-y-4">
                                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-zinc-900 dark:text-white md:text-6xl">
                                    {SITE_NAME} helps developers test prompts locally without exposing prompt logic to a hosted platform.
                                </h1>
                                <p className="max-w-3xl text-base leading-8 text-zinc-600 dark:text-zinc-300 md:text-lg">
                                    Promitly was built for developers who want a private, secluded environment for prompt testing. Instead of pasting sensitive prompts
                                    into a third-party hosted prompt evaluator, you can run prompt evaluation, prompt comparison, regression checks, and structured output validation locally in your own setup.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/workspace"
                                    locale={locale}
                                    className="inline-flex items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-black text-white shadow-xl transition hover:translate-y-[-1px] dark:border-zinc-200 dark:bg-white dark:text-zinc-900"
                                >
                                    Open Workspace
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/analytics"
                                    locale={locale}
                                    className="inline-flex items-center gap-3 rounded-3xl border border-zinc-200 bg-white/80 px-6 py-3 text-sm font-black text-zinc-700 shadow-sm transition hover:border-teal-400 hover:text-teal-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                                >
                                    Explore Analytics
                                </Link>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {useCases.map((item) => (
                                    <div key={item} className="rounded-[1.5rem] border border-zinc-200 bg-white/70 px-4 py-4 text-sm font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-200">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {featureCards.slice(0, 3).map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div key={card.title} className="rounded-[2rem] border border-zinc-200 bg-white/75 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
                                        <div className="mb-4 inline-flex rounded-2xl bg-zinc-900 px-3 py-3 text-white dark:bg-white dark:text-zinc-900">
                                            <Icon size={18} />
                                        </div>
                                        <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">{card.title}</h2>
                                        <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{card.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SurfaceCard>

                <div className="grid gap-6 xl:grid-cols-2">
                    {featureCards.slice(3).map((card) => {
                        const Icon = card.icon;
                        return (
                            <SurfaceCard key={card.title} className="space-y-4">
                                <div className="inline-flex rounded-2xl bg-zinc-900 px-3 py-3 text-white dark:bg-white dark:text-zinc-900">
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">{card.title}</h2>
                                    <p className="mt-3 text-sm leading-8 text-zinc-600 dark:text-zinc-300">{card.description}</p>
                                </div>
                            </SurfaceCard>
                        );
                    })}
                </div>

                <SurfaceCard className="space-y-6">
                    <div>
                        <div className="section-kicker">Why Promitly</div>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                            A prompt testing dashboard that feels like a real QA platform
                        </h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        <SeoPoint
                            title="Built for private prompt workflows"
                            description="Promitly exists for developers who want to test prompts locally and keep prompt logic inside their own environment instead of exposing it to a hosted prompt testing service."
                        />
                        <SeoPoint
                            title="Useful for Bedrock and modern LLM workflows"
                            description="Promitly supports model-aware evaluation flows, output validation, cost visibility, and comparison tooling for teams shipping AI systems with privacy and control in mind."
                        />
                        <SeoPoint
                            title="Open source and contributor-friendly"
                            description="The codebase is structured by domain, tested, and prepared for GitHub contributions so a local-first prompt QA platform can grow with the open-source community."
                        />
                    </div>
                </SurfaceCard>
            </div>
        </div>
    );
}

function SeoPoint({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-[1.75rem] border border-zinc-200 bg-white/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{description}</p>
        </div>
    );
}
