/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Sparkles, Loader2, AlertCircle, Languages, Globe } from "lucide-react";

interface TranslateResult {
  translatedText: string;
  linguisticNotes: string[];
  alternativePhrases: string[];
}

export default function AITranslator() {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("Spanish");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languages = [
    { name: "Spanish", native: "Español" },
    { name: "French", native: "Français" },
    { name: "German", native: "Deutsch" },
    { name: "Chinese", native: "中文" },
    { name: "Japanese", native: "日本語" },
    { name: "Portuguese", native: "Português" },
    { name: "Hindi", native: "हिन्दी" },
    { name: "Arabic", native: "العربية" },
    { name: "Italian", native: "Italiano" },
  ];

  const toneOptions = [
    { id: "professional", label: "Formal / Diplomatic" },
    { id: "casual", label: "Idiomatic / Casual" },
    { id: "academic", label: "Literary / Academic" },
    { id: "direct", label: "Literal / Direct" },
  ];

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang, tone }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to translate text");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during translation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setText(
      "Our organization aims to establish a highly collaborative relationship with your department. We look forward to achieving great results together in the near future."
    );
    setError(null);
    setResult(null);
  };

  return (
    <div className="space-y-6" id="translator-root">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm" id="translator-header">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-teal-600 animate-pulse" />
          <span>Multilingual Contextual Translator</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
          Native fluency in every word. Rather than word-for-word direct conversion, Gemini adjusts regional idioms, syntax rules, and formal vocabulary levels for flawless localization.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded text-xs flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <p className="font-sans">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="translator-grid">
        {/* Left input & config */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4 flex flex-col justify-between" id="translator-input-panel">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                Source Document
              </span>
              <button
                onClick={handleLoadSample}
                className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 font-mono"
              >
                Load Sample Text
              </button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text in English (or any source language) to translate..."
              className="w-full h-44 border border-slate-200 rounded p-4 text-sm font-sans focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/10"
              id="translator-text-input"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-2">
                  Target Language
                </span>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs font-sans focus:outline-hidden focus:border-teal-500 bg-white"
                  id="target-lang-select"
                >
                  {languages.map((lang) => (
                    <option key={lang.name} value={lang.name}>
                      {lang.name} ({lang.native})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block mb-2">
                  Tone Adaptation
                </span>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs font-sans focus:outline-hidden focus:border-teal-500 bg-white"
                  id="translation-tone-select"
                >
                  {toneOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            id="translate-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Translating Contextually...</span>
              </>
            ) : (
              <>
                <Languages className="h-3.5 w-3.5" />
                <span>Translate and Localize</span>
              </>
            )}
          </button>
        </div>

        {/* Right output */}
        <div className="bg-slate-950 border border-slate-900 rounded p-5 text-white shadow-lg flex flex-col justify-between" id="translator-output-panel">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="h-10 w-10 text-teal-400 animate-spin mb-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-mono">
                Running Cross-Lingual Synthesizer
              </h3>
              <p className="text-xs text-slate-500 max-w-xs text-center mt-2 leading-relaxed font-sans">
                Gemini is adjusting word orders, mapping idioms, applying grammar models, and optimizing formal levels...
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block">
                    Fluent Output
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mt-1 font-mono">
                    Translated into {targetLang}
                  </h3>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-sm border border-slate-800 transition-colors flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  id="copy-translated-btn"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Translation"}</span>
                </button>
              </div>

              {/* Translation Text Container */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                  Native Text Translation
                </span>
                <div className="bg-slate-1000 border border-slate-900 rounded p-4 h-44 overflow-y-auto text-sm font-sans text-slate-200 leading-relaxed select-text cursor-text">
                  {result.translatedText}
                </div>
              </div>

              {/* Translation Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-3">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                    Linguistic & Dialect Notes
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {result.linguisticNotes.map((note, idx) => (
                      <p key={idx} className="text-[10px] text-slate-300 leading-relaxed font-sans">
                        <span className="text-teal-400 font-bold">•</span> {note}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold tracking-wider">
                    Regional Synonyms
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {result.alternativePhrases.map((phrase, idx) => (
                      <p key={idx} className="text-[10px] text-slate-400 leading-relaxed font-sans italic">
                        "{phrase}"
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500" id="translator-empty-placeholder">
              <Globe className="h-10 w-10 text-slate-800 mb-3" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                Multilingual Live Board
              </h3>
              <p className="text-xs text-slate-600 max-w-[240px] text-center mt-2 font-sans leading-relaxed">
                Choose target language and tone adaptation levels to translate text with native semantic nuance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
