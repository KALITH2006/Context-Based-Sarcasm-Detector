"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PredictionHistoryItem } from "@/lib/types";

const STORAGE_KEY = "sarcasm-prediction-history";

interface PredictionHistoryProps {
    onReplay?: (text: string) => void;
}

function loadHistory(): PredictionHistoryItem[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
}

export function saveToHistory(
    text: string,
    result: PredictionHistoryItem["result"]
) {
    const items = loadHistory();
    items.unshift({
        id: crypto.randomUUID(),
        text,
        result,
        timestamp: Date.now(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
}

export default function PredictionHistory({ onReplay }: PredictionHistoryProps) {
    const [items, setItems] = useState<PredictionHistoryItem[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setItems(loadHistory());
    }, []);

    useEffect(() => {
        const handler = () => setItems(loadHistory());
        window.addEventListener("storage", handler);
        window.addEventListener("history-updated", handler);
        return () => {
            window.removeEventListener("storage", handler);
            window.removeEventListener("history-updated", handler);
        };
    }, []);

    const clearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        setItems([]);
    };

    if (items.length === 0) return null;

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mx-auto max-w-2xl mt-10 px-4"
        >
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-5 py-3 hover:border-indigo-500/30 transition-colors"
            >
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    🕒 Prediction History ({items.length})
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
                        <div className="mt-2 space-y-2 max-h-80 overflow-y-auto pr-1">
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="rounded-xl bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/5 px-4 py-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors"
                                    onClick={() => onReplay?.(item.text)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 flex-1">
                                            {item.text}
                                        </p>
                                        <span
                                            className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${item.result.prediction === "Sarcastic"
                                                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                }`}
                                        >
                                            {item.result.prediction} ·{" "}
                                            {Math.round(item.result.confidence * 100)}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                        <button
                            onClick={clearHistory}
                            className="mt-3 w-full text-center text-xs text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 transition-colors py-2"
                        >
                            Clear History
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
}
