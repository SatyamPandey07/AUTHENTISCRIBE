/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ReadabilityMetrics {
  gradeLevel: string;
  score: number; // Flesch Reading Ease
  perplexity: number; // Metric for unpredictability
  burstiness: number; // Metric for variation in sentence length/structure
}

export interface SentenceAnalysis {
  text: string;
  aiProbability: number; // 0 - 100
  plagiarismProbability: number; // 0 - 100
  category: 'ai' | 'plagiarized' | 'human';
  suggestions: string[]; // Rewritten alternatives to make it unique and human-like
}

export interface CitationSuggestion {
  statement: string; // The statement that should be cited
  reason: string; // Why a citation is suggested (e.g., "Claims a specific statistic")
  apa: string; // APA style recommendation template
  mla: string; // MLA style recommendation template
  chicago: string; // Chicago style recommendation template
}

export interface AnalysisResult {
  overallScore: number; // Overall percentage likelihood of AI/non-original content (0 - 100)
  aiScore: number; // AI generation percentage
  plagiarismScore: number; // Plagiarism percentage
  humanScore: number; // Human likelihood score
  sentences: SentenceAnalysis[];
  readability: ReadabilityMetrics;
  detectedThemes: string[];
  citationSuggestions: CitationSuggestion[];
  extractedText?: string; // Optional text extracted from PDF documents
}

export interface HumanizeResult {
  originalText: string;
  humanizedText: string;
  style: string; // Style used (e.g., academic, business, casual, narrative)
  intensity: 'low' | 'medium' | 'high';
  improvementNotes: string[];
  metricsBefore: {
    aiScore: number;
    readabilityScore: number;
    gradeLevel: string;
  };
  metricsAfter: {
    aiScore: number;
    readabilityScore: number;
    gradeLevel: string;
  };
}

export interface SavedScan {
  id: string;
  title: string;
  timestamp: string;
  text: string;
  result: AnalysisResult;
}

export interface SavedHumanization {
  id: string;
  title: string;
  timestamp: string;
  originalText: string;
  humanizedText: string;
  result: HumanizeResult;
}
