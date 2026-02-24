"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ENDPOINTS = [
    {
        method: "POST",
        path: "/api/predict",
        desc: "Analyse a single text for sarcasm",
        body: '{ "text": "Oh great, another Monday!" }',
        response: `{
  "prediction": "Sarcastic",
  "confidence": 0.91,
  "highlighted_words": ["great", "Oh"],
  "explanation": "The model detected ironic tone…",
  "attention_scores": { "Oh": 0.34, "great": 0.28, … }
}`,
    },
    {
        method: "POST",
        path: "/api/predict/batch",
        desc: "Analyse multiple texts at once (max 50)",
        body: '{ "texts": ["I love Mondays", "Wow so exciting"] }',
        response: `{
  "results": [
    { "prediction": "Not Sarcastic", "confidence": 0.82, … },
    { "prediction": "Sarcastic", "confidence": 0.88, … }
  ]
}`,
    },
    {
        method: "GET",
        path: "/api/stats",
        desc: "Retrieve model performance metrics",
        body: null,
        response: `{
  "accuracy": 0.892,
  "f1_score": 0.887,
  "precision": 0.901,
  "recall": 0.874,
  "total_samples": 26709,
  …
}`,
    },
    {
        method: "GET",
        path: "/api/health",
        desc: "Health check endpoint",
        body: null,
        response: '{ "status": "ok", "model_loaded": true, "device": "cpu" }',
    },
];

export default function ApiDocsPage() {
    return (
        <main className="relative min-h-screen pb-16">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-4 pt-12">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mb-8"
                >
                    ← Back to Detector
                </Link>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent mb-3"
                >
                    API Documentation
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 mb-10"
                >
                    RESTful endpoints for the Context-Based Sarcasm Detector backend
                    (FastAPI). Base URL:{" "}
                    <code className="text-indigo-400 bg-white/5 px-2 py-0.5 rounded">
                        http://localhost:8000
                    </code>
                </motion.p>

                <div className="space-y-8">
                    {ENDPOINTS.map((ep, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.1 }}
                            className="rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-white/10 overflow-hidden"
                        >
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                                <span
                                    className={`px-2.5 py-0.5 rounded text-xs font-bold ${ep.method === "POST"
                                            ? "bg-indigo-500/20 text-indigo-400"
                                            : "bg-emerald-500/20 text-emerald-400"
                                        }`}
                                >
                                    {ep.method}
                                </span>
                                <code className="text-sm text-white font-mono">{ep.path}</code>
                            </div>

                            <div className="px-5 py-4 space-y-4">
                                <p className="text-sm text-gray-300">{ep.desc}</p>

                                {ep.body && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                                            Request Body
                                        </p>
                                        <pre className="text-xs bg-black/40 rounded-lg p-3 text-indigo-300 overflow-x-auto">
                                            {ep.body}
                                        </pre>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                                        Response
                                    </p>
                                    <pre className="text-xs bg-black/40 rounded-lg p-3 text-emerald-300 overflow-x-auto">
                                        {ep.response}
                                    </pre>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-10 rounded-xl bg-white/5 border border-white/10 p-5 text-sm text-gray-400"
                >
                    <p>
                        <strong className="text-white">Interactive Docs:</strong> FastAPI
                        also serves auto-generated docs at{" "}
                        <code className="text-indigo-400">/docs</code> (Swagger) and{" "}
                        <code className="text-indigo-400">/redoc</code> (ReDoc).
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
