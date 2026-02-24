"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import TextInput from "@/components/TextInput";
import PredictButton from "@/components/PredictButton";
import ResultCard from "@/components/ResultCard";
import ExampleSentences from "@/components/ExampleSentences";
import ModelStats from "@/components/ModelStats";
import PredictionHistory, {
  saveToHistory,
} from "@/components/PredictionHistory";
import BatchPredict from "@/components/BatchPredict";
import Footer from "@/components/Footer";
import { predict } from "@/lib/api";
import { PredictResponse } from "@/lib/types";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await predict(text.trim());
      setResult(res);
      saveToHistory(text.trim(), res);
      // notify history component
      window.dispatchEvent(new Event("history-updated"));
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Failed to get prediction. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExampleSelect = (t: string) => {
    setText(t);
    setResult(null);
    setError("");
  };

  return (
    <main className="relative min-h-screen pb-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/5 dark:bg-indigo-600/8 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/5 dark:bg-purple-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Hero />

        <TextInput
          value={text}
          onChange={setText}
          onSubmit={handlePredict}
          loading={loading}
        />

        <PredictButton
          onClick={handlePredict}
          loading={loading}
          disabled={!text.trim()}
        />

        {error && (
          <p className="mx-auto max-w-2xl text-center text-sm text-red-500 dark:text-red-400 mt-4 px-4">
            ⚠️ {error}
          </p>
        )}

        {result && <ResultCard result={result} />}

        <ExampleSentences onSelect={handleExampleSelect} />

        <BatchPredict />

        <PredictionHistory onReplay={handleExampleSelect} />

        <ModelStats />

        <Footer />
      </div>
    </main>
  );
}
