/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AnalysisResult, SentenceAnalysis, CitationSuggestion } from "../types";
import { 
  CheckCircle, AlertTriangle, HelpCircle, Copy, Check, Sparkles, 
  ChevronRight, BookOpen, FileSpreadsheet, RotateCcw, AlertCircle, Info, Loader2,
  TrendingUp
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from "recharts";

interface FleschKincaidScaleItem {
  min: number;
  max: number;
  label: string;
  grade: string;
  audience: string;
  demographic: string;
  guideline: string;
  colorClass: string;
  barColor: string;
}

const FLESCH_KINCAID_SCALE: FleschKincaidScaleItem[] = [
  {
    min: 90,
    max: 100,
    label: "Very Easy",
    grade: "5th Grade",
    audience: "Universal (Age 11+)",
    demographic: "95% - 100% of adult readers",
    guideline: "Highly conversational. Excellent accessibility. Short sentences and basic words. Perfect for absolute universal distribution.",
    colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    barColor: "bg-emerald-500"
  },
  {
    min: 80,
    max: 89,
    label: "Easy",
    grade: "6th Grade",
    audience: "General Consumer (Age 12+)",
    demographic: "90% - 94% of adult readers",
    guideline: "Conversational prose. Very high readability. Standard for marketing copy, blog posts, and consumer announcements.",
    colorClass: "bg-teal-50 text-teal-700 border-teal-200",
    barColor: "bg-teal-500"
  },
  {
    min: 70,
    max: 79,
    label: "Fairly Easy",
    grade: "7th Grade",
    audience: "General Public (Age 13+)",
    demographic: "85% - 89% of adult readers",
    guideline: "Quite approachable and fluid. Requires minimal effort to comprehend. Excellent for digital media, general documentation, and blogs.",
    colorClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
    barColor: "bg-cyan-500"
  },
  {
    min: 60,
    max: 69,
    label: "Standard",
    grade: "8th & 9th Grade",
    audience: "Average Adult (Age 13-15+)",
    demographic: "75% - 84% of adult readers",
    guideline: "Standard Plain English. Highly effective for everyday communications, business reporting, and educational texts.",
    colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    barColor: "bg-indigo-500"
  },
  {
    min: 50,
    max: 59,
    label: "Fairly Difficult",
    grade: "10th to 12th Grade",
    audience: "High School Literacy",
    demographic: "50% - 74% of adult readers",
    guideline: "Requires focused reading. Common in high-quality newspapers, news editorials, and standard professional whitepapers.",
    colorClass: "bg-amber-50 text-amber-700 border-amber-200",
    barColor: "bg-amber-500"
  },
  {
    min: 30,
    max: 49,
    label: "Difficult",
    grade: "College Level",
    audience: "Advanced / Professional",
    demographic: "25% - 49% of adult readers",
    guideline: "Requires advanced literacy skills. Sentences are long and word density is high. Ideal for scientific literature or research journals.",
    colorClass: "bg-orange-50 text-orange-700 border-orange-200",
    barColor: "bg-orange-500"
  },
  {
    min: 0,
    max: 29,
    label: "Very Difficult",
    grade: "Post-Graduate Level",
    audience: "Academic / Executive",
    demographic: "Under 25% of adult readers",
    guideline: "Extremely complex academic prose, legal contracts, or advanced technical documentation. Filled with highly specialized jargon.",
    colorClass: "bg-rose-50 text-rose-700 border-rose-200",
    barColor: "bg-rose-500"
  }
];

const getFleschDetails = (score: number): FleschKincaidScaleItem => {
  const item = FLESCH_KINCAID_SCALE.find(s => score >= s.min && score <= s.max);
  if (item) return item;
  if (score > 100) return FLESCH_KINCAID_SCALE[0];
  return FLESCH_KINCAID_SCALE[FLESCH_KINCAID_SCALE.length - 1];
};

interface TooltipPayloadItem {
  payload: {
    index: number;
    text: string;
    ai: number;
    human: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded shadow-lg text-xs max-w-sm space-y-1.5 font-sans" id="recharts-custom-tooltip">
        <p className="font-bold text-[10px] text-slate-400 font-mono uppercase tracking-wider">
          Sentence #{data.index}
        </p>
        <p className="italic text-slate-200 line-clamp-2">
          "{data.text}"
        </p>
        <div className="pt-1.5 border-t border-slate-800 flex justify-between gap-6">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-rose-300">AI: <strong>{data.ai}%</strong></span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-300">Human: <strong>{data.human}%</strong></span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

interface ScanResultDashboardProps {
  result: AnalysisResult;
  onSentenceReplaced: (originalSentenceText: string, newText: string) => void;
  isLoadingNewSuggestions: boolean;
  onGenerateMoreSuggestions: (sentenceText: string) => Promise<string[] | null>;
}

export default function ScanResultDashboard({ 
  result, 
  onSentenceReplaced,
  isLoadingNewSuggestions,
  onGenerateMoreSuggestions
}: ScanResultDashboardProps) {
  const [selectedSentence, setSelectedSentence] = useState<SentenceAnalysis | null>(null);
  const [customSuggestions, setCustomSuggestions] = useState<string[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null); // e.g., "apa-0", "mla-0"
  const [customRephraseLoading, setCustomRephraseLoading] = useState(false);
  const [copiedFullText, setCopiedFullText] = useState(false);

  const handleCopyFullText = () => {
    if (!result.sentences || result.sentences.length === 0) return;
    const fullText = result.sentences.map(s => s.text).join(" ");
    navigator.clipboard.writeText(fullText);
    setCopiedFullText(true);
    setTimeout(() => setCopiedFullText(false), 2000);
  };

  const fleschDetails = getFleschDetails(result.readability.score);

  const chartData = (result.sentences || []).map((sentence, idx) => {
    return {
      name: `S${idx + 1}`,
      index: idx + 1,
      ai: Math.round(sentence.aiProbability),
      human: Math.round(100 - sentence.aiProbability),
      text: sentence.text
    };
  });

  const getScoreColor = (score: number, inverse: boolean = false) => {
    // If inverse, high is BAD (e.g. AI / Plagiarism scores)
    // If not inverse, high is GOOD (e.g. Human score, reading ease)
    const normalizedScore = inverse ? 100 - score : score;
    if (normalizedScore >= 75) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (normalizedScore >= 45) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const getScoreBarBg = (score: number, inverse: boolean = false) => {
    const normalizedScore = inverse ? 100 - score : score;
    if (normalizedScore >= 75) return "bg-emerald-500";
    if (normalizedScore >= 45) return "bg-amber-500";
    return "bg-rose-500";
  };

  const handleSentenceClick = async (sentence: SentenceAnalysis) => {
    setSelectedSentence(sentence);
    setCustomSuggestions(null);
  };

  const handleGetMoreSuggestions = async (sentence: string) => {
    setCustomRephraseLoading(true);
    try {
      const fresh = await onGenerateMoreSuggestions(sentence);
      if (fresh) {
        setCustomSuggestions(fresh);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCustomRephraseLoading(false);
    }
  };

  const triggerCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(identifier);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReplace = (original: string, replacement: string) => {
    onSentenceReplaced(original, replacement);
    // Update active sentence view state
    if (selectedSentence) {
      setSelectedSentence({
        ...selectedSentence,
        text: replacement,
        aiProbability: 5,
        plagiarismProbability: 5,
        category: "human",
        suggestions: []
      });
    }
    setCustomSuggestions(null);
  };

  return (
    <div className="space-y-8" id="scan-dashboard-wrapper">
      
      {/* 1. Score Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="scores-grid">
        
        {/* Overall Originality Gauge */}
        <div className="bg-white border border-slate-200 p-5 rounded shadow-sm flex flex-col justify-between col-span-1 md:col-span-1 min-h-[220px]">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
              Linguistic Entropy
            </h3>
            <div className="flex justify-center items-center mt-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100"/>
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="263.89" strokeDashoffset={263.89 - (263.89 * result.humanScore) / 100} className="text-indigo-500 transition-all duration-500"/>
                </svg>
                <span className="absolute text-2xl font-bold tracking-tighter text-slate-900 font-display">{result.humanScore}%</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 text-center font-mono tracking-wider uppercase mt-1">
            {result.humanScore}% HUMAN AUTHENTICITY
          </p>
        </div>

        {/* AI Likelihood Card */}
        <div className="bg-white border border-slate-200 p-5 rounded shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                AI Generation Score
              </h3>
              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase border ${getScoreColor(result.aiScore, true)}`}>
                {result.aiScore < 20 ? "Safe" : result.aiScore < 50 ? "Caution" : "Synthetic"}
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight text-slate-900 font-display mt-4">
              {result.aiScore}%
            </p>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden">
              <div 
                className={`h-1.5 rounded-sm transition-all duration-500 ${getScoreBarBg(result.aiScore, true)}`}
                style={{ width: `${result.aiScore}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 uppercase font-mono tracking-wider mt-2.5">
              Measures syntax predictability and flow.
            </p>
          </div>
        </div>

        {/* Plagiarism Card */}
        <div className="bg-white border border-slate-200 p-5 rounded shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                Plagiarism Match
              </h3>
              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase border ${getScoreColor(result.plagiarismScore, true)}`}>
                {result.plagiarismScore < 15 ? "Original" : result.plagiarismScore < 40 ? "Review" : "Flagged"}
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight text-slate-900 font-display mt-4">
              {result.plagiarismScore}%
            </p>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden">
              <div 
                className={`h-1.5 rounded-sm transition-all duration-500 ${getScoreBarBg(result.plagiarismScore, true)}`}
                style={{ width: `${result.plagiarismScore}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 uppercase font-mono tracking-wider mt-2.5">
              Scans match indexes in database corpus.
            </p>
          </div>
        </div>

        {/* Readability Card */}
        <div className="bg-white border border-slate-200 p-5 rounded shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                Readability Score
              </h3>
              <span className={`text-[9px] font-bold font-mono border px-2 py-0.5 rounded uppercase ${fleschDetails.colorClass}`}>
                {fleschDetails.label}
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-4">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-display">
                {result.readability.score}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden">
              <div 
                className={`h-1.5 rounded-sm transition-all duration-500 ${fleschDetails.barColor}`}
                style={{ width: `${Math.min(Math.max(result.readability.score, 0), 100)}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 uppercase font-mono tracking-wider mt-2.5">
              Flesch ease grade: {result.readability.gradeLevel}.
            </p>
          </div>
        </div>

      </div>

      {/* 2. Stylometric Integrity Flow Trend */}
      <div className="bg-white border border-slate-200 dark:border-slate-800 rounded p-5 shadow-sm" id="trend-analysis-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200 font-mono flex items-center gap-2">
              <span className="p-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-100 dark:border-indigo-800/40">
                <TrendingUp className="h-4 w-4 animate-pulse" />
              </span>
              <span>Linguistic Integrity & Stylometry Distribution Map</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Analyzes and correlates synthetically generated structural flow patterns vs. human authenticity levels sentence-by-sentence.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-[10px] font-mono uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-500">AI Probability</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Human Authenticity</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full mt-4" id="stylometry-recharts-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHuman" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(value) => `${value}%`} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="ai" 
                stroke="#f43f5e" 
                strokeWidth={2.5} 
                dot={chartData.length < 40 ? { r: 3, stroke: '#f43f5e', strokeWidth: 1, fill: '#fff' } : false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="human" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                dot={chartData.length < 40 ? { r: 3, stroke: '#10b981', strokeWidth: 1, fill: '#fff' } : false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-start space-x-2 text-[10px] text-slate-400 mt-3 font-mono leading-relaxed" id="trend-analysis-footnote">
          <Info className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p>
            Hovering over points displays the source sentence slice. Spikes above <strong className="text-rose-500">70% AI Probability</strong> indicate highly structured/monotonous phrasing that our engine flags as potentially machine-assisted. Use the segment navigator below to rephrase flagged slices.
          </p>
        </div>
      </div>

      {/* 3. Interactive Highlights & Sentence Recomposer Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="interactive-editor-section">
        
        {/* Left Side: Highlighted Text Viewer */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono">
                Interactive Document Auditor
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Click any highlighted sentence to open the original recomposer and rephrase it instantly.
              </p>
            </div>
            <div className="flex items-center space-x-4 flex-wrap gap-y-2">
              {/* Quick Legend */}
              <div className="flex items-center space-x-3 text-[10px] font-mono uppercase tracking-wider font-bold">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 bg-rose-400 border border-rose-300 rounded-sm" />
                  <span className="text-slate-500">AI</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 bg-amber-400 border border-amber-300 rounded-sm" />
                  <span className="text-slate-500">Plagiarized</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 bg-emerald-400 border border-emerald-300 rounded-sm" />
                  <span className="text-slate-500">Human</span>
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyFullText}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white hover:text-slate-100 rounded-sm transition-colors flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-3xs"
                title="Copy clean processed text to clipboard"
                id="copy-scanned-document-btn"
              >
                {copiedFullText ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedFullText ? "Copied!" : "Copy Full Text"}</span>
              </button>
            </div>
          </div>

          <div 
            className="border border-slate-150 rounded p-4 min-h-[300px] max-h-[500px] overflow-y-auto bg-slate-50/20 font-sans text-slate-800 leading-relaxed text-sm select-text cursor-text"
            id="highlighted-workspace"
          >
            {result.sentences && result.sentences.length > 0 ? (
              <div className="space-y-2">
                {result.sentences.map((sentence, index) => {
                  let highlightClass = "";
                  let isSelected = selectedSentence?.text === sentence.text;
                  
                  if (sentence.category === "ai" && sentence.aiProbability > 25) {
                    highlightClass = isSelected 
                      ? "bg-rose-200 border-b-2 border-rose-500 font-medium cursor-pointer" 
                      : "bg-rose-50 hover:bg-rose-100 border-b-2 border-rose-300 transition-colors cursor-pointer";
                  } else if (sentence.category === "plagiarized") {
                    highlightClass = isSelected
                      ? "bg-amber-200 border-b-2 border-amber-500 font-medium cursor-pointer"
                      : "bg-amber-50 hover:bg-amber-100 border-b-2 border-amber-300 transition-colors cursor-pointer";
                  } else {
                    highlightClass = "hover:bg-slate-100/50 cursor-pointer transition-colors";
                  }

                  return (
                    <span
                      key={index}
                      id={`sentence-${index}`}
                      onClick={() => handleSentenceClick(sentence)}
                      className={`inline px-1 py-0.5 rounded-sm mx-0.5 ${highlightClass}`}
                      title={`AI: ${sentence.aiProbability}%, Plagiarism: ${sentence.plagiarismProbability}%`}
                    >
                      {sentence.text}{" "}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-12">No text chunks loaded for analysis.</p>
            )}
          </div>
        </div>

        {/* Right Side: Recomposer Workspace / Side Inspector */}
        <div className="lg:col-span-1">
          {selectedSentence ? (
            <div className="bg-slate-900 border border-slate-800 text-white rounded p-5 shadow-md flex flex-col justify-between min-h-[400px]" id="inspector-card">
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      Sentence Recomposer
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedSentence(null)}
                    className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Current Selected Sentence details */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Selected Phrase
                    </span>
                    <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-sm border border-slate-800 italic">
                      "{selectedSentence.text}"
                    </p>
                    <div className="flex items-center space-x-4 mt-2 font-mono text-[10px] uppercase font-bold tracking-wider">
                      <span className={selectedSentence.aiProbability > 40 ? "text-rose-400" : "text-emerald-400"}>
                        AI: {selectedSentence.aiProbability}%
                      </span>
                      <span className={selectedSentence.plagiarismProbability > 30 ? "text-amber-400" : "text-emerald-400"}>
                        COPY: {selectedSentence.plagiarismProbability}%
                      </span>
                      <span className="text-slate-400 capitalize">
                        FLAG: {selectedSentence.category}
                      </span>
                    </div>
                  </div>

                  {/* Suggestions List */}
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase block mb-2 font-bold tracking-wider">
                      Original suggestions (No Latency)
                    </span>
                    <div className="space-y-2">
                      {(selectedSentence.suggestions && selectedSentence.suggestions.length > 0) ? (
                        selectedSentence.suggestions.map((suggestion, sIdx) => (
                          <div 
                            key={sIdx}
                            className="bg-slate-950 border border-slate-850 hover:border-indigo-500/50 p-2.5 rounded-sm text-xs text-slate-300 hover:text-white transition-all flex flex-col justify-between"
                          >
                            <p className="mb-2 leading-relaxed">"{suggestion}"</p>
                            <button
                              onClick={() => handleReplace(selectedSentence.text, suggestion)}
                              className="self-end px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm text-[10px] transition-colors flex items-center space-x-1 cursor-pointer uppercase tracking-wider"
                            >
                              <span>Apply Rewrite</span>
                              <ChevronRight className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">No pre-computed alternatives. Generate fresh ones below!</p>
                      )}
                    </div>
                  </div>

                  {/* Custom alternatives generated live */}
                  {customSuggestions && (
                    <div className="border-t border-slate-800 pt-3">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-2 font-bold tracking-wider">
                        Premium Live Alternatives
                      </span>
                      <div className="space-y-2">
                        {customSuggestions.map((suggestion, csIdx) => (
                          <div 
                            key={csIdx}
                            className="bg-slate-950 border border-emerald-950/45 hover:border-emerald-500/50 p-2.5 rounded-sm text-xs text-slate-300 hover:text-white transition-all flex flex-col justify-between"
                          >
                            <p className="mb-2 leading-relaxed">"{suggestion}"</p>
                            <button
                              onClick={() => handleReplace(selectedSentence.text, suggestion)}
                              className="self-end px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-sm text-[10px] transition-colors flex items-center space-x-1 cursor-pointer uppercase tracking-wider"
                            >
                              <span>Apply Rewrite</span>
                              <ChevronRight className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action: Generate 3 More Live */}
              <div className="pt-4 mt-4 border-t border-slate-800">
                <button
                  onClick={() => handleGetMoreSuggestions(selectedSentence.text)}
                  disabled={customRephraseLoading}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-xs font-bold uppercase tracking-wider text-white rounded transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  id="rephrase-live-btn"
                >
                  {customRephraseLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Rephrasing Live...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-3.5 w-3.5 text-emerald-450 animate-spin-slow" />
                      <span>Generate 3 Fresh Alternatives</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 text-slate-500 rounded p-6 text-center flex flex-col items-center justify-center min-h-[400px]" id="empty-inspector">
              <Sparkles className="h-8 w-8 text-slate-300 mb-3" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">
                Sentence Inspector
              </h3>
              <p className="text-xs text-slate-400 max-w-[200px] mt-2">
                Select any highlighted sentence in the document scanner to inspect and recompose it.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 3. Deep Linguistics & Reading Ease Details */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm" id="linguistics-card">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono mb-1 flex items-center space-x-2">
          <span>Linguistics & Unpredictability Metrics</span>
          <span className="text-[9px] font-bold font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">Audited</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-sans">
          AI generated documents feature extremely uniform word patterns (low Perplexity) and uniform sentence lengths (low Burstiness). Humans write with high volatility.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="border border-slate-200 p-4 rounded bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Grade Reading Level</span>
            <span className="text-xl font-bold text-slate-900 mt-1.5 block font-display">{result.readability.gradeLevel}</span>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Calculates the intellectual complexity and vocabulary depth of the source text.
            </p>
          </div>

          <div className="border border-slate-200 p-4 rounded bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Flesch Reading Ease</span>
            <span className="text-xl font-bold text-slate-900 mt-1.5 block font-display">{result.readability.score} / 100</span>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Standard readability metric. Higher implies clearer sentences, easier vocabulary, and better flow.
            </p>
          </div>

          <div className="border border-slate-200 p-4 rounded bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Perplexity (Lexical Entropy)</span>
            <span className="text-xl font-bold text-slate-900 mt-1.5 block font-display">{result.readability.perplexity} / 100</span>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Measures vocabulary randomness. AI vocabulary is highly predictable; human vocabulary features high entropy (50+).
            </p>
          </div>

          <div className="border border-slate-200 p-4 rounded bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Burstiness (Structural Variance)</span>
            <span className="text-xl font-bold text-slate-900 mt-1.5 block font-display">{result.readability.burstiness} / 100</span>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Measures variation in sentence lengths. AI generates highly uniform sentence sizes; humans write in short, punchy bursts mixed with long phrases.
            </p>
          </div>

        </div>

        {/* Flesch-Kincaid Readability & Accessibility Audit Subsection */}
        <div className="mt-8 pt-6 border-t border-slate-100" id="flesch-kincaid-audit-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 font-mono flex items-center space-x-1.5">
                <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                <span>Flesch-Kincaid Accessibility Audit</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Detailed educational grade correlation and readability ease breakdown for public or academic consumption.
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded border uppercase ${fleschDetails.colorClass}`}>
                {fleschDetails.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-50/40 border border-slate-150 p-5 rounded">
            {/* Left: Interactive Score spectrum meter */}
            <div className="lg:col-span-1 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
                  Readability Spectrum (Flesch Ease)
                </span>
                <div className="text-sm font-bold text-slate-800 mb-2">
                  Score: <span className="text-xl font-display text-slate-900">{result.readability.score}</span> / 100
                </div>
              </div>

              {/* Spectrum Bar with pointer */}
              <div className="relative pt-4 pb-2">
                {/* Visual Bar with nice gradient from dense/red (0) to easy/green (100) */}
                <div className="h-3 w-full rounded bg-gradient-to-r from-rose-500 via-amber-500 via-indigo-500 to-emerald-500 relative">
                  {/* Milestones markers on the bar */}
                  <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-white/40" title="Difficult threshold" />
                  <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white/40" title="Fairly Difficult" />
                  <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-white/40" title="Standard threshold" />
                  <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-white/40" title="Fairly Easy" />
                  <div className="absolute top-0 bottom-0 left-[90%] w-0.5 bg-white/40" title="Very Easy" />
                </div>

                {/* Score Marker Pointer */}
                <div 
                  className="absolute -top-1.5 transform -translate-x-1/2 flex flex-col items-center group transition-all duration-700"
                  style={{ left: `${Math.min(Math.max(result.readability.score, 0), 100)}%` }}
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-900 ring-2 ring-white shadow-md" />
                  <div className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow mt-1 font-mono">
                    {result.readability.score}
                  </div>
                </div>
              </div>

              {/* Spectrum Legends */}
              <div className="flex justify-between text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                <span>0 (Dense)</span>
                <span>50</span>
                <span>100 (Easy)</span>
              </div>
            </div>

            {/* Middle: Details breakdown */}
            <div className="lg:col-span-1 border-y lg:border-y-0 lg:border-x border-slate-200/60 py-4 lg:py-0 lg:px-6 space-y-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  Flesch-Kincaid Grade Level
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {result.readability.gradeLevel}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  Target Demographic Reach
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {fleschDetails.audience}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  Estimated Reader Public
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {fleschDetails.demographic}
                </span>
              </div>
            </div>

            {/* Right: Accessibility Advice Guidelines */}
            <div className="lg:col-span-1 space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block flex items-center space-x-1">
                <Info className="h-3 w-3 text-slate-400" />
                <span>Accessibility Advisory</span>
              </span>
              <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-150 p-3 rounded-sm italic">
                {fleschDetails.guideline}
              </p>
              <p className="text-[10px] text-slate-400 leading-normal">
                Flesch Reading Ease scores represent comprehension difficulty. High scores indicate fluid, short sentences; low scores represent dense, high-complexity scholastic arguments.
              </p>
            </div>
          </div>
        </div>

        {/* Detected Themes Map */}
        <div className="border-t border-slate-100 mt-6 pt-5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono mr-2">Detected Topics:</span>
          {result.detectedThemes && result.detectedThemes.map((theme, index) => (
            <span 
              key={index} 
              className="text-[10px] font-bold font-mono px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded uppercase tracking-wider"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      {/* 4. Academic Citation & Bibliography Suggestions Auditor */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm" id="citations-card">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono mb-1 flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-indigo-500" />
          <span>Academic Citation & Source Auditor</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-sans">
          To safely make your document plagiarism-free, our AI has audited factual statements, scientific declarations, or statistics that require academic source citations. APA, MLA, and Chicago format templates are pre-generated below.
        </p>

        {result.citationSuggestions && result.citationSuggestions.length > 0 ? (
          <div className="space-y-4">
            {result.citationSuggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="border border-slate-200 rounded p-4 bg-slate-50/30 flex flex-col md:flex-row md:items-start justify-between gap-4"
                id={`citation-block-${index}`}
              >
                <div className="space-y-2 max-w-2xl">
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded font-mono uppercase tracking-widest">
                    Audit Flag #{index + 1}
                  </span>
                  <p className="text-xs font-medium text-slate-800 italic bg-white border border-slate-150 p-2.5 rounded-sm">
                    "{suggestion.statement}"
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700 uppercase font-mono text-[9px] tracking-wider">Audit Reason:</span> {suggestion.reason}
                  </p>
                </div>

                {/* Citation Styles Selector Box */}
                <div className="bg-white border border-slate-200 rounded p-3 min-w-[280px] md:min-w-[320px] shadow-2xs space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest font-mono text-slate-400 block mb-1">Citation Templates</span>
                  
                  {/* APA Row */}
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-1.5 last:border-b-0">
                    <span className="font-bold font-mono text-slate-400 text-[9px] w-12 uppercase tracking-wider">APA</span>
                    <span className="truncate text-slate-600 max-w-[180px] text-[11px] font-serif">{suggestion.apa}</span>
                    <button 
                      onClick={() => triggerCopy(suggestion.apa, `apa-${index}`)}
                      className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                      title="Copy APA format"
                    >
                      {copiedIndex === `apa-${index}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* MLA Row */}
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-1.5 last:border-b-0">
                    <span className="font-bold font-mono text-slate-400 text-[9px] w-12 uppercase tracking-wider">MLA</span>
                    <span className="truncate text-slate-600 max-w-[180px] text-[11px] font-serif">{suggestion.mla}</span>
                    <button 
                      onClick={() => triggerCopy(suggestion.mla, `mla-${index}`)}
                      className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                      title="Copy MLA format"
                    >
                      {copiedIndex === `mla-${index}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Chicago Row */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold font-mono text-slate-400 text-[9px] w-12 uppercase tracking-wider">Chicago</span>
                    <span className="truncate text-slate-600 max-w-[180px] text-[11px] font-serif">{suggestion.chicago}</span>
                    <button 
                      onClick={() => triggerCopy(suggestion.chicago, `chi-${index}`)}
                      className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                      title="Copy Chicago format"
                    >
                      {copiedIndex === `chi-${index}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded p-4 text-center text-slate-500 text-xs py-8" id="empty-citations">
            <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
            No major un-cited statistical claims, dates, or academic assertations detected in this text. Your citation health is in great standing!
          </div>
        )}
      </div>

    </div>
  );
}
