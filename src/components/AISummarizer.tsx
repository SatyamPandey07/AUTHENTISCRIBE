/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Sparkles, Loader2, AlertCircle, FileText, AlignLeft } from "lucide-react";

interface SummarizeResult {
  summary: string;
  keyTakeaways: string[];
  tldr: string;
  estimatedReadingTime: number;
  complexityScore: number;
}

export default function AISummarizer() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState("comprehensive");
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styleOptions = [
    { id: "comprehensive", label: "Executive Synthesis", desc: "Detailed formal narrative summary" },
    { id: "bullets", label: "Bulleted Keynotes", desc: "High-scannability structured bullet feed" },
    { id: "tldr", label: "TL;DR Flashcard", desc: "One-sentence maximum high-impact summary" },
    { id: "structured", label: "Bento Structure", desc: "Academic subsections and categorizations" },
  ];

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style, length }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to summarize text");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during summarization.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const contentToCopy = `${result.tldr}\n\nSUMMARY:\n${result.summary}\n\nKEY TAKEAWAYS:\n${result.keyTakeaways.join("\n")}`;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setText(
      "Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers. Today, IBM, Google, and other research organizations are designing superconducting quantum processors to execute quantum gates with high fidelity. The core benefit of quantum computation lies in superposition and entanglement, allowing qubits to evaluate multiple probability distributions simultaneously. This represents an exponential scaling factor for cryptography, logistics, molecular simulation, and machine learning models. However, severe challenges remain: qubits are extremely susceptible to atmospheric thermal noise, causing quantum decoherence. Researchers must build robust physical quantum error correction (QEC) protocols before commercially viable fault-tolerant quantum devices can be released to the market."
    );
    setError(null);
    setResult(null);
  };

  return (
    <div className="space-y-6" id="summarizer-root">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm" id="summarizer-header">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-teal-600 animate-pulse" />
          <span>Cognitive AI Document Summarizer</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
          Condense infinite pages into structured logic. Extract primary arguments, calculate complexity metrics, pinpoint estimated reading time durations, and establish elegant executive briefings.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded text-xs flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <p className="font-sans">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="summarizer-grid">
        {/* Left Input configuration column */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4 flex flex-col justify-between" id="summarizer-input-panel">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                Longform Source Document
              </span>
              <button
                onClick={handleLoadSample}
                className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 font-mono"
              >
                Load Scholarly Paragraph
              </button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or write your long text draft here..."
              className="w-full h-44 border border-slate-200 rounded p-4 text-sm font-sans focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/10"
              id="summarizer-text-input"
            />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-2">
                Configure Layout & Style
              </span>
              <div className="grid grid-cols-2 gap-2">
                {styleOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStyle(opt.id)}
                    className={`text-left p-2.5 rounded border transition-all duration-200 cursor-pointer ${
                      style === opt.id
                        ? "border-teal-600 bg-teal-50/30 text-teal-950"
                        : "border-slate-150 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span className="text-xs font-bold block text-slate-800">{opt.label}</span>
                    <span className="text-[9px] text-slate-450 leading-normal block mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-1">
                Target Length
              </span>
              <div className="grid grid-cols-3 gap-2">
                {["short", "medium", "long"].map((len) => (
                  <button
                    key={len}
                    onClick={() => setLength(len)}
                    className={`py-1.5 rounded border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      length === len
                        ? "border-teal-600 bg-teal-50/30 text-teal-950"
                        : "border-slate-150 hover:border-slate-350 text-slate-500"
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSummarize}
            disabled={loading || !text.trim()}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            id="summarizer-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Condensing Document...</span>
              </>
            ) : (
              <>
                <AlignLeft className="h-3.5 w-3.5" />
                <span>Generate Executive Briefing</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output panel */}
        <div className="bg-slate-950 border border-slate-900 rounded p-5 text-white shadow-lg flex flex-col justify-between" id="summarizer-output-panel">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="h-10 w-10 text-teal-400 animate-spin mb-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">
                Running Semantic Compressor
              </h3>
              <p className="text-xs text-slate-500 max-w-xs text-center mt-2 leading-relaxed font-sans">
                Gemini is filtering noise, evaluating core arguments, generating bullet summaries, and rating cognitive load indexes...
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block">
                    Synthesis Resolved
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mt-1 font-mono">
                    Document Condensation
                  </h3>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-sm border border-slate-800 transition-colors flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  id="copy-summary-btn"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Briefing"}</span>
                </button>
              </div>

              {/* Readability stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 border border-slate-900 p-2.5 rounded">
                  <span className="text-[8px] font-mono uppercase text-slate-500 block">Est. Reading Time</span>
                  <span className="text-lg font-mono font-bold text-teal-400 mt-0.5 block">
                    {result.estimatedReadingTime} {result.estimatedReadingTime === 1 ? "Minute" : "Minutes"}
                  </span>
                </div>
                <div className="bg-slate-900/60 border border-slate-900 p-2.5 rounded">
                  <span className="text-[8px] font-mono uppercase text-slate-500 block">Complexity Rating</span>
                  <span className="text-lg font-mono font-bold text-amber-400 mt-0.5 block">
                    {result.complexityScore} / 10
                  </span>
                </div>
              </div>

              {/* TLDR card */}
              <div className="bg-teal-950/15 border border-teal-900/40 p-3 rounded">
                <span className="text-[8px] font-mono uppercase text-teal-400 block font-bold tracking-wider">
                  Flash TL;DR
                </span>
                <p className="text-[11px] text-slate-250 italic leading-relaxed font-sans mt-1">
                  "{result.tldr}"
                </p>
              </div>

              {/* Main Summary */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                  Executive Narrative
                </span>
                <div className="bg-slate-1000 border border-slate-900 rounded p-3 h-28 overflow-y-auto text-xs font-sans text-slate-200 leading-relaxed select-text cursor-text">
                  {result.summary}
                </div>
              </div>

              {/* Key takeaways */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                  Bullet Key Takeaways
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {result.keyTakeaways.map((point, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 text-[10px] text-slate-350 font-sans leading-normal">
                      <span className="text-teal-400 font-mono font-bold">{idx + 1}.</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500" id="summarizer-empty-placeholder">
              <FileText className="h-10 w-10 text-slate-800 mb-3" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                Summarizer Dashboard
              </h3>
              <p className="text-xs text-slate-600 max-w-[240px] text-center mt-2 font-sans leading-relaxed">
                Provide document text, customize scannability shapes, and obtain deep automated summaries.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
