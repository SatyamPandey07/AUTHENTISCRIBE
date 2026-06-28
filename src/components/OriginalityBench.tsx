/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, BarChart2, Lightbulb, Check, Copy, HelpCircle, Loader2 } from "lucide-react";

interface OriginalityBenchProps {
  onRephraseSentence: (sentence: string, style: string) => Promise<string[] | null>;
}

export default function OriginalityBench({ onRephraseSentence }: OriginalityBenchProps) {
  const [testPhrase, setTestPhrase] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("natural");
  const [variations, setVariations] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const concepts = [
    {
      title: "Perplexity Score",
      metric: "Vocabulary Entropy",
      description: "AI detectors model probability vectors. If the next word chosen in a sentence matches the model's top predicted token, perplexity is extremely low. Humorous phrasing, rare idioms, and creative adjectives spike perplexity, signaling human authors.",
      tip: "Avoid default adverbs like 'efficiently', 'critically', or 'significantly'. Swap them with custom metaphors."
    },
    {
      title: "Burstiness Score",
      metric: "Structural Variance",
      description: "Machine-generated documents have highly uniform sentence patterns, typically averaging 15-20 words per sentence continuously. Humans write in bursts: a long 40-word descriptive clause followed immediately by a short 4-word punchy exclamation.",
      tip: "Incorporate single-word sentences. Break down dense semi-colon paragraphs into staggered sentences."
    },
    {
      title: "N-gram Repetitiveness",
      metric: "Syntax Recurrence",
      description: "Synthetic language regularly recycles phrases like 'it is important to note', 'in conclusion', or 'delve into'. These high-frequency multi-word patterns are mapped by detection models as distinct AI signatures.",
      tip: "Use conversational signposts. Write like you are speaking directly to a friend at a café."
    }
  ];

  const handleTestRun = async () => {
    if (!testPhrase.trim()) return;
    setLoading(true);
    setVariations(null);
    try {
      const results = await onRephraseSentence(testPhrase, selectedStyle);
      if (results) {
        setVariations(results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (txt: string, idx: number) => {
    navigator.clipboard.writeText(txt);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  return (
    <div className="space-y-6" id="tuning-bench-root">
      
      {/* Description Header */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm" id="bench-header-card">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono flex items-center space-x-2">
          <BarChart2 className="h-4 w-4 text-indigo-500 animate-pulse" />
          <span>Originality Tuning Laboratory</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
          Unlock the science of AI evasion and readability. Learn how detectors identify machine signatures, and experiment with real-time sentence restructuring inside our sandbox below.
        </p>
      </div>

      {/* The Scientific Concepts Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="scientific-grid">
        {concepts.map((concept, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-5 rounded shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-800 font-sans">{concept.title}</span>
              <span className="text-[9px] font-bold font-mono text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                {concept.metric}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              {concept.description}
            </p>
            <div className="flex items-start space-x-1.5 bg-slate-50 border border-slate-150 p-2.5 rounded text-[10px] text-slate-500">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-700 uppercase font-mono tracking-wider text-[9px]">Tuning Tip:</strong> {concept.tip}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Sentence Tuning Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="sandbox-grid-layout">
        
        {/* Sandbox Left: Input phrase & style selections */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm flex flex-col justify-between" id="sandbox-input-panel">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
              Sentence Originality Sandbox
            </span>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Input a single AI-sounding sentence or phrase. We will run it through our dedicated rephrase API to return 3 highly distinct, high-perplexity human alternatives.
            </p>

            <input
              type="text"
              id="sandbox-test-phrase-input"
              value={testPhrase}
              onChange={(e) => setTestPhrase(e.target.value)}
              placeholder="e.g., In this modern educational era, it is critically important to utilize AI..."
              className="w-full border border-slate-150 rounded p-3 text-sm font-sans focus:outline-hidden focus:border-indigo-500 bg-slate-50/20"
            />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2">
                Paraphrase Style Focus
              </span>
              <div className="grid grid-cols-3 gap-2" id="sandbox-style-selectors">
                {["natural", "idiomatic", "scholarly"].map((styleOpt) => (
                  <button
                    key={styleOpt}
                    id={`sandbox-style-${styleOpt}`}
                    onClick={() => setSelectedStyle(styleOpt)}
                    className={`py-2 px-3 border rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      selectedStyle === styleOpt
                        ? "border-slate-900 bg-slate-900/5 text-slate-950"
                        : "border-slate-150 hover:border-slate-300 text-slate-500"
                    }`}
                  >
                    {styleOpt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleTestRun}
            disabled={loading || !testPhrase.trim()}
            className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            id="sandbox-rephrase-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Generating original variations...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Generate Original Swaps</span>
              </>
            )}
          </button>
        </div>

        {/* Sandbox Right: Live variations board */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded p-5 shadow-md flex flex-col justify-between" id="sandbox-output-panel">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block border-b border-slate-800 pb-2 mb-4">
              Linguistic Variations Sandbox Output
            </span>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12" id="sandbox-loading-state">
                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-3" />
                <p className="text-xs text-slate-400">Restructuring sentence entropy...</p>
              </div>
            ) : variations ? (
              <div className="space-y-3" id="sandbox-variations-list">
                {variations.map((v, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-950 border border-slate-855 p-3 rounded flex justify-between items-start gap-3 hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest">Variant #{idx + 1}</span>
                      <p className="text-xs text-slate-200 leading-relaxed">"{v}"</p>
                    </div>
                    <button
                      onClick={() => copyText(v, idx)}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                      title="Copy variant"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center" id="sandbox-empty-state">
                <Sparkles className="h-6 w-6 text-slate-700 mb-2" />
                <p className="text-xs font-mono uppercase text-slate-400 tracking-widest">Sandbox Empty</p>
                <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">
                  Input a sentence on the left and run the rephrase engine to populate variations.
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-3 mt-4 flex items-center space-x-1.5 font-mono uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
            <span>Copy any variation for 100% human scoring.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
