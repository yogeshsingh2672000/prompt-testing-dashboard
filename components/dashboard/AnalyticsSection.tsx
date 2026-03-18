"use client";

import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Tooltip
} from 'recharts';
import { EvaluationResult } from '@/types';
import { useTranslations } from 'next-intl';

interface AnalyticsSectionProps {
    results: EvaluationResult[];
}

export function AnalyticsSection({ results }: AnalyticsSectionProps) {
    const t = useTranslations("analytics");

    if (results.length === 0) return null;

    // 1. Pass/Fail Data
    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.length - passCount;
    const pieData = [
        { name: "pass", value: passCount, color: '#10b981' }, // emerald-500
        { name: "fail", value: failCount, color: '#ef4444' }  // red-500
    ];

    // 2. Score Distribution (Radar Data)
    const avgSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
    const avgSemantic = results.reduce((sum, r) => sum + r.semanticScore, 0) / results.length;
    const radarData = [
        { subject: t('similarity'), A: avgSimilarity, fullMark: 100 },
        { subject: t('semantic'), A: avgSemantic, fullMark: 100 },
    ];

    return (
        <div className="flex flex-col gap-8 xl:flex-row animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Pass/Fail Distribution */}
            <div className="min-w-0 flex-1 bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-red-500 opacity-50" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-8 flex items-center justify-between">
                    {t("successVelocity")}
                    <span className="text-[10px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-1 rounded-full shadow-lg">
                        {results.length} {t("samples")}
                    </span>
                </h3>
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} className="filter drop-shadow-xl" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(9, 9, 11, 0.95)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '24px',
                                    padding: '16px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-black tracking-tighter text-emerald-500">{((passCount / results.length) * 100).toFixed(0)}%</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("success")}</span>
                    </div>
                </div>
                <div className="flex justify-center gap-12 mt-4">
                    {pieData.map((item) => (
                        <div key={item.name} className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.name}</span>
                            </div>
                            <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 italic">
                                {item.value} <span className="text-[10px] opacity-40 not-italic">{t("cases")}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Score Performance (Radar) */}
            <div className="min-w-0 flex-1 bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-teal-500 to-blue-500 opacity-50" />
                <h3 className="w-full text-xs font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-8">
                    {t("semanticFingerprint")}
                </h3>
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#3f3f46" strokeDasharray="4 4" opacity={0.3} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 11, fontWeight: 900, letterSpacing: '0.1em' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name={t("avgPerformance")}
                                dataKey="A"
                                stroke="#14b8a6"
                                fill="#14b8a6"
                                fillOpacity={0.3}
                                strokeWidth={3}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(9, 9, 11, 0.95)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '24px',
                                    padding: '16px'
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    <div className="p-5 bg-zinc-950/5 dark:bg-zinc-950/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center transition-all hover:border-zinc-400 dark:hover:border-zinc-600">
                        <div className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-2 italic">{t("vectorMatch")}</div>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">{avgSimilarity.toFixed(1)}%</div>
                    </div>
                    <div className="p-5 bg-teal-500/[0.03] dark:bg-teal-500/[0.08] rounded-3xl border border-dashed border-teal-500/30 text-center transition-all hover:bg-teal-500/10 hover:border-teal-500/50">
                        <div className="text-[10px] uppercase font-black text-teal-500/60 tracking-widest mb-2 italic">{t("semanticFit")}</div>
                        <div className="text-2xl font-black text-teal-500 tracking-tighter">{avgSemantic.toFixed(1)}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
