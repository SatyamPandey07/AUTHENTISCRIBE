/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import mammoth from "mammoth";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

// Port and host configurations
const PORT = 3000;

// Lazy initialization pattern for Gemini API client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it via Settings > Secrets in the AI Studio UI.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();

  // Increase payload limits for handling base64 files
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Helper to extract text from Word files (.docx)
  app.post("/api/extract-text", async (req, res) => {
    try {
      const { fileData } = req.body;
      if (!fileData) {
        return res.status(400).json({ error: "Missing fileData parameter" });
      }

      const buffer = Buffer.from(fileData, 'base64');
      const result = await mammoth.extractRawText({ buffer });
      
      res.json({ text: result.value });
    } catch (error: any) {
      console.error("Error extracting text from DOCX:", error);
      res.status(500).json({ error: `Failed to extract text from Word document: ${error.message}` });
    }
  });

  // Main analyze endpoint (AI Detection + Plagiarism Scanner + Readability & Citations Audit)
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text, fileData, fileType } = req.body;
      
      if (!text && !fileData) {
        return res.status(400).json({ error: "No text or file data provided for analysis." });
      }

      const ai = getGeminiClient();

      let contents: any[] = [];
      let promptText = "";

      if (fileType === "application/pdf" && fileData) {
        // Send raw PDF directly to Gemini for extraction & analysis!
        contents.push({
          inlineData: {
            mimeType: "application/pdf",
            data: fileData
          }
        });
        
        promptText = `
          Extract the complete text of this PDF document and perform a comprehensive AI detection and plagiarism analysis on it.
          
          Provide your analysis in the strict JSON format matching the schema:
          1. Detect the overall score, AI probability, Plagiarism probability, and Human score.
          2. Perform a sentence-by-sentence analysis of the entire extracted text, scoring each sentence for AI likelihood and plagiarism likelihood. Provide 2 original, humanized suggestions for rewriting any sentence scored with over 40% AI or plagiarism likelihood to make it fully human-written and original.
          3. Evaluate readability metrics: Flesch Reading Ease score (0-100), estimated Grade Level, Perplexity (word unpredictability, where 10-30 is robotic, 50+ is human), and Burstiness (structural variation, where 10-30 is uniform/AI, 50+ is human).
          4. Detect major themes.
          5. Audit the text for specific factual assertions, statistics, or academic claims that need citations, and output suggested citation templates in APA, MLA, and Chicago styles.
          6. Put the full extracted text from the PDF inside the 'extractedText' field so the client can display it.
        `;
        contents.push(promptText);
      } else {
        // standard text analysis
        promptText = `
          Perform a comprehensive AI generation detection, plagiarism scanner, readability audit, and citation review on the following text:
          
          "${text}"
          
          Provide your analysis in the strict JSON format matching the schema:
          1. overallScore: Average combined score of AI content and non-original content.
          2. aiScore: Percentage likelihood that the text contains machine-generated components (0-100).
          3. plagiarismScore: Percentage likelihood of plagiarism or similarity to standard web/corpus sources (0-100).
          4. humanScore: Percentage of genuine, human-like, unique content (0-100).
          5. sentences: Breakdown of the text sentence-by-sentence. For every single sentence, provide:
             - text: The exact sentence.
             - aiProbability: 0-100 score.
             - plagiarismProbability: 0-100 score.
             - category: 'ai', 'plagiarized', or 'human' (the highest probability category).
             - suggestions: 2 premium human-like rephrased options that are plagiarism-free and original.
          6. readability: Provide gradeLevel (e.g., "10th Grade"), score (Flesch Reading Ease 0-100), perplexity (word choice variation, 0-100), and burstiness (sentence structure variation, 0-100).
          7. detectedThemes: Array of 2 to 5 themes or subjects.
          8. citationSuggestions: Find statements that are claims, data assertions, or statistics, and provide APA, MLA, and Chicago templates.
        `;
        contents.push(promptText);
      }

      // JSON Schema configuration
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER },
          aiScore: { type: Type.INTEGER },
          plagiarismScore: { type: Type.INTEGER },
          humanScore: { type: Type.INTEGER },
          extractedText: { type: Type.STRING, description: "Full text extracted from PDF, or empty if text was pasted." },
          sentences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                aiProbability: { type: Type.INTEGER },
                plagiarismProbability: { type: Type.INTEGER },
                category: { type: Type.STRING },
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["text", "aiProbability", "plagiarismProbability", "category", "suggestions"]
            }
          },
          readability: {
            type: Type.OBJECT,
            properties: {
              gradeLevel: { type: Type.STRING },
              score: { type: Type.INTEGER },
              perplexity: { type: Type.INTEGER },
              burstiness: { type: Type.INTEGER }
            },
            required: ["gradeLevel", "score", "perplexity", "burstiness"]
          },
          detectedThemes: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          citationSuggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                statement: { type: Type.STRING },
                reason: { type: Type.STRING },
                apa: { type: Type.STRING },
                mla: { type: Type.STRING },
                chicago: { type: Type.STRING }
              },
              required: ["statement", "reason", "apa", "mla", "chicago"]
            }
          }
        },
        required: [
          "overallScore",
          "aiScore",
          "plagiarismScore",
          "humanScore",
          "sentences",
          "readability",
          "detectedThemes",
          "citationSuggestions"
        ]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          systemInstruction: "You are an elite academic editor, advanced AI detector, and plagiarism auditor. Return strictly valid JSON adhering to the specified schema. Ensure all fields are filled, do not return empty arrays if claims are present."
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from Gemini.");
      }

      const resultJson = JSON.parse(resultText);
      res.json(resultJson);

    } catch (error: any) {
      console.error("Analysis API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during text analysis." });
    }
  });

  // Humanize / Convert Machine-Generated text to Human Notes
  app.post("/api/humanize", async (req, res) => {
    try {
      const { text, style, intensity } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Missing text parameter to humanize" });
      }

      const ai = getGeminiClient();

      const promptText = `
        You are a master of prose, specializing in converting machine-generated AI content (which sounds flat, highly structured, repetitive, or overly formal) into a highly natural, human-written sounding note or document.
        
        Original Text:
        "${text}"
        
        Style requested: ${style || "academic"} (can be academic, business, casual, or narrative).
        Intensity requested: ${intensity || "medium"} (low, medium, high adjustments to restructuring and word swaps).
        
        Rewrite this text so it passes all AI detectors, sounds authentic, has varied sentence lengths (burstiness), uses natural human flow, and includes subtle organic transitions.
        
        Provide your output in strict JSON format matching the schema:
        - originalText: The exact original text provided.
        - humanizedText: The full humanized, beautifully written text.
        - style: The style used.
        - intensity: The intensity used.
        - improvementNotes: 3-5 short descriptions of what you did (e.g. 'Varied sentence structures', 'Introduced natural idioms', 'Softened corporate jargon').
        - metricsBefore: Estimated AI score (70-100), readability score, grade level of the original text.
        - metricsAfter: New estimated AI score (0-15), readability score, and grade level of your humanized output.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          originalText: { type: Type.STRING },
          humanizedText: { type: Type.STRING },
          style: { type: Type.STRING },
          intensity: { type: Type.STRING },
          improvementNotes: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          metricsBefore: {
            type: Type.OBJECT,
            properties: {
              aiScore: { type: Type.INTEGER },
              readabilityScore: { type: Type.INTEGER },
              gradeLevel: { type: Type.STRING }
            },
            required: ["aiScore", "readabilityScore", "gradeLevel"]
          },
          metricsAfter: {
            type: Type.OBJECT,
            properties: {
              aiScore: { type: Type.INTEGER },
              readabilityScore: { type: Type.INTEGER },
              gradeLevel: { type: Type.STRING }
            },
            required: ["aiScore", "readabilityScore", "gradeLevel"]
          }
        },
        required: [
          "originalText",
          "humanizedText",
          "style",
          "intensity",
          "improvementNotes",
          "metricsBefore",
          "metricsAfter"
        ]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          systemInstruction: "You are an expert human copywriter and linguist. Rewrite text to sound extremely human-written and original while preserving the core facts."
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from Gemini.");
      }

      const resultJson = JSON.parse(resultText);
      res.json(resultJson);

    } catch (error: any) {
      console.error("Humanize API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during humanization." });
    }
  });

  // Rephrase Single Sentence (Interactive correction workspace)
  app.post("/api/rephrase-sentence", async (req, res) => {
    try {
      const { sentence, contextBefore, contextAfter, style } = req.body;

      if (!sentence) {
        return res.status(400).json({ error: "Missing sentence parameter" });
      }

      const ai = getGeminiClient();

      const promptText = `
        You are a professional editor. Rephrase this specific sentence so that it is fully human-written, highly original, and plagiarism-free.
        
        Sentence to rephrase:
        "${sentence}"
        
        Context before: "${contextBefore || ""}"
        Context after: "${contextAfter || ""}"
        Target Style: ${style || "natural"}
        
        Generate exactly 3 diverse, high-quality, fully original, humanized alternatives.
        
        Return strictly JSON in this schema:
        {
          "alternatives": ["Alternative 1", "Alternative 2", "Alternative 3"]
        }
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          alternatives: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 3 distinct rewrites of the sentence"
          }
        },
        required: ["alternatives"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          systemInstruction: "You are an advanced paraphrasing editor. Generate 3 natural humanized variations of the given sentence."
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from Gemini.");
      }

      const resultJson = JSON.parse(resultText);
      res.json(resultJson);

    } catch (error: any) {
      console.error("Rephrase API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during rephrasing." });
    }
  });

  // 1. Grammar Checker API
  app.post("/api/check-grammar", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing text parameter for grammar checking." });
      }

      const ai = getGeminiClient();

      const promptText = `
        Analyze the following text for grammar, spelling, punctuation, and stylistic issues.
        Correct the text, and return a structured JSON response identifying the specific issues found.
        
        Text to check:
        "${text}"
        
        Provide your output in strict JSON format matching the schema.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          correctedText: { type: Type.STRING },
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                replacement: { type: Type.STRING },
                type: { type: Type.STRING, description: "grammar, spelling, punctuation, or style" },
                explanation: { type: Type.STRING },
                context: { type: Type.STRING, description: "A brief phrase surrounding the issue" }
              },
              required: ["original", "replacement", "type", "explanation", "context"]
            }
          }
        },
        required: ["correctedText", "issues"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          systemInstruction: "You are an elite, highly meticulous proofreader and grammarian. Highlight and explain grammar, spelling, punctuation, or vocabulary style improvements."
        }
      });

      const resultText = response.text;
      if (!resultText) throw new Error("Empty response from Gemini.");
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.error("Grammar Checker API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during grammar checking." });
    }
  });

  // 2. AI Proofreader API
  app.post("/api/proofread", async (req, res) => {
    try {
      const { text, focus } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing text parameter for proofreading." });
      }

      const ai = getGeminiClient();

      const promptText = `
        Proofread and polish the following text, focusing on: ${focus || "clarity & natural flow"}.
        Enhance readability, vocabulary, flow, and professional voice without losing the user's core intent.
        
        Original Text:
        "${text}"
        
        Provide your output in strict JSON format matching the schema.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          proofreadText: { type: Type.STRING },
          changesSummary: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          clarityScoreBefore: { type: Type.INTEGER, description: "Clarity percentage estimation 0-100" },
          clarityScoreAfter: { type: Type.INTEGER, description: "Optimized clarity percentage estimation 0-100" },
          styleSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["proofreadText", "changesSummary", "clarityScoreBefore", "clarityScoreAfter", "styleSuggestions"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          systemInstruction: "You are an expert copyeditor specializing in academic and corporate proofreading. Improve tone, structure, and professional cadence."
        }
      });

      const resultText = response.text;
      if (!resultText) throw new Error("Empty response from Gemini.");
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.error("AI Proofreader API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during proofreading." });
    }
  });

  // 3. AI Translator API
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLang, tone } = req.body;
      if (!text || !targetLang) {
        return res.status(400).json({ error: "Missing text or targetLang parameters." });
      }

      const ai = getGeminiClient();

      const promptText = `
        Translate the following text into ${targetLang}.
        Target translation tone and styling: ${tone || "professional"}.
        Ensure the translation feels completely native and contextually fluent.
        
        Text to translate:
        "${text}"
        
        Provide your output in strict JSON format matching the schema.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          translatedText: { type: Type.STRING },
          linguisticNotes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-4 notes about translation choices, idiom adjustments, or nuances"
          },
          alternativePhrases: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-3 alternative phrases in the target language for key expressions"
          }
        },
        required: ["translatedText", "linguisticNotes", "alternativePhrases"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          systemInstruction: "You are an elite multilingual translator and localized copywriter. Deliver flawless, native-sounding translations with brief grammatical explanation insights."
        }
      });

      const resultText = response.text;
      if (!resultText) throw new Error("Empty response from Gemini.");
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.error("AI Translator API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during translation." });
    }
  });

  // 4. AI Reference Finder (Academic verifier with Google Search Grounding!)
  app.post("/api/find-references", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing text parameter for reference finding." });
      }

      const ai = getGeminiClient();

      const promptText = `
        Scan the following academic/scientific assertions or factual claims.
        Identify the main factual assertions that require citations or source validation.
        Use Google Search tool grounding to locate real, legitimate sources or academic publications supporting or verifying these claims.
        
        For each claim you analyze, suggest a citation and provide a real source title and its valid URL if found.
        
        Text to analyze:
        "${text}"
        
        Provide your output in strict JSON format matching the schema.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          verifiedClaims: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                claim: { type: Type.STRING },
                status: { type: Type.STRING, description: "verified, unverified, or disputed" },
                supportingEvidence: { type: Type.STRING, description: "Summary of research or search evidence" },
                suggestedSources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url: { type: Type.STRING },
                      citation: { type: Type.STRING, description: "Suggested citation string in academic style" }
                    },
                    required: ["title", "url", "citation"]
                  }
                }
              },
              required: ["claim", "status", "supportingEvidence", "suggestedSources"]
            }
          }
        },
        required: ["verifiedClaims"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          systemInstruction: "You are an elite academic peer-reviewer and factual verifier. Use the Google Search tool to look up real scholarly papers, news articles, and publications, verifying assertions and compiling accurate citations."
        }
      });

      const resultText = response.text;
      if (!resultText) throw new Error("Empty response from Gemini.");
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.error("AI Reference Finder API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during reference finding." });
    }
  });

  // 4.5 AI Citation Assistant (Scan for missing sources & unformatted references with APA/MLA/Chicago formats)
  app.post("/api/citation-assistant", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing text parameter for citation assistant." });
      }

      const ai = getGeminiClient();

      const promptText = `
        You are an elite academic editor. Scan the following text for two types of issues:
        1. "missing_source": Any factual assertions, statistical figures, scientific claims, or historical statements that are made without supporting citations.
        2. "unformatted_reference": Any informal, lazy, or raw inline citations or bibliographic references (e.g., "according to a 2021 study", "Smith said", "URL: www.example.com", or raw brackets) that are unformatted or not matching a formal style guide.

        For each issue detected, provide:
        - A short excerpt/claim from the text.
        - The type ("missing_source" or "unformatted_reference").
        - A concise description of the detected issue.
        - A highly accurate, fully reconstructed standard academic citation formatted in standard APA Style (7th ed.).
        - A highly accurate, fully reconstructed standard academic citation formatted in standard MLA Style (9th ed.).
        - A highly accurate, fully reconstructed standard academic citation formatted in standard Chicago Style (17th ed.).

        Text to analyze:
        "${text}"

        Provide your output in strict JSON format matching the schema. Do not include any markdown wrappers except the JSON itself.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          findings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                claimOrReference: { type: Type.STRING },
                type: { type: Type.STRING, description: "Must be 'missing_source' or 'unformatted_reference'" },
                detectedIssue: { type: Type.STRING },
                suggestedAPA: { type: Type.STRING },
                suggestedMLA: { type: Type.STRING },
                suggestedChicago: { type: Type.STRING }
              },
              required: ["claimOrReference", "type", "detectedIssue", "suggestedAPA", "suggestedMLA", "suggestedChicago"]
            }
          }
        },
        required: ["findings"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          systemInstruction: "You are an elite academic peer-reviewer and citation integrity officer. Identify citation issues and format perfect APA, MLA, and Chicago references."
        }
      });

      const resultText = response.text;
      if (!resultText) throw new Error("Empty response from Gemini.");
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.error("AI Citation Assistant API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during citation scanning." });
    }
  });

  // 5. AI Summarizer API
  app.post("/api/summarize", async (req, res) => {
    try {
      const { text, style, length } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing text parameter to summarize." });
      }

      const ai = getGeminiClient();

      const promptText = `
        Generate a summary of the following text.
        Summary style requested: ${style || "comprehensive"} (can be bullets, tldr, comprehensive, or structured).
        Summary length requested: ${length || "medium"} (short, medium, or long).
        
        Text to summarize:
        "${text}"
        
        Provide your output in strict JSON format matching the schema.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Main overview text" },
          keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          tldr: { type: Type.STRING, description: "A ultra-short 1-2 sentence TL;DR" },
          estimatedReadingTime: { type: Type.INTEGER, description: "Estimated reading time of the original text in minutes" },
          complexityScore: { type: Type.INTEGER, description: "Syntactic complexity rating from 1 to 10" }
        },
        required: ["summary", "keyTakeaways", "tldr", "estimatedReadingTime", "complexityScore"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          systemInstruction: "You are a senior executive editor. Extract the exact core value, summaries, key details, and TL;DRs with maximum precision and brevity."
        }
      });

      const resultText = response.text;
      if (!resultText) throw new Error("Empty response from Gemini.");
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.error("AI Summarizer API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during summarization." });
    }
  });

  // 6. AI Writing Assistant API
  app.post("/api/write-assistant", async (req, res) => {
    try {
      const { text, instruction, mode } = req.body;
      if (!text && !instruction) {
        return res.status(400).json({ error: "Missing text or instruction parameters for writing assistant." });
      }

      const ai = getGeminiClient();

      const promptText = `
        Act as a creative and intellectual partner. Help the user with their document draft based on the following instruction.
        
        Current Draft:
        "${text || ""}"
        
        User's Instruction/Prompt:
        "${instruction}"
        
        Assistant Mode: ${mode || "continue"} (can be continue, expand, outline, or rebuttal).
        
        Help write the next section, expand on their current point with stronger rhetoric, outline the next steps, or construct a robust academic rebuttal.
        
        Provide your output in strict JSON format matching the schema.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          generatedText: { type: Type.STRING, description: "The primary suggested text block" },
          alternatives: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2 shorter alternative angles or sentences"
          },
          outline: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Suggested structural breakdown or outline points for the section"
          }
        },
        required: ["generatedText", "alternatives", "outline"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          systemInstruction: "You are an elite collaborative writer and academic co-author. Expand drafts, write elegant follow-ups, outline structures, and strengthen critical arguments."
        }
      });

      const resultText = response.text;
      if (!resultText) throw new Error("Empty response from Gemini.");
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.error("AI Writing Assistant API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during assistance." });
    }
  });

  // Setup Vite development server or production static serving
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite development server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Plagiarism App Server is listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting Express fullstack server:", err);
});
