"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ModelStats } from "@/lib/types";
import { getStats, getHealth } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

export default function DashboardPage() {
    const [stats, setStats] = useState<ModelStats | null>(null);
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        getStats().then(setStats).catch(() => setError(true));
        getHealth().then(setHealth).catch(() => { });
    }, []);

    const cm = stats?.confusion_matrix;

    return (
        <main className="relative min-h-screen pb-16">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 pt-12">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mb-8"
                >
                    ← Back to Detector
                </Link>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent mb-3"
                >
                    Admin Dashboard
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 mb-10"
                >
                    Model metrics, system health, and performance overview.
                </motion.p>

                {error && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-6 text-sm text-red-400">
                        ⚠️ Unable to connect to backend. Make sure the API server is
                        running.
                    </div>
                )}

                {/* System status */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                    <div className="rounded-xl bg-gray-900/80 backdrop-blur-xl border border-white/10 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Status
                        </p>
                        <div className="flex items-center gap-2">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${health?.status === "ok"
                                        ? "bg-green-400 animate-pulse"
                                        : "bg-gray-500"
                                    }`}
                            />
                            <span className="text-lg font-semibold text-white">
                                {health?.status === "ok" ? "Online" : "Offline"}
                            </span>
                        </div>
                    </div>
                    <div className="rounded-xl bg-gray-900/80 backdrop-blur-xl border border-white/10 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Model Loaded
                        </p>
                        <span className="text-lg font-semibold text-white">
                            {health?.model_loaded ? "✅ Yes" : "⚠️ Mock Mode"}
                        </span>
                    </div>
                    <div className="rounded-xl bg-gray-900/80 backdrop-blur-xl border border-white/10 p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Device
                        </p>
                        <span className="text-lg font-semibold text-white uppercase">
                            {health?.device || "—"}
                        </span>
                    </div>
                </motion.div>

                {stats && (
                    <>
                        {/* Metrics */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                        >
                            {[
                                { label: "Accuracy", value: stats.accuracy, icon: "🎯" },
                                { label: "F1 Score", value: stats.f1_score, icon: "📊" },
                                { label: "Precision", value: stats.precision, icon: "🔬" },
                                { label: "Recall", value: stats.recall, icon: "📡" },
                            ].map((m, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl bg-gray-900/80 backdrop-blur-xl border border-white/10 p-5 text-center"
                                >
                                    <span className="text-2xl">{m.icon}</span>
                                    <p className="mt-2 text-3xl font-bold text-white tabular-nums">
                                        {(m.value * 100).toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{m.label}</p>
                                </div>
                            ))}
                        </motion.div>

                        {/* Details & Matrix */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {cm && (
                                <div className="rounded-xl bg-gray-900/80 backdrop-blur-xl border border-white/10 p-5">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                        Confusion Matrix
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-center">
                                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
                                            <p className="text-emerald-400 font-bold text-2xl">
                                                {cm.true_negative}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">True Neg</p>
                                        </div>
                                        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                                            <p className="text-red-400 font-bold text-2xl">
                                                {cm.false_positive}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">False Pos</p>
                                        </div>
                                        <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-4">
                                            <p className="text-orange-400 font-bold text-2xl">
                                                {cm.false_negative}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">False Neg</p>
                                        </div>
                                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
                                            <p className="text-emerald-400 font-bold text-2xl">
                                                {cm.true_positive}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">True Pos</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-xl bg-gray-900/80 backdrop-blur-xl border border-white/10 p-5">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                    Training Details
                                </h3>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex justify-between text-gray-300">
                                        <span className="text-gray-400">Model</span>
                                        <span className="font-mono text-indigo-400">
                                            {stats.model_name}
                                        </span>
                                    </li>
                                    <li className="flex justify-between text-gray-300">
                                        <span className="text-gray-400">Dataset</span>
                                        <span>{stats.dataset}</span>
                                    </li>
                                    <li className="flex justify-between text-gray-300">
                                        <span className="text-gray-400">Epochs</span>
                                        <span>{stats.training_epochs}</span>
                                    </li>
                                    <li className="flex justify-between text-gray-300">
                                        <span className="text-gray-400">Total Samples</span>
                                        <span>{stats.total_samples.toLocaleString()}</span>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </main>
    );
}
