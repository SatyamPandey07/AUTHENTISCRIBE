/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Sparkles, Loader2, AlertCircle, FileText, CheckSquare } from "lucide-react";

interface ProofreadResult {
  proofreadText: string;
  changesSummary: string[];
  clarityScoreBefore: number;
  clarityScoreAfter: number;
  styleSuggestions: string[];
}

export default function AIProofreader() {
  const [text, setText] = useState("");
  const [focus, setFocus] = useState("clarity");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProofreadResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const focusOptions = [
    { id: "clarity", label: "Clarity & Force", desc: "Shorten sentences, eliminate passive voice, and improve focus" },
    { id: "corporate", label: "Executive Impact", desc: "Enhance professional voice, business terminology, and authoritative tone" },
    { id: "academic", label: "Scholarly Rigor", desc: "Upgrade vocabulary, remove informalities, and strengthen arguments" },
    { id: "engagement", label: "Vivid/Creative", desc: "Introduce active metaphors, narrative rhythm, and sensory hooks" },
  ];

  const handleProofread = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/proofread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, focus }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to proofread text");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while proofreading.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.proofreadText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setText(
      "There is a great deal of people who are of the opinion that social media applications have a tendency to make individuals have less real-life conversations. Basically, when we are looking at phones all of the time, we are not really talking to our friends who are right in front of us."
    );
    setError(null);
    setResult(null);
  };

  return (
    <div className="space-y-6" id="proofreader-root">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm" id="proofreader-header">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-teal-600 animate-pulse" />
          <span>Advanced AI Proofreader & Stylist</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
          Redesign prose architecture. Remove wordiness, inject active phrasing, balance syntax rhythms, and calibrate your draft for peak professional readability.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded text-xs flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <p className="font-sans">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="proofreader-grid">
        {/* Left config/input panel */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4 flex flex-col justify-between" id="proofreader-input-panel">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                Original Draft
              </span>
              <button
                onClick={handleLoadSample}
                className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 font-mono"
              >
                Load Wordy Draft
              </button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or write your document draft here..."
              className="w-full h-52 border border-slate-200 rounded p-4 text-sm font-sans focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/10"
              id="proofreader-text-input"
            />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-2">
                Select Editing Focus
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {focusOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFocus(opt.id)}
                    className={`text-left p-3 rounded border transition-all duration-200 cursor-pointer ${
                      focus === opt.id
                        ? "border-teal-600 bg-teal-50/30 text-teal-950"
                        : "border-slate-150 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span className="text-xs font-bold block text-slate-800">{opt.label}</span>
                    <span className="text-[9px] text-slate-450 leading-normal block mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleProofread}
            disabled={loading || !text.trim()}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            id="proofread-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Polishing Draft...</span>
              </>
            ) : (
              <>
                <FileText className="h-3.5 w-3.5" />
                <span>Polish Draft & Improve Clarity</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output panel */}
        <div className="bg-slate-950 border border-slate-900 rounded p-5 text-white shadow-lg flex flex-col justify-between" id="proofreader-output-panel">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="h-10 w-10 text-teal-400 animate-spin mb-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">
                Rebuilding Prose Architecture
              </h3>
              <p className="text-xs text-slate-500 max-w-xs text-center mt-2 leading-relaxed font-sans">
                Gemini is stripping passive phrasing, tightening syntax connections, refining vocabulary, and tuning clarity scores...
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block">
                    Proofread Complete
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mt-1 font-mono">
                    Polished Copy Ready
                  </h3>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-sm border border-slate-800 transition-colors flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  id="copy-proofread-btn"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Polished"}</span>
                </button>
              </div>

              {/* Clarity Delta Widgets */}
              <div className="grid grid-cols-2 gap-3" id="clarity-score-widgets">
                <div className="bg-slate-900/60 border border-slate-900 p-3 rounded">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Original Clarity</span>
                  <span className="text-xl font-mono font-bold text-rose-400 mt-1 block">
                    {result.clarityScoreBefore}%
                  </span>
                </div>
                <div className="bg-slate-900/60 border border-slate-900 p-3 rounded">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Polished Clarity</span>
                  <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block">
                    {result.clarityScoreAfter}%
                  </span>
                </div>
              </div>

              {/* Main Output Box */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                  Polished Copy
                </span>
                <div className="bg-slate-1000 border border-slate-900 rounded p-4 h-40 overflow-y-auto text-xs font-sans text-slate-200 leading-relaxed select-text cursor-text">
                  {result.proofreadText}
                </div>
              </div>

              {/* Adjustments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                    Editorial Changes Made
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {result.changesSummary.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-1.5 text-[10px] text-slate-300">
                        <CheckSquare className="h-3 w-3 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                    Stylistic Insights
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {result.styleSuggestions.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-1.5 text-[10px] text-slate-400">
                        <span className="text-teal-400 font-bold">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500" id="proofreader-empty-placeholder">
              <FileText className="h-10 w-10 text-slate-800 mb-3" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                Proofreader Output Board
              </h3>
              <p className="text-xs text-slate-600 max-w-[240px] text-center mt-2 font-sans leading-relaxed">
                Configure focus target, type or paste copy, and see clarity metrics transform side-by-side.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
