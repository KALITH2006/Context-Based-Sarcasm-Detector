"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ModelStats as ModelStatsType } from "@/lib/types";
import { getStats } from "@/lib/api";

export default function ModelStats() {
    const [stats, setStats] = useState<ModelStatsType | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        getStats()
            .then(setStats)
            .catch(() => setError(true));
    }, []);

    if (error || !stats) return null;

    const metrics = [
        { label: "Accuracy", value: `${(stats.accuracy * 100).toFixed(1)}%`, icon: "🎯" },
        { label: "F1 Score", value: `${(stats.f1_score * 100).toFixed(1)}%`, icon: "📊" },
        { label: "Precision", value: `${(stats.precision * 100).toFixed(1)}%`, icon: "🔬" },
        { label: "Recall", value: `${(stats.recall * 100).toFixed(1)}%`, icon: "📡" },
    ];

    const cm = stats.confusion_matrix;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mx-auto max-w-4xl mt-16 px-4"
        >
            <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
                📈 Model Performance
            </h3>

            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {metrics.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + i * 0.1 }}
                        className="rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 text-center backdrop-blur-sm"
                    >
                        <span className="text-2xl">{m.icon}</span>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{m.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{m.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Extra info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Confusion matrix */}
                <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 backdrop-blur-sm">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Confusion Matrix
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-center text-sm">
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{cm.true_negative}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">True Neg</p>
                        </div>
                        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                            <p className="text-red-600 dark:text-red-400 font-bold text-lg">{cm.false_positive}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">False Pos</p>
                        </div>
                        <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
                            <p className="text-orange-600 dark:text-orange-400 font-bold text-lg">{cm.false_negative}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">False Neg</p>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{cm.true_positive}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">True Pos</p>
                        </div>
                    </div>
                </div>

                {/* Training details */}
                <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 backdrop-blur-sm">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Training Details
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Model</span>
                            <span className="font-mono text-indigo-600 dark:text-indigo-400">{stats.model_name}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Dataset</span>
                            <span>{stats.dataset}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Epochs</span>
                            <span>{stats.training_epochs}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Samples</span>
                            <span>{stats.total_samples.toLocaleString()}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </motion.section>
    );
}
