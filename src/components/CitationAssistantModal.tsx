/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  X, BookOpen, Loader2, Sparkles, AlertCircle, Copy, Check, FileText, Info, HelpCircle
} from "lucide-react";

interface Finding {
  claimOrReference: string;
  type: "missing_source" | "unformatted_reference" | string;
  detectedIssue: string;
  suggestedAPA: string;
  suggestedMLA: string;
  suggestedChicago: string;
}

interface CitationAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
}

export default function CitationAssistantModal({ isOpen, onClose, initialText }: CitationAssistantModalProps) {
  const [textToScan, setTextToScan] = useState(initialText || "");
  const [loading, setLoading] = useState(false);
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeStyles, setActiveStyles] = useState<{ [key: number]: "APA" | "MLA" | "CHICAGO" }>({});

  if (!isOpen) return null;

  const handleScan = async () => {
    if (!textToScan.trim()) {
      setError("Please paste or load some text to audit for citation health.");
      return;
    }
    setLoading(true);
    setError(null);
    setFindings(null);

    try {
      const response = await fetch("/api/citation-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToScan }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to scan citations.");
      }

      const data = await response.json();
      setFindings(data.findings || []);
      
      // Initialize active style tab for each finding
      const initialTabs: { [key: number]: "APA" | "MLA" | "CHICAGO" } = {};
      (data.findings || []).forEach((_: any, idx: number) => {
        initialTabs[idx] = "APA";
      });
      setActiveStyles(initialTabs);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during citation auditing.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (citationText: string, key: string) => {
    navigator.clipboard.writeText(citationText);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleLoadSample = () => {
    setTextToScan(
      "Artificial Intelligence has rapidly progressed since the introduction of transformers. According to researchers, the compute required for large models has doubled every 3.4 months. Furthermore, a 2023 study by Stanford showed that high-schoolers regularly use generative tools for assignment prep."
    );
    setError(null);
  };

  const selectStyle = (index: number, style: "APA" | "MLA" | "CHICAGO") => {
    setActiveStyles(prev => ({
      ...prev,
      [index]: style
    }));
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in"
      id="citation-assistant-modal"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        id="citation-assistant-dialog"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800" id="citation-assistant-modal-header">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-indigo-600/10 rounded border border-indigo-500/20">
              <BookOpen className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-1.5">
                <span>Citation Integrity Assistant</span>
                <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">Smart Audit</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Verify factual assertions, source validity, and compile standard bibliography style conversions.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-full cursor-pointer"
            id="close-citation-assistant-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" id="citation-assistant-modal-body">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded text-xs flex items-start space-x-2.5" id="citation-assistant-error">
              <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold uppercase font-mono tracking-wider text-[9px] text-rose-700 block">Verification Error</span>
                <p className="font-sans text-rose-800 leading-relaxed mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Prompt Editor Panel (Only show if not scanned or loading, or let users edit text easily) */}
          {!findings && !loading && (
            <div className="space-y-4" id="citation-assistant-setup-view">
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded flex items-start space-x-3">
                <Info className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-600 font-sans leading-relaxed">
                  <p className="font-semibold text-slate-800">What does the Citation Integrity Assistant do?</p>
                  <p className="mt-1">
                    It scans your content for two key academic issues: <strong className="text-rose-700 font-medium">missing source citations</strong> for statistics or factual declarations, and <strong className="text-amber-700 font-medium font-mono">unformatted, raw references</strong> (like plain URLs or messy inline brackets). It then reconstructs perfect academic citations in standard <strong className="font-medium text-slate-800">APA, MLA, and Chicago manual formatting styles</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                    Text Document to Audit
                  </span>
                  <button 
                    onClick={handleLoadSample}
                    className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-500 font-mono"
                  >
                    Load Sample Document
                  </button>
                </div>
                <textarea 
                  value={textToScan}
                  onChange={(e) => setTextToScan(e.target.value)}
                  placeholder="Paste your research draft, essay, or blog post containing factual statements, historical claims, or unformatted reference URLs here..."
                  className="w-full h-64 p-4 text-sm font-sans border border-slate-250 rounded focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/10"
                  id="citation-assistant-textarea"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleScan}
                  disabled={!textToScan.trim()}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-sm flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                  id="start-citation-scan-btn"
                >
                  <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                  <span>Execute Citation Audit</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Progress State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4" id="citation-assistant-loading">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
              <div className="text-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono">
                  Reviewing Source Integrity
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                  Scanning for statistical assertions, evaluating sentence credentials, checking bibliography structures, and generating standard APA/MLA/Chicago formulas...
                </p>
              </div>
            </div>
          )}

          {/* Findings Display Layout */}
          {findings && (
            <div className="space-y-6 animate-fade-in" id="citation-assistant-findings-view">
              {/* Scan Summary Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 pb-4">
                <div>
                  <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">Audit Complete</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono mt-1">
                    Detected {findings.length} Source Integrity Issues
                  </h4>
                </div>
                <div className="flex space-x-3 mt-3 sm:mt-0">
                  <button 
                    onClick={() => {
                      setFindings(null);
                      setError(null);
                    }}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                  >
                    Re-Scan Draft
                  </button>
                </div>
              </div>

              {findings.length === 0 ? (
                <div className="bg-emerald-50/50 border border-emerald-200 text-emerald-950 p-8 rounded text-center space-y-2" id="citation-assistant-clean-state">
                  <div className="inline-block p-2 bg-emerald-500/10 rounded-full text-emerald-600">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-800">
                    Pristine Citation Health
                  </h4>
                  <p className="text-xs text-emerald-600 max-w-md mx-auto">
                    No missing citations or raw, unformatted references were detected in this document. All metrics meet professional publication criteria!
                  </p>
                </div>
              ) : (
                <div className="space-y-5" id="findings-cards-container">
                  {findings.map((item, idx) => {
                    const activeStyle = activeStyles[idx] || "APA";
                    const isMissing = item.type === "missing_source";
                    const styleText = 
                      activeStyle === "APA" ? item.suggestedAPA :
                      activeStyle === "MLA" ? item.suggestedMLA :
                      item.suggestedChicago;

                    return (
                      <div 
                        key={idx}
                        className="bg-slate-50/45 border border-slate-200 rounded p-4 flex flex-col lg:flex-row lg:items-start justify-between gap-5 transition-all hover:bg-slate-50"
                        id={`finding-card-${idx}`}
                      >
                        {/* Issue description column */}
                        <div className="flex-1 space-y-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                              Flag #{idx + 1}
                            </span>
                            <span className={`text-[8px] font-bold font-mono tracking-wider px-1.5 py-0.5 rounded uppercase border ${
                              isMissing 
                                ? "bg-rose-50 text-rose-700 border-rose-200" 
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {isMissing ? "Missing Citation Source" : "Unformatted Reference"}
                            </span>
                          </div>

                          <div className="bg-white border border-slate-150 p-3 rounded-sm italic text-xs text-slate-700 font-sans leading-relaxed">
                            "{item.claimOrReference}"
                          </div>

                          <div className="text-xs text-slate-500">
                            <strong className="text-slate-700 uppercase font-mono text-[9px] tracking-wider block mb-0.5">Detected Issue:</strong>
                            <p className="leading-relaxed">{item.detectedIssue}</p>
                          </div>
                        </div>

                        {/* Formatting column */}
                        <div className="w-full lg:w-[360px] bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-3 flex-shrink-0">
                          {/* Tabs */}
                          <div className="flex border-b border-slate-100 pb-1.5 justify-between items-center">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                              Bibliography Form
                            </span>
                            <div className="flex space-x-1.5">
                              {(["APA", "MLA", "CHICAGO"] as const).map((style) => (
                                <button
                                  key={style}
                                  onClick={() => selectStyle(idx, style)}
                                  className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded transition-all cursor-pointer uppercase ${
                                    activeStyle === style 
                                      ? "bg-indigo-600 text-white shadow-3xs" 
                                      : "bg-slate-50 text-slate-400 hover:text-slate-700"
                                  }`}
                                >
                                  {style}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Suggested Citations text */}
                          <div className="bg-slate-50/50 border border-slate-150 p-3 rounded text-[11px] font-serif text-slate-700 leading-relaxed min-h-[55px] break-words">
                            {styleText}
                          </div>

                          {/* Action panel */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleCopy(styleText, `${idx}-${activeStyle}`)}
                              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] uppercase tracking-wider rounded transition-colors flex items-center space-x-1 cursor-pointer"
                              title={`Copy ${activeStyle} Citation`}
                            >
                              {copiedKey === `${idx}-${activeStyle}` ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy {activeStyle}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-150" id="citation-assistant-modal-footer">
          <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Need Google Grounding? Use the "Ref Finder" tab in Sidebar.</span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
            id="close-citation-assistant-footer-btn"
          >
            Close Assistant
          </button>
        </div>
      </div>
    </div>
  );
}
