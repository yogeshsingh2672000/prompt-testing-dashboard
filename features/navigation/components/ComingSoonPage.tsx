import { ArrowRight, Sparkles } from "lucide-react";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { SurfaceCard } from "@/shared/ui/SurfaceCard";

interface ComingSoonPageProps {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
}

export function ComingSoonPage({ eyebrow, title, description, bullets }: ComingSoonPageProps) {
    return (
        <SurfaceCard className="md:p-10">
            <div className="max-w-3xl space-y-6">
                <SectionHeading
                    eyebrow={eyebrow}
                    title={title}
                    description={description}
                    action={<Sparkles size={16} className="hidden text-teal-500 sm:block" />}
                />
                <div className="grid gap-3 md:grid-cols-2">
                    {bullets.map((bullet) => (
                        <div
                            key={bullet}
                            className="flex items-start gap-3 rounded-[1.75rem] border border-zinc-200/80 bg-white/75 px-5 py-4 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300"
                        >
                            <ArrowRight size={16} className="mt-0.5 shrink-0 text-teal-500" />
                            <span>{bullet}</span>
                        </div>
                    ))}
                </div>
            </div>
        </SurfaceCard>
    );
}
