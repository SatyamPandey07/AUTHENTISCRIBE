/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Check, Copy, Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface GrammarIssue {
  original: string;
  replacement: string;
  type: string;
  explanation: string;
  context: string;
}

interface GrammarResult {
  correctedText: string;
  issues: GrammarIssue[];
}

export default function GrammarChecker() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckGrammar = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/check-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to check grammar");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while analyzing grammar.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setText(
      "Their was many reasons why the study was not successfull. First of all, the datas was collected late. Secondly, the participants did not completed the forms correctly, which impact on the final outcome."
    );
    setError(null);
    setResult(null);
  };

  return (
    <div className="space-y-6" id="grammar-checker-root">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm" id="grammar-header">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-teal-600 animate-pulse" />
          <span>Advanced AI Grammar & Mechanics Auditor</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
          Deep structural syntax scanning. Identify spelling blunders, tense mismatches, punctuation slip-ups, and get context-aware vocabulary upgrades to elevate your prose instantly.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded text-xs flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <p className="font-sans">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="grammar-grid">
        {/* Left Input Column */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm flex flex-col justify-between space-y-4" id="grammar-input-panel">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                Draft Copy
              </span>
              <button
                onClick={handleLoadSample}
                className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 font-mono flex items-center space-x-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Load Erroneous Draft</span>
              </button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or write your raw text here..."
              className="w-full h-80 border border-slate-200 rounded p-4 text-sm font-sans focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/10"
              id="grammar-text-input"
            />
          </div>

          <button
            onClick={handleCheckGrammar}
            disabled={loading || !text.trim()}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            id="grammar-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Scanning Grammatical Flow...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Verify Syntax & Grammar</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Column */}
        <div className="bg-slate-950 border border-slate-900 rounded p-5 text-white shadow-lg flex flex-col justify-between" id="grammar-output-panel">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="h-10 w-10 text-teal-400 animate-spin mb-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">
                Running Syntax Diagnostics
              </h3>
              <p className="text-xs text-slate-500 max-w-xs text-center mt-2 leading-relaxed font-sans">
                Gemini is cross-referencing formal linguistic structures, auditing verb-subject agreements, and formulating stylistic edits...
              </p>
            </div>
          ) : result ? (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block">
                    Audit Resolved
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mt-1 font-mono">
                    Found {result.issues.length} Potential Issues
                  </h3>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-sm border border-slate-800 transition-colors flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  id="copy-corrected-btn"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Corrected"}</span>
                </button>
              </div>

              {/* Corrected Box */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                  Polished Text Output
                </span>
                <div className="bg-slate-1000 border border-slate-900 rounded p-4 max-h-48 overflow-y-auto text-xs font-sans text-slate-200 leading-relaxed select-text cursor-text">
                  {result.correctedText}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                  Mechanical Correction Feed
                </span>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {result.issues.map((issue, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-850 rounded p-3 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                          {issue.type}
                        </span>
                        <span className="font-mono text-[9px] text-slate-500">
                          Correction #{idx + 1}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs py-1 flex-wrap">
                        <span className="line-through text-rose-400 bg-rose-400/10 px-1 rounded font-mono">
                          {issue.original}
                        </span>
                        <span className="text-slate-400">➔</span>
                        <span className="text-teal-400 bg-teal-400/10 px-1 rounded font-mono font-bold">
                          {issue.replacement}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        <span className="font-bold text-slate-300">Context:</span> "{issue.context}" — {issue.explanation}
                      </p>
                    </div>
                  ))}
                  {result.issues.length === 0 && (
                    <div className="text-center py-6 text-slate-500">
                      <p className="text-xs font-mono uppercase text-teal-400">Flawless Structure</p>
                      <p className="text-[11px] mt-1 text-slate-500 font-sans">No spelling or grammar errors detected.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500" id="grammar-empty-placeholder">
              <Check className="h-10 w-10 text-slate-800 mb-3" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                Grammar Audit Dashboard
              </h3>
              <p className="text-xs text-slate-600 max-w-[240px] text-center mt-2 font-sans leading-relaxed">
                Provide text draft, trigger syntax checker, and watch deep mechanical reports populate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
