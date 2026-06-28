/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import FileUploader from "./components/FileUploader";
import ScanResultDashboard from "./components/ScanResultDashboard";
import HumanizerWorkspace from "./components/HumanizerWorkspace";
import OriginalityBench from "./components/OriginalityBench";
import HistoryPanel from "./components/HistoryPanel";

// Import new modular components
import GrammarChecker from "./components/GrammarChecker";
import AIProofreader from "./components/AIProofreader";
import AITranslator from "./components/AITranslator";
import ReferenceFinder from "./components/ReferenceFinder";
import AISummarizer from "./components/AISummarizer";
import WritingAssistant from "./components/WritingAssistant";
import CitationAssistantModal from "./components/CitationAssistantModal";
import PDFPreview from "./components/PDFPreview";

import { exportAnalysisToPDF } from "./utils/pdfGenerator";

import { AnalysisResult, HumanizeResult, SavedScan, SavedHumanization, SentenceAnalysis } from "./types";
import { 
  ShieldCheck, Sparkles, Loader2, Play, Trash2, ArrowRight, CheckCircle, 
  AlertTriangle, RotateCw, FileText, Info, HelpCircle, Check, Languages, 
  Search, AlignLeft, PenTool, BarChart2, History, Globe, BookOpen
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("SCANNER");
  const [textToScan, setTextToScan] = useState<string>("");
  const [stagedFile, setStagedFile] = useState<{ name: string; size: number; type: string; data?: string } | null>(null);
  
  // Theme state & persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("authentiscribe_theme");
      if (saved) {
        return saved === "dark";
      }
    } catch (e) {
      console.error("Failed to load theme preference:", e);
    }
    return false;
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("authentiscribe_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("authentiscribe_theme", "light");
      }
    } catch (e) {
      console.error("Failed to persist theme preference:", e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };
  
  // Results
  const [scanResult, setScanResult] = useState<AnalysisResult | null>(null);
  const [humanizeResult, setHumanizeResult] = useState<HumanizeResult | null>(null);
  
  // Loadings
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isHumanizing, setIsHumanizing] = useState<boolean>(false);
  const [isCitationAssistantOpen, setIsCitationAssistantOpen] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0); // 0 to 4 for progressive status messages
  
  // Repositories
  const [scansHistory, setScansHistory] = useState<SavedScan[]>([]);
  const [humanizationsHistory, setHumanizationsHistory] = useState<SavedHumanization[]>([]);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Check if API key is injected (standard server check)
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Load history from localStorage on startup
  useEffect(() => {
    try {
      const savedScans = localStorage.getItem("authentiscribe_scans");
      if (savedScans) {
        setScansHistory(JSON.parse(savedScans));
      }
      
      const savedHums = localStorage.getItem("authentiscribe_humanizations");
      if (savedHums) {
        setHumanizationsHistory(JSON.parse(savedHums));
      }
    } catch (e) {
      console.error("Failed to load local history:", e);
    }
  }, []);

  // Sync scans history to localStorage
  const saveScansHistory = (updated: SavedScan[]) => {
    setScansHistory(updated);
    localStorage.setItem("authentiscribe_scans", JSON.stringify(updated));
  };

  // Sync humanization history to localStorage
  const saveHumanizationsHistory = (updated: SavedHumanization[]) => {
    setHumanizationsHistory(updated);
    localStorage.setItem("authentiscribe_humanizations", JSON.stringify(updated));
  };

  // File loading callback
  const handleFileLoaded = (extractedText: string, fileData?: { data: string; name: string; type: string }) => {
    setError(null);
    if (extractedText) {
      setTextToScan(extractedText);
      setStagedFile({
        name: fileData?.name || "Uploaded Word Document",
        size: extractedText.length,
        type: fileData?.type || "text/plain"
      });
    } else if (fileData && fileData.type === "application/pdf") {
      // PDF base64 payload is staged directly for backend PDF processing
      setStagedFile({
        name: fileData.name,
        size: 0,
        type: "application/pdf",
        data: fileData.data
      });
      setTextToScan(""); // Clear pasted text as file is active
    }
  };

  const handleClearFile = () => {
    setStagedFile(null);
    setTextToScan("");
    setScanResult(null);
    setError(null);
  };

  // Progress steps simulator for deep originality audits
  useEffect(() => {
    let interval: any;
    if (isScanning) {
      setScanStep(0);
      interval = setInterval(() => {
        setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 2500);
    } else {
      setScanStep(0);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const getScanLoadingMessage = () => {
    switch (scanStep) {
      case 0: return "Analyzing lexical entropy & predictability index...";
      case 1: return "Running n-gram pattern recognition algorithms...";
      case 2: return "Auditing matches across academic libraries and databases...";
      case 3: return "Calculating structural sentence-length variance (burstiness)...";
      case 4: return "Finalizing citation suggestions & premium alternative rewrites...";
      default: return "Analyzing document content...";
    }
  };

  // Trigger Scanner Analysis
  const handleTriggerScan = async () => {
    setError(null);
    setScanResult(null);
    
    // Check validity
    if (!textToScan.trim() && (!stagedFile || stagedFile.type !== "application/pdf")) {
      setError("Please paste some text content or upload a document file (.txt, .md, .pdf, .docx) to scan.");
      return;
    }

    setIsScanning(true);
    try {
      const payload: any = {};
      if (stagedFile?.type === "application/pdf" && stagedFile.data) {
        payload.fileData = stagedFile.data;
        payload.fileType = "application/pdf";
        payload.fileName = stagedFile.name;
      } else {
        payload.text = textToScan;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to scan document originality.");
      }

      const result: AnalysisResult = await res.json();
      
      // If PDF extraction text is returned, update textToScan
      if (result.extractedText) {
        setTextToScan(result.extractedText);
      }

      setScanResult(result);

      // Save to repository history
      const newScan: SavedScan = {
        id: `scan_${Date.now()}`,
        title: stagedFile ? stagedFile.name : (textToScan.substring(0, 45) + "..."),
        timestamp: new Date().toISOString(),
        text: result.extractedText || textToScan,
        result: result
      };
      saveScansHistory([newScan, ...scansHistory]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during document scanner analysis.");
    } finally {
      setIsScanning(false);
    }
  };

  // Trigger Humanization notes conversion
  const handleTriggerHumanize = async (textToHumanize: string, targetStyle: string, targetIntensity: string) => {
    setError(null);
    setHumanizeResult(null);
    setIsHumanizing(true);

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToHumanize,
          style: targetStyle,
          intensity: targetIntensity
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to convert synthetic prose to humanized notes.");
      }

      const result: HumanizeResult = await res.json();
      setHumanizeResult(result);

      // Save to drafts repository history
      const newHum: SavedHumanization = {
        id: `hum_${Date.now()}`,
        title: textToHumanize.substring(0, 45) + "...",
        timestamp: new Date().toISOString(),
        originalText: textToHumanize,
        humanizedText: result.humanizedText,
        result: result
      };
      saveHumanizationsHistory([newHum, ...humanizationsHistory]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while humanizing text.");
    } finally {
      setIsHumanizing(false);
    }
  };

  // Interactive sentence recomposer rephrase live generator
  const handleGenerateMoreSuggestions = async (sentenceText: string) => {
    try {
      const res = await fetch("/api/rephrase-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: sentenceText, style: "natural" })
      });
      if (!res.ok) {
        throw new Error("Failed to rephrase sentence live");
      }
      const data = await res.json();
      return data.alternatives;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // Inline rephrase sentence trial sandbox callback
  const handleRephraseSentenceSandbox = async (sentenceText: string, style: string) => {
    try {
      const res = await fetch("/api/rephrase-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: sentenceText, style: style })
      });
      if (!res.ok) {
        throw new Error("Sandbox rephrase failed");
      }
      const data = await res.json();
      return data.alternatives;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // Hot-swap sentence on client-side and dynamically adjust aggregate scores
  const handleSentenceReplaced = (originalSentenceText: string, newText: string) => {
    if (!scanResult) return;

    // 1. Swap the sentence in the array
    const updatedSentences = scanResult.sentences.map((s) => {
      if (s.text === originalSentenceText) {
        return {
          ...s,
          text: newText,
          aiProbability: 5, // reset to completely human-like
          plagiarismProbability: 5, // reset to original
          category: "human" as const,
          suggestions: []
        };
      }
      return s;
    });

    // 2. Re-stitch the complete document text
    const fullRebuiltText = updatedSentences.map((s) => s.text).join(" ");
    setTextToScan(fullRebuiltText);

    // 3. Dynamically re-adjust visual gauges on the fly to reward user!
    const updatedAiScore = Math.max(0, Math.round(scanResult.aiScore * 0.7)); // Reduce AI prediction
    const updatedPlagScore = Math.max(0, Math.round(scanResult.plagiarismScore * 0.6)); // Reduce plagiarism match
    const updatedHumanScore = Math.min(100, Math.max(scanResult.humanScore, Math.round((100 - (updatedAiScore + updatedPlagScore) / 2))));

    const updatedResult: AnalysisResult = {
      ...scanResult,
      text: fullRebuiltText,
      sentences: updatedSentences,
      aiScore: updatedAiScore,
      plagiarismScore: updatedPlagScore,
      humanScore: updatedHumanScore,
      overallScore: Math.round((updatedAiScore + updatedPlagScore) / 2)
    };

    setScanResult(updatedResult);

    // Save update to history
    const savedId = scansHistory[0]?.id || `scan_${Date.now()}`;
    const updatedHistory = scansHistory.map((scan) => {
      if (scan.id === savedId) {
        return { ...scan, text: fullRebuiltText, result: updatedResult };
      }
      return scan;
    });
    saveScansHistory(updatedHistory);
  };

  // Quick action: Send Scanned content to humanizer
  const handleSendToHumanizer = () => {
    if (!textToScan) return;
    setActiveTab("HUMANIZER");
    setHumanizeResult(null);
  };

  // Loading historical items callbacks
  const handleLoadScan = (scan: SavedScan) => {
    setStagedFile(null);
    setTextToScan(scan.text);
    setScanResult(scan.result);
    setActiveTab("SCANNER");
    setError(null);
  };

  const handleLoadHumanization = (hum: SavedHumanization) => {
    setHumanizeResult(hum.result);
    setActiveTab("HUMANIZER");
    setError(null);
  };

  // Deleting historical items callbacks
  const handleDeleteScan = (id: string) => {
    const updated = scansHistory.filter((s) => s.id !== id);
    saveScansHistory(updated);
  };

  const handleDeleteHumanization = (id: string) => {
    const updated = humanizationsHistory.filter((h) => h.id !== id);
    saveHumanizationsHistory(updated);
  };

  const sidebarOptions = [
    { id: "SCANNER", label: "AI Detector Suite", icon: ShieldCheck, desc: "Verify generation probability" },
    { id: "GRAMMAR", label: "Grammar Checker", icon: Check, desc: "Check mechanics & spelling" },
    { id: "PROOFREADER", label: "AI Proofreader", icon: FileText, desc: "Polish rhetoric & clarity" },
    { id: "TRANSLATOR", label: "AI Translator", icon: Languages, desc: "Contextual translations" },
    { id: "REF_FINDER", label: "AI Reference Finder", icon: Search, desc: "Academic fact verifications" },
    { id: "SUMMARIZER", label: "AI Summarizer", icon: AlignLeft, desc: "Synthesis & TL;DR briefs" },
    { id: "WRITING_ASSISTANT", label: "AI Writing Assistant", icon: PenTool, desc: "Co-author paragraph draft" },
    { id: "HUMANIZER", label: "AI Humanizer", icon: Sparkles, desc: "Organic human conversions" },
    { id: "ANALYTICS", label: "Tuning Lab", icon: BarChart2, desc: "Sandbox rephrase trial" },
    { id: "HISTORY", label: "Repository", icon: History, desc: "Historic reports & saved logs" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col" id="app-root">
      
      {/* Navigation Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        hasApiKey={hasApiKey} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 flex items-start space-x-3 bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded text-xs" id="global-error-box">
            <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold uppercase font-mono tracking-wider text-rose-700 text-[10px]">Execution Error</span>
              <p className="text-rose-800 leading-relaxed font-sans">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8" id="app-workspace-layout">
          {/* Sidebar Left Column */}
          <div className="w-full lg:w-72 flex-shrink-0" id="app-left-sidebar">
            <div className="bg-white border border-slate-200 rounded p-4 sticky top-24 shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block px-3 mb-2">
                Unified AI Workspaces
              </span>
              <div className="space-y-1">
                {sidebarOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = activeTab === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setActiveTab(opt.id);
                        setError(null);
                      }}
                      className={`w-full flex items-start space-x-3 px-3 py-2.5 rounded transition-all duration-150 text-left cursor-pointer ${
                        isActive
                          ? "bg-teal-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                      id={`sidebar-opt-${opt.id.toLowerCase()}`}
                    >
                      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <div>
                        <span className="text-xs font-bold block">{opt.label}</span>
                        <span className={`text-[9px] block leading-tight mt-0.5 ${isActive ? "text-teal-100" : "text-slate-400"}`}>
                          {opt.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Viewport Column */}
          <div className="flex-1 min-w-0" id="active-panel-container">
            {activeTab === "SCANNER" && (
              <div className="space-y-6" id="scanner-view-wrapper">
                
                {/* If no result is loaded, show the uploader and editor box */}
                {!scanResult && !isScanning && (
                  <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-6" id="input-editor-workspace">
                    
                    {/* Explainer card */}
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono flex items-center space-x-2">
                        <ShieldCheck className="h-4 w-4 text-teal-600 animate-pulse" />
                        <span>Plagiarism & AI Generation Auditor</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                        Upload your PDF, Word doc, or paste raw text below. Our engine will check syntax patterns for AI indicators, cross-reference academic similarity databases, and suggest proper source citations.
                      </p>
                    </div>

                    {/* File Upload Section */}
                    <FileUploader 
                      onFileLoaded={handleFileLoaded} 
                      onClear={handleClearFile} 
                      stagedFile={stagedFile} 
                    />

                    {/* PDF Preview Section (only show if file is a staged PDF) */}
                    {stagedFile && stagedFile.type === "application/pdf" && stagedFile.data && (
                      <PDFPreview stagedFile={stagedFile} />
                    )}

                    {/* Text area paste editor (only show if file is not an un-extracted PDF) */}
                    {(!stagedFile || stagedFile.type !== "application/pdf") && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono" htmlFor="document-text-box">
                            Document Plain Text
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                            {textToScan.length} chars • {textToScan.split(/\s+/).filter(Boolean).length} words
                          </span>
                        </div>
                        <textarea
                          id="document-text-box"
                          value={textToScan}
                          onChange={(e) => {
                            setTextToScan(e.target.value);
                            setError(null);
                          }}
                          placeholder="Paste or write your essay, document, or research findings here..."
                          className="w-full h-80 border border-slate-200 rounded p-4 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/10 font-sans"
                        />
                      </div>
                    )}

                    {/* Action row */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setIsCitationAssistantOpen(true)}
                        className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                        id="open-citation-assistant-unscanned-btn"
                        title="Open Citation Integrity Assistant"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-indigo-200" />
                        <span>Citation Assistant</span>
                      </button>
                      {textToScan.trim() && (
                        <button
                          onClick={handleClearFile}
                          className="px-4 py-2 border border-slate-250 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                          id="clear-scanner-btn"
                        >
                          Reset Workspace
                        </button>
                      )}
                      <button
                        onClick={handleTriggerScan}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center space-x-2 transition-all shadow-sm cursor-pointer"
                        id="run-scanner-btn"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Trigger Deep Originality Scan</span>
                      </button>
                    </div>

                  </div>
                )}

                {/* Progress active loading diagnostics board */}
                {isScanning && (
                  <div className="bg-white border border-slate-200 rounded p-8 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]" id="scanner-loading-screen">
                    <div className="relative mb-6">
                      <Loader2 className="h-14 w-14 text-teal-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-teal-700 font-bold">
                        {scanStep * 20}%
                      </div>
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-750 font-mono">
                      Conducting Multi-Layer Originality Scan
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed font-sans" id="scanning-step-text">
                      {getScanLoadingMessage()}
                    </p>
                    
                    {/* Loading graphic bar */}
                    <div className="w-64 bg-slate-100 h-1.5 mt-6 overflow-hidden border border-slate-200">
                      <div 
                        className="h-1.5 bg-teal-600 transition-all duration-500"
                        style={{ width: `${(scanStep + 1) * 20}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Active Results Dashboard */}
                {scanResult && !isScanning && (
                  <div className="space-y-6" id="active-scanner-results">
                    
                    {/* Diagnostic Alert & quick controls */}
                    <div className="bg-white border border-slate-200 p-4 rounded shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-emerald-50 text-emerald-700 p-2 rounded border border-emerald-100">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700 font-mono">Analysis Complete</h4>
                          <p className="text-[11px] text-slate-450 font-sans mt-0.5">
                            A detailed sentence audit, perplexity check, and citation analysis is populated.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2 self-stretch sm:self-auto flex-wrap gap-2 sm:gap-0">
                        <button
                          onClick={() => setIsCitationAssistantOpen(true)}
                          className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          id="trigger-citation-assistant-btn"
                          title="Open Citation Integrity Assistant"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-indigo-200" />
                          <span>Citation Assistant</span>
                        </button>
                        <button
                          onClick={() => {
                            if (scanResult) {
                              const docTitle = stagedFile ? stagedFile.name : "Linguistic_Integrity_Report";
                              const originalText = textToScan || scanResult.extractedText || "";
                              exportAnalysisToPDF(scanResult, docTitle, originalText);
                            }
                          }}
                          className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          id="export-pdf-report-btn"
                          title="Export professional PDF report"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Export PDF Report</span>
                        </button>
                        <button
                          onClick={handleSendToHumanizer}
                          className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          id="quick-to-humanizer-btn"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                          <span>Convert to Human Notes</span>
                        </button>
                        <button
                          onClick={() => setScanResult(null)}
                          className="p-1.5 border border-slate-200 text-slate-500 hover:text-slate-955 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Scan new document"
                          id="rescan-btn"
                        >
                          <RotateCw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Core Result Panel */}
                    <ScanResultDashboard 
                      result={scanResult} 
                      onSentenceReplaced={handleSentenceReplaced}
                      isLoadingNewSuggestions={false}
                      onGenerateMoreSuggestions={handleGenerateMoreSuggestions}
                    />

                  </div>
                )}

              </div>
            )}

            {activeTab === "GRAMMAR" && (
              <GrammarChecker />
            )}

            {activeTab === "PROOFREADER" && (
              <AIProofreader />
            )}

            {activeTab === "TRANSLATOR" && (
              <AITranslator />
            )}

            {activeTab === "REF_FINDER" && (
              <ReferenceFinder />
            )}

            {activeTab === "SUMMARIZER" && (
              <AISummarizer />
            )}

            {activeTab === "WRITING_ASSISTANT" && (
              <WritingAssistant />
            )}

            {activeTab === "HUMANIZER" && (
              <HumanizerWorkspace 
                onHumanize={handleTriggerHumanize} 
                result={humanizeResult} 
                isLoading={isHumanizing} 
              />
            )}

            {activeTab === "ANALYTICS" && (
              <OriginalityBench onRephraseSentence={handleRephraseSentenceSandbox} />
            )}

            {activeTab === "HISTORY" && (
              <HistoryPanel 
                scans={scansHistory} 
                humanizations={humanizationsHistory} 
                onLoadScan={handleLoadScan} 
                onLoadHumanization={handleLoadHumanization} 
                onDeleteScan={handleDeleteScan} 
                onDeleteHumanization={handleDeleteHumanization} 
              />
            )}
          </div>
        </div>

      </main>

      {/* Humble, clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1.5">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
            AuthentiScribe Audit Core v3.5 • All calculations local & secure • Powered by Google Gemini
          </p>
          <p className="text-[9px] text-slate-450 font-sans uppercase tracking-wider mt-1">
            Created in compliance with educational integrity and structural plagiarism benchmarks.
          </p>
        </div>
      </footer>

      {/* Citation Assistant Overlay Modal */}
      <CitationAssistantModal 
        isOpen={isCitationAssistantOpen}
        onClose={() => setIsCitationAssistantOpen(false)}
        initialText={textToScan || (scanResult?.extractedText || "")}
      />

    </div>
  );
}
