"use client";

import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function Hero() {
    return (
        <section className="relative text-center pt-12 pb-8 px-4">
            {/* Floating theme toggle */}
            <div className="absolute top-4 right-4 z-20">
                <ThemeToggle />
            </div>

            {/* AI pulse ring */}
            <div className="relative mx-auto mb-8 w-24 h-24 flex items-center justify-center">
                <motion.div
                    className="absolute inset-0 rounded-full bg-indigo-500/20"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute inset-2 rounded-full bg-indigo-500/30"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                    <span className="text-3xl">🧠</span>
                </div>
            </div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-700 dark:from-white dark:via-indigo-200 dark:to-purple-300 bg-clip-text text-transparent mb-4"
            >
                Sarcasm Detector
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
                Context-aware sarcasm detection powered by{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">BERT</span>. Paste any
                text and get instant AI analysis with attention-based explainability.
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-500"
            >
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    Model Online
                </span>
                <span>•</span>
                <span>BERT-base · Twitter Dataset</span>
                <span>•</span>
                <span>~89% Accuracy</span>
            </motion.div>
        </section>
    );
}
