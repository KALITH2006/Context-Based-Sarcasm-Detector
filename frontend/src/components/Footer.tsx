"use client";

import { motion } from "framer-motion";

const TECH = [
    "Next.js",
    "Tailwind CSS",
    "FastAPI",
    "HuggingFace Transformers",
    "BERT",
    "PyTorch",
    "Framer Motion",
];

export default function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-20 border-t border-gray-200 dark:border-white/5 py-10 px-4 text-center"
        >
            <p className="text-sm text-gray-500 mb-4">
                Built with modern AI & web technologies
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                {TECH.map((t, i) => (
                    <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5"
                    >
                        {t}
                    </span>
                ))}
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-600">
                Context-Based Sarcasm Detector &copy; {new Date().getFullYear()} — Powered by
                BERT &amp; Attention Mechanism
            </p>
        </motion.footer>
    );
}
