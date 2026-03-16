"use client";

import React from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Tooltip, Legend
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
        { name: 'Pass', value: passCount, color: '#10b981' }, // emerald-500
        { name: 'Fail', value: failCount, color: '#ef4444' }  // red-500
    ];

    // 2. Score Distribution (Radar Data)
    const avgSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
    const avgSemantic = results.reduce((sum, r) => sum + r.semanticScore, 0) / results.length;
    const radarData = [
        { subject: 'Similarity', A: avgSimilarity, fullMark: 100 },
        { subject: 'Semantic', A: avgSemantic, fullMark: 100 },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Pass/Fail Distribution */}
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-6 flex items-center justify-between">
                    Success Distribution
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{results.length} total</span>
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                                    border: 'none', 
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '12px'
                                }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-8 mt-2">
                    {pieData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                                {item.name}: {((item.value / results.length) * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Score Performance (Radar) */}
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col items-center">
                <h3 className="w-full text-sm font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-6">
                    Metric Comparison
                </h3>
                <div className="h-[250px] w-full max-w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 800 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Average Score"
                                dataKey="A"
                                stroke="#14b8a6"
                                fill="#14b8a6"
                                fillOpacity={0.4}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                                    border: 'none', 
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '12px'
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 text-center">
                        <div className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Vector</div>
                        <div className="text-lg font-black text-zinc-900 dark:text-white">{avgSimilarity.toFixed(1)}%</div>
                    </div>
                    <div className="p-3 bg-teal-500/5 rounded-2xl border border-teal-500/20 text-center">
                        <div className="text-[10px] uppercase font-bold text-teal-500/60 mb-1">Semantic</div>
                        <div className="text-lg font-black text-teal-500">{avgSemantic.toFixed(1)}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
