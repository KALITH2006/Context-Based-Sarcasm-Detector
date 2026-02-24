import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sarcasm Detector — Context-Based AI Analysis",
  description:
    "Detect sarcasm in text using a fine-tuned BERT model with attention-based explainability. Built with Next.js, FastAPI, and HuggingFace Transformers.",
  keywords: [
    "sarcasm detection",
    "NLP",
    "BERT",
    "AI",
    "sentiment analysis",
    "machine learning",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
