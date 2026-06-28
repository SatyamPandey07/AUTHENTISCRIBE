/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HumanizeResult } from "../types";
import { 
  Sparkles, Sliders, ArrowRight, Loader2, Copy, Check, Download, 
  HelpCircle, Info, ThumbsUp, AlertCircle, FileText
} from "lucide-react";

interface HumanizerWorkspaceProps {
  onHumanize: (text: string, style: string, intensity: string) => Promise<void>;
  result: HumanizeResult | null;
  isLoading: boolean;
}

export default function HumanizerWorkspace({ onHumanize, result, isLoading }: HumanizerWorkspaceProps) {
  const [text, setText] = useState("");
  const [style, setStyle] = useState("academic");
  const [intensity, setIntensity] = useState("medium");
  const [copied, setCopied] = useState(false);

  const styleOptions = [
    { id: "academic", label: "Academic & Scholarly", desc: "Rigorous research standard, refined vocabulary, balanced tone." },
    { id: "business", label: "Corporate & Professional", desc: "Clear, active voice, executive communication style." },
    { id: "casual", label: "Casual & Engaging", desc: "Conversational, friendly, standard idioms, flowing structures." },
    { id: "narrative", label: "Narrative & Creative", desc: "Expressive prose, varied syntax rhythm, expressive style." }
  ];

  const intensityOptions = [
    { id: "low", label: "Low Swapping", desc: "Performs synonym replacements and simple active voice updates." },
    { id: "medium", label: "Balanced Flow", desc: "Medium restructuring, alters sentence length variation (burstiness)." },
    { id: "high", label: "Deep Rewrite", desc: "Full cognitive restructure, introduces organic transitions and idioms." }
  ];

  const handleTriggerHumanize = () => {
    if (!text.trim()) return;
    onHumanize(text, style, intensity);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.humanizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const element = document.createElement("a");
    const file = new Blob([result.humanizedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `humanized_${result.style}_${result.intensity}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleLoadSample = () => {
    const samples: { [key: string]: string } = {
      academic: "This research paper intends to explore the utilization of machine learning models in modern educational institutes. Consequently, substantial quantities of data are gathered daily. It is critical to establish robust security mechanisms to protect sensitive informational assets.",
      business: "Pursuant to our organizational goals, we have conducted an extensive evaluation of our sales funnels. It is imperative that we optimize these funnels with immediate effect. Moving forward, our marketing teams will coordinate closely to maximize overall revenue conversions.",
      casual: "I am writing this blog post because I want to talk about how artificial intelligence is changing the way we write. I think it is really cool, but some people are worried about it. Honestly, there is nothing to fear, as long as we learn to use it productively."
    };
    setText(samples[style] || samples.academic);
  };

  return (
    <div className="space-y-6" id="humanizer-panel-root">
      
      {/* 1. Introductory Info Card */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="humanizer-intro-card">
        <div className="space-y-1 max-w-3xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span>AI-to-Human Document Converter</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            AI text sounds overly formal, uniform, and clinical. The Humanizer completely restructures sentence sizing, introduces natural vocabulary, active phrasing, and linguistic burstiness to make your documents pass AI checks and sound like authentic human notes.
          </p>
        </div>
        <button
          onClick={handleLoadSample}
          className="px-3.5 py-1.5 border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer whitespace-nowrap"
          id="load-sample-btn"
        >
          Load Synthetic Sample
        </button>
      </div>

      {/* 2. Side-By-Side Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="workspace-dual-grid">
        
        {/* Left Column: Original Text Input & Settings */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-5 flex flex-col justify-between" id="humanize-input-col">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono" htmlFor="raw-machine-content">
                Machine-Generated Content
              </label>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                {text.length} chars • {text.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            
            <textarea
              id="raw-machine-content"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste AI-generated essays, paragraphs, emails, or notes here..."
              className="w-full h-72 border border-slate-200 rounded p-4 text-sm font-sans focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/20"
            />

            {/* Styling/Tone Selector */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-2 flex items-center space-x-1">
                <Sliders className="h-3 w-3 text-slate-400" />
                <span>Target Human Style</span>
              </span>
              <div className="grid grid-cols-2 gap-2" id="style-options-group">
                {styleOptions.map((opt) => (
                  <button
                    key={opt.id}
                    id={`style-btn-${opt.id}`}
                    onClick={() => setStyle(opt.id)}
                    className={`text-left p-3 rounded border transition-all duration-200 cursor-pointer ${
                      style === opt.id
                        ? "border-slate-900 bg-slate-900/5 text-slate-950"
                        : "border-slate-150 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span className="text-xs font-bold block text-slate-800">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 leading-normal block mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Level Settings */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-2">
                Humanization Intensity
              </span>
              <div className="grid grid-cols-3 gap-2" id="intensity-options-group">
                {intensityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    id={`intensity-btn-${opt.id}`}
                    onClick={() => setIntensity(opt.id)}
                    className={`text-left p-2.5 border rounded transition-all duration-200 cursor-pointer ${
                      intensity === opt.id
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                        : "border-slate-150 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span className="text-xs font-bold block capitalize text-slate-850">{opt.label}</span>
                    <span className="text-[9px] text-slate-400 leading-tight block mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleTriggerHumanize}
              disabled={isLoading || !text.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              id="humanize-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Converting Prose to Human Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run Authentic Humanizer</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output / Humanized Result Panel */}
        <div className="bg-slate-950 text-white border border-slate-900 rounded p-5 shadow-lg flex flex-col justify-between" id="humanize-output-col">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400" id="humanizer-loading-placeholder">
              <Loader2 className="h-10 w-10 text-indigo-400 animate-spin mb-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">
                Rewriting Document Structure
              </h3>
              <p className="text-xs text-slate-500 max-w-sm text-center mt-2 leading-relaxed font-sans">
                Gemini is adjusting vocabulary density, adding syntax burstiness, softening clinical transition words, and ensuring high perplexity scores...
              </p>
            </div>
          ) : result ? (
            <div className="space-y-5" id="humanizer-result-wrapper">
              
              {/* Output Header Controls */}
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block">
                    Target Complete
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mt-1 font-mono">
                    {result.style} tone • {result.intensity} rewriting
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-sm border border-slate-800 transition-colors flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    title="Copy to clipboard"
                    id="copy-humanized-btn"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-sm border border-slate-800 transition-colors flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    title="Download as .txt"
                    id="download-humanized-btn"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export .TXT</span>
                  </button>
                </div>
              </div>

              {/* The Result Text Container */}
              <div 
                className="bg-slate-1000 border border-slate-900 rounded p-4 h-60 overflow-y-auto text-sm font-sans text-slate-200 leading-relaxed select-text cursor-text"
                id="humanized-text-editor"
              >
                {result.humanizedText}
              </div>

              {/* Statistical Metrics Comparison Widget */}
              <div className="border border-slate-900 bg-slate-900/40 rounded p-4" id="metrics-comparison-box">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-3 font-bold tracking-wider">
                  Originality Delta Audit
                </span>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Predicted AI Match</span>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <span className="text-xs text-rose-400 font-bold line-through">{result.metricsBefore.aiScore}%</span>
                      <span className="text-sm text-emerald-400 font-extrabold">{result.metricsAfter.aiScore}%</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Reading Ease</span>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <span className="text-xs text-slate-500 font-bold">{result.metricsBefore.readabilityScore}</span>
                      <span className="text-sm text-emerald-400 font-extrabold">{result.metricsAfter.readabilityScore}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Grade Level Target</span>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <span className="text-[10px] text-slate-500 truncate max-w-[60px]">{result.metricsBefore.gradeLevel}</span>
                      <span className="text-[11px] text-emerald-400 font-semibold truncate max-w-[65px]">{result.metricsAfter.gradeLevel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adjustments Made bullets */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                  Linguistic Swaps & Structural Enhancements
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="adjustment-notes-list">
                  {result.improvementNotes && result.improvementNotes.map((note, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-slate-400">
                      <ThumbsUp className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{note}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500" id="humanizer-empty-placeholder">
              <FileText className="h-10 w-10 text-slate-700 mb-3 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                Humanized Output Board
              </h3>
              <p className="text-xs text-slate-600 max-w-[240px] text-center mt-2 font-sans">
                Configure your target parameters and trigger the rewriter to produce authentic humanized content.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
