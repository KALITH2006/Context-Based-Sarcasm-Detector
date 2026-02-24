"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
    const [dark, setDark] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "light") {
            setDark(false);
            document.documentElement.classList.remove("dark");
        } else {
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggle = () => {
        setDark((prev) => {
            const next = !prev;
            if (next) {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light");
            }
            return next;
        });
    };

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggle}
            className="relative h-10 w-10 rounded-full border border-gray-300 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md flex items-center justify-center text-xl hover:border-indigo-400/50 transition-colors shadow-sm"
            aria-label="Toggle theme"
        >
            <motion.span
                key={dark ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                {dark ? "🌙" : "☀️"}
            </motion.span>
        </motion.button>
    );
}
