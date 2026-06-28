/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Sparkles, Loader2, AlertCircle, PenTool, Clipboard } from "lucide-react";

interface AssistantResult {
  generatedText: string;
  alternatives: string[];
  outline: string[];
}

export default function WritingAssistant() {
  const [text, setText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [mode, setMode] = useState("continue");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modeOptions = [
    { id: "continue", label: "Flow Continue", desc: "Predicts and outputs the next paragraph seamlessly" },
    { id: "expand", label: "Argument Expander", desc: "Adds rhetorical strength and deep detail to assertions" },
    { id: "outline", label: "Bento Outliner", desc: "Generates beautiful structural layout blocks" },
    { id: "rebuttal", label: "Academic Rebuttal", desc: "Constructs balanced counterarguments for peers" },
  ];

  const handleWrite = async () => {
    if (!instruction.trim() && !text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/write-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, instruction, mode }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate writing assistance");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred with the writing assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setText(
      "While digital transition streamlines administrative routines in modern public hospitals, many practitioners claim it takes too much time away from direct patient interactions."
    );
    setInstruction("Analyze clinical burnout due to screen-time load and write the next logical paragraph.");
    setError(null);
    setResult(null);
  };

  return (
    <div className="space-y-6" id="writing-assistant-root">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm" id="writing-assistant-header">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-teal-600 animate-pulse" />
          <span>Intellectual AI Writing Partner</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
          Collaborate with an elite co-author. Seamlessly expand complex arguments, predict next paragraphs, sketch pristine academic structures, and review critical peer objections.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded text-xs flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <p className="font-sans">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="writing-assistant-grid">
        {/* Left input panel */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4 flex flex-col justify-between" id="writing-input-panel">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                Current Draft Copy (Optional)
              </span>
              <button
                onClick={handleLoadSample}
                className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 font-mono"
              >
                Load Creative Workspace Prompt
              </button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your current paragraphs or notes here (if any) to provide immediate context..."
              className="w-full h-32 border border-slate-200 rounded p-4 text-sm font-sans focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/10"
              id="writing-text-input"
            />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-2">
                What would you like the assistant to write?
              </span>
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g. 'Synthesize clinical workloads' or 'Write a bold introduction'..."
                className="w-full border border-slate-200 rounded p-3 text-xs font-sans focus:outline-hidden focus:border-teal-500 bg-slate-50/15"
                id="writing-instruction-input"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-2">
                Co-Authoring Mode
              </span>
              <div className="grid grid-cols-2 gap-2">
                {modeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setMode(opt.id)}
                    className={`text-left p-2 rounded border transition-all duration-200 cursor-pointer ${
                      mode === opt.id
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
          </div>

          <button
            onClick={handleWrite}
            disabled={loading || (!instruction.trim() && !text.trim())}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            id="writing-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Co-Authoring New Copy...</span>
              </>
            ) : (
              <>
                <PenTool className="h-3.5 w-3.5" />
                <span>Collaborate & Generate</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output panel */}
        <div className="bg-slate-950 border border-slate-900 rounded p-5 text-white shadow-lg flex flex-col justify-between" id="writing-output-panel">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="h-10 w-10 text-teal-400 animate-spin mb-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">
                Consulting Writing Models
              </h3>
              <p className="text-xs text-slate-500 max-w-xs text-center mt-2 leading-relaxed font-sans">
                Gemini is absorbing context parameters, structuring rhetorical pathways, drafting flawless prose, and formulating chapter architectures...
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block">
                    Copy Generated
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mt-1 font-mono">
                    Smart Writing Stream
                  </h3>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-sm border border-slate-800 transition-colors flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  id="copy-generated-btn"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Generated"}</span>
                </button>
              </div>

              {/* Main Text block */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                  Primary Draft Suggestion
                </span>
                <div className="bg-slate-1000 border border-slate-900 rounded p-4 h-48 overflow-y-auto text-xs font-sans text-slate-200 leading-relaxed select-text cursor-text">
                  {result.generatedText}
                </div>
              </div>

              {/* Alternatives & Outlines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-3">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                    Alternative Sentences
                  </span>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {result.alternatives.map((alt, idx) => (
                      <p key={idx} className="text-[10px] text-slate-300 leading-relaxed font-sans italic">
                        "{alt}"
                      </p>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                    Structural Blueprint
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {result.outline.map((point, idx) => (
                      <div key={idx} className="flex items-start space-x-1 text-[10px] text-slate-400">
                        <span className="text-teal-400 font-bold">•</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500" id="writing-empty-placeholder">
              <PenTool className="h-10 w-10 text-slate-800 mb-3" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                Writing Workspace Output
              </h3>
              <p className="text-xs text-slate-600 max-w-[240px] text-center mt-2 font-sans leading-relaxed">
                Provide structural ideas, choose generation mode, and see deep paragraphs expand live.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
