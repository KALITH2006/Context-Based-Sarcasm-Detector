"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const PLACEHOLDERS = [
    "Oh great, another Monday morning meeting...",
    "I just love sitting in traffic for two hours.",
    "Wow, what a surprise — it's raining again!",
    "Sure, because that's exactly what I needed today.",
    "The food was absolutely wonderful. I almost ate it.",
];

interface TextInputProps {
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
    loading: boolean;
}

export default function TextInput({
    value,
    onChange,
    onSubmit,
    loading,
}: TextInputProps) {
    const [placeholder, setPlaceholder] = useState("");
    const [phIdx, setPhIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /* Animated typing placeholder */
    useEffect(() => {
        if (value) return;
        const target = PLACEHOLDERS[phIdx];
        const speed = deleting ? 30 : 60;

        const timer = setTimeout(() => {
            if (!deleting) {
                if (charIdx < target.length) {
                    setPlaceholder(target.slice(0, charIdx + 1));
                    setCharIdx((c) => c + 1);
                } else {
                    setTimeout(() => setDeleting(true), 1500);
                }
            } else {
                if (charIdx > 0) {
                    setPlaceholder(target.slice(0, charIdx - 1));
                    setCharIdx((c) => c - 1);
                } else {
                    setDeleting(false);
                    setPhIdx((i) => (i + 1) % PLACEHOLDERS.length);
                }
            }
        }, speed);

        return () => clearTimeout(timer);
    }, [charIdx, deleting, phIdx, value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto max-w-2xl px-4"
        >
            <div className="relative group">
                {/* Glow border */}
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-40 blur transition-opacity duration-500" />

                <div className="relative rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-1">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder || "Type your text here..."}
                        rows={4}
                        maxLength={1000}
                        disabled={loading}
                        className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none rounded-xl px-5 py-4 text-base focus:outline-none disabled:opacity-50"
                    />
                    <div className="flex items-center justify-between px-4 pb-3">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                            {value.length}/1000 characters
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-600">
                            Shift+Enter for new line
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
