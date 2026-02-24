"use client";

import { motion } from "framer-motion";

const EXAMPLES = [
    { text: "Oh great, another Monday morning meeting.", label: "Sarcastic" },
    { text: "I just love being stuck in traffic for hours.", label: "Sarcastic" },
    { text: "Wow, what a surprise — it's raining again!", label: "Sarcastic" },
    { text: "The sunset looks absolutely stunning tonight.", label: "Not Sarcastic" },
    { text: "Sure, because that's exactly what I needed.", label: "Sarcastic" },
    { text: "I had a wonderful time at the concert.", label: "Not Sarcastic" },
];

interface ExampleSentencesProps {
    onSelect: (text: string) => void;
}

export default function ExampleSentences({ onSelect }: ExampleSentencesProps) {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mx-auto max-w-2xl mt-12 px-4"
        >
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 text-center">
                💡 Try an Example
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXAMPLES.map((ex, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(ex.text)}
                        className="group text-left rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all"
                    >
                        <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            &ldquo;{ex.text}&rdquo;
                        </p>
                        <span
                            className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full ${ex.label === "Sarcastic"
                                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                }`}
                        >
                            {ex.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </motion.section>
    );
}
