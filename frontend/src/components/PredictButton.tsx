"use client";

import { motion } from "framer-motion";

interface PredictButtonProps {
    onClick: () => void;
    loading: boolean;
    disabled: boolean;
}

export default function PredictButton({
    onClick,
    loading,
    disabled,
}: PredictButtonProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex justify-center mt-6"
        >
            <button
                onClick={onClick}
                disabled={disabled || loading}
                className="group relative px-10 py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {/* Neon glow */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-40 blur-lg group-hover:blur-xl transition-all" />

                <span className="relative flex items-center gap-2 text-base">
                    {loading ? (
                        <>
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="inline-block"
                            >
                                ⚡
                            </motion.span>
                            Analysing…
                        </>
                    ) : (
                        <>
                            <span>🔍</span>
                            Detect Sarcasm
                        </>
                    )}
                </span>
            </button>
        </motion.div>
    );
}
