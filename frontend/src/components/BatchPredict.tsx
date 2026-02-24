"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { predictBatch } from "@/lib/api";
import { PredictResponse } from "@/lib/types";

export default function BatchPredict() {
    const [input, setInput] = useState("");
    const [results, setResults] = useState<PredictResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        const texts = input
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
        if (texts.length === 0) return;
        if (texts.length > 50) {
            setError("Maximum 50 sentences at once.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await predictBatch(texts);
            setResults(res.results);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Batch prediction failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mx-auto max-w-2xl mt-10 px-4"
        >
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-5 py-3 hover:border-indigo-500/30 transition-colors"
            >
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    📦 Batch Prediction
                </span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    className="text-gray-400 dark:text-gray-500"
                >
                    ▾
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 space-y-3">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter one sentence per line…"
                                rows={5}
                                className="w-full bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500/40"
                            />
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !input.trim()}
                                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white disabled:opacity-40 transition-colors"
                                >
                                    {loading ? "Analysing…" : "Analyse All"}
                                </button>
                                <span className="text-xs text-gray-500">
                                    {input.split("\n").filter((l) => l.trim()).length} sentences
                                </span>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                            )}

                            {results.length > 0 && (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {results.map((r, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center justify-between rounded-lg bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/5 px-4 py-2.5"
                                        >
                                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 flex-1 mr-3">
                                                {input.split("\n").filter((l) => l.trim())[i]}
                                            </p>
                                            <span
                                                className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${r.prediction === "Sarcastic"
                                                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    }`}
                                            >
                                                {r.prediction} · {Math.round(r.confidence * 100)}%
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
}
