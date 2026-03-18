import { ArrowRight, Sparkles } from "lucide-react";

interface ComingSoonPageProps {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
}

export function ComingSoonPage({ eyebrow, title, description, bullets }: ComingSoonPageProps) {
    return (
        <div className="rounded-[2.5rem] border border-zinc-200 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/50 md:p-10">
            <div className="max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-teal-600 dark:text-teal-300">
                    <Sparkles size={14} />
                    {eyebrow}
                </div>
                <div className="space-y-3">
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white md:text-4xl">{title}</h2>
                    <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    {bullets.map((bullet) => (
                        <div
                            key={bullet}
                            className="flex items-start gap-3 rounded-[1.75rem] border border-zinc-200 bg-zinc-50/80 px-5 py-4 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300"
                        >
                            <ArrowRight size={16} className="mt-0.5 shrink-0 text-teal-500" />
                            <span>{bullet}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
