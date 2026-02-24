"use client";

import { motion } from "framer-motion";
import { PredictResponse } from "@/lib/types";

interface ResultCardProps {
    result: PredictResponse;
}

export default function ResultCard({ result }: ResultCardProps) {
    const isSarcastic = result.prediction === "Sarcastic";
    const pct = Math.round(result.confidence * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto max-w-2xl mt-8 px-4"
        >
            <div className="relative rounded-2xl overflow-hidden">
                {/* Background glow */}
                <div
                    className={`absolute -inset-1 blur-xl opacity-30 ${isSarcastic
                            ? "bg-gradient-to-r from-orange-500 to-red-500"
                            : "bg-gradient-to-r from-green-500 to-emerald-500"
                        }`}
                />

                <div className="relative rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 space-y-5">
                    {/* Label badge */}
                    <div className="flex items-center justify-between">
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${isSarcastic
                                    ? "bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                                    : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                }`}
                        >
                            <span>{isSarcastic ? "😏" : "😊"}</span>
                            {result.prediction}
                        </motion.span>

                        <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                            {pct}%
                        </span>
                    </div>

                    {/* Confidence bar */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                            <span>Confidence</span>
                            <span>{pct}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                className={`h-full rounded-full ${isSarcastic
                                        ? "bg-gradient-to-r from-orange-500 to-red-500"
                                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Highlighted words */}
                    {result.highlighted_words.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Key Words (Attention Highlights)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {result.highlighted_words.map((word, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + i * 0.08 }}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium border ${isSarcastic
                                                ? "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20"
                                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                                            }`}
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Attention scores visualization */}
                    {result.attention_scores &&
                        Object.keys(result.attention_scores).length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Attention Distribution
                                </h4>
                                <div className="space-y-1.5">
                                    {Object.entries(result.attention_scores)
                                        .filter(([key]) => !key.startsWith("_"))
                                        .slice(0, 8)
                                        .map(([word, score], i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + i * 0.05 }}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="w-20 text-xs text-gray-600 dark:text-gray-400 truncate text-right">
                                                    {word}
                                                </span>
                                                <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${Math.min(score * 300, 100)}%`,
                                                        }}
                                                        transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                                                        className="h-full rounded-full bg-indigo-500/70"
                                                    />
                                                </div>
                                                <span className="w-12 text-xs text-gray-500 tabular-nums">
                                                    {(score as number).toFixed(3)}
                                                </span>
                                            </motion.div>
                                        ))}
                                </div>
                            </div>
                        )}

                    {/* Explanation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 p-4"
                    >
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                            AI Explanation
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {result.explanation}
                        </p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
