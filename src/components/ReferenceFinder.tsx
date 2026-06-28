/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link, Check, ExternalLink, Sparkles, Loader2, AlertCircle, FileText, Search } from "lucide-react";

interface SuggestedSource {
  title: string;
  url: string;
  citation: string;
}

interface VerifiedClaim {
  claim: string;
  status: string; // verified, unverified, disputed
  supportingEvidence: string;
  suggestedSources: SuggestedSource[];
}

interface ReferenceResult {
  verifiedClaims: VerifiedClaim[];
}

export default function ReferenceFinder() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReferenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFindReferences = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/find-references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to find references");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while seeking references.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setText(
      "The global average temperature has increased significantly over the last century. NASA researchers reported that 2023 was the warmest year on record. Additionally, sea levels are rising at a rate of 3.3 millimeters per year due to ice sheet melt."
    );
    setError(null);
    setResult(null);
  };

  return (
    <div className="space-y-6" id="reference-finder-root">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm" id="reference-finder-header">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-teal-600 animate-pulse" />
          <span>Real-World AI Fact Verifier & Citation Search</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
          Ground assertions in factual reality. Harnessing Google Search Grounding to audit claims, scan live publication databases, pull authoritative URLs, and compile precise scholarly references.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded text-xs flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <p className="font-sans">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="reference-finder-grid">
        {/* Left input panel */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4 flex flex-col justify-between" id="reference-finder-input-panel">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                Academic Assertions / Claims Text
              </span>
              <button
                onClick={handleLoadSample}
                className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 font-mono"
              >
                Load Assertive Text
              </button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text containing statistics, climate studies, health figures, or scholarly claims..."
              className="w-full h-80 border border-slate-200 rounded p-4 text-sm font-sans focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/10"
              id="reference-finder-text-input"
            />
          </div>

          <button
            onClick={handleFindReferences}
            disabled={loading || !text.trim()}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            id="reference-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Searching Web & Compiling Sources...</span>
              </>
            ) : (
              <>
                <Search className="h-3.5 w-3.5" />
                <span>Search References & Verify Facts</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output panel */}
        <div className="bg-slate-950 border border-slate-900 rounded p-5 text-white shadow-lg flex flex-col justify-between" id="reference-finder-output-panel">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="h-10 w-10 text-teal-400 animate-spin mb-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">
                Initiating Google Search Grounding
              </h3>
              <p className="text-xs text-slate-500 max-w-xs text-center mt-2 leading-relaxed font-sans">
                Gemini is extracting claim parameters, querying live scientific or academic indexes, pulling actual URLs, and formatting citations...
              </p>
            </div>
          ) : result && result.verifiedClaims ? (
            <div className="space-y-4 h-full flex flex-col justify-between">
              <div className="border-b border-slate-900 pb-3">
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block">
                  Grounding Verified
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mt-1 font-mono">
                  Identified & Audited {result.verifiedClaims.length} Claims
                </h3>
              </div>

              {/* Claims feed */}
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 flex-1">
                {result.verifiedClaims.map((claimObj, idx) => {
                  const isVerified = claimObj.status.toLowerCase() === "verified";
                  const isDisputed = claimObj.status.toLowerCase() === "disputed";
                  return (
                    <div key={idx} className="bg-slate-900 border border-slate-850 p-3 rounded text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] text-slate-500">
                          Claim Assert #{idx + 1}
                        </span>
                        <span
                          className={`font-mono text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                            isVerified
                              ? "bg-emerald-500/10 text-emerald-400"
                              : isDisputed
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {claimObj.status}
                        </span>
                      </div>

                      <p className="font-sans font-medium text-slate-200">
                        "{claimObj.claim}"
                      </p>

                      <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2 border border-slate-900 rounded font-sans leading-relaxed">
                        <span className="font-bold text-slate-300">Grounding Evidence:</span> {claimObj.supportingEvidence}
                      </div>

                      {claimObj.suggestedSources && claimObj.suggestedSources.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[9px] font-mono uppercase text-slate-500 block">Suggested Sources</span>
                          {claimObj.suggestedSources.map((src, sIdx) => (
                            <div key={sIdx} className="bg-slate-950 border border-slate-900 p-2 rounded text-[10px] space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-300 truncate max-w-[220px]">
                                  {src.title}
                                </span>
                                {src.url && (
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-teal-400 hover:text-teal-300 flex items-center space-x-0.5"
                                  >
                                    <span>Visit URL</span>
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                )}
                              </div>
                              <p className="font-mono text-[9px] text-slate-450 leading-relaxed break-words bg-slate-900/50 p-1 border border-slate-900 rounded">
                                {src.citation}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500" id="reference-finder-placeholder">
              <FileText className="h-10 w-10 text-slate-800 mb-3" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                Reference Finder Board
              </h3>
              <p className="text-xs text-slate-600 max-w-[240px] text-center mt-2 font-sans leading-relaxed">
                Paste copy containing statistics or scholarly statements, and watch Gemini ground them using Google Search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
