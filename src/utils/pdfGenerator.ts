/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from "jspdf";
import { AnalysisResult } from "../types";

/**
 * PDF Builder class to handle layout, styles, page breaks, and text wrapping
 * for a highly professional and structured AI Integrity PDF Report.
 */
class PDFReportBuilder {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 size height in mm
  private pageWidth: number = 210; // A4 size width in mm
  private margin: number = 15;
  private contentWidth: number = 180; // 210 - 2 * 15
  private primaryColor = { r: 13, g: 148, b: 136 }; // Teal-600: #0d9488
  private darkColor = { r: 15, g: 23, b: 42 }; // Slate-900: #0f172a
  private lightBgColor = { r: 248, g: 250, b: 252 }; // Slate-50: #f8fafc
  private borderColor = { r: 226, g: 232, b: 240 }; // Slate-200: #e2e8f0
  private redColor = { r: 225, g: 29, b: 72 }; // Rose-600
  private orangeColor = { r: 217, g: 119, b: 6 }; // Amber-600
  private greenColor = { r: 22, g: 163, b: 74 }; // Emerald-600

  private documentTitle: string;
  private pageCount: number = 1;

  constructor(documentTitle: string) {
    this.documentTitle = documentTitle || "Document Integrity Audit";
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    this.drawHeader(true);
  }

  /**
   * Safe margin check. Adds a new page if needed height exceeds page height.
   */
  private checkPageOverflow(neededHeight: number) {
    if (this.currentY + neededHeight > this.pageHeight - this.margin - 15) {
      this.drawFooter();
      this.doc.addPage();
      this.pageCount++;
      this.currentY = 20;
      this.drawHeader(false);
    }
  }

  /**
   * Draw the document brand header
   */
  private drawHeader(isFirstPage: boolean) {
    // Standard sleek top accent line
    this.doc.setFillColor(this.primaryColor.r, this.primaryColor.g, this.primaryColor.b);
    this.doc.rect(this.margin, 12, this.contentWidth, 1.5, "F");

    // Title and branding
    this.doc.setTextColor(this.darkColor.r, this.darkColor.g, this.darkColor.b);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(isFirstPage ? 16 : 12);
    this.doc.text("AUTHENTISCRIBE", this.margin, 22);

    this.doc.setTextColor(100, 116, 139); // slate-500
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7);
    this.doc.text("AI INTEGRITY & WRITING SUITE", this.margin, 26);

    // Dynamic title & date
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(71, 85, 105); // slate-600
    
    const cleanTitle = this.documentTitle.length > 40 
      ? this.documentTitle.substring(0, 37) + "..." 
      : this.documentTitle;

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    this.doc.text(cleanTitle, this.pageWidth - this.margin - this.doc.getTextWidth(cleanTitle), 21);
    this.doc.text(`Report Generated: ${dateStr}`, this.pageWidth - this.margin - this.doc.getTextWidth(`Report Generated: ${dateStr}`), 26);

    // Separator line
    this.doc.setDrawColor(this.borderColor.r, this.borderColor.g, this.borderColor.b);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, 30, this.pageWidth - this.margin, 30);

    this.currentY = 38;
  }

  /**
   * Draw bottom status and page numbers
   */
  private drawFooter() {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7);
    this.doc.setTextColor(148, 163, 184); // slate-400
    this.doc.text("AUTHENTISCRIBE DOCUMENT INTEGRITY REPORT - CONFIDENTIAL", this.margin, this.pageHeight - 10);
    this.doc.text(`Page ${this.pageCount}`, this.pageWidth - this.margin - this.doc.getTextWidth(`Page ${this.pageCount}`), this.pageHeight - 10);
  }

  /**
   * Adds text with proper wrapping and auto page flows
   */
  public addParagraph(text: string, fontSize: number = 9, isItalic: boolean = false, customColor?: {r: number, g: number, b: number}) {
    this.doc.setFont("helvetica", isItalic ? "italic" : "normal");
    this.doc.setFontSize(fontSize);
    
    if (customColor) {
      this.doc.setTextColor(customColor.r, customColor.g, customColor.b);
    } else {
      this.doc.setTextColor(51, 65, 85); // slate-700
    }

    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    const lineHeight = fontSize * 0.45; // mm per line approx

    lines.forEach((line: string) => {
      this.checkPageOverflow(lineHeight);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += lineHeight;
    });
    this.currentY += 2; // paragraph spacing
  }

  /**
   * Adds a section heading with nice styled background/accents
   */
  public addSectionHeading(title: string) {
    this.checkPageOverflow(14);
    
    this.currentY += 2;
    // Section header banner
    this.doc.setFillColor(this.lightBgColor.r, this.lightBgColor.g, this.lightBgColor.b);
    this.doc.rect(this.margin, this.currentY, this.contentWidth, 7, "F");
    
    // Vertical left bar
    this.doc.setFillColor(this.primaryColor.r, this.primaryColor.g, this.primaryColor.b);
    this.doc.rect(this.margin, this.currentY, 1.5, 7, "F");

    this.doc.setTextColor(this.darkColor.r, this.darkColor.g, this.darkColor.b);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.text(title.toUpperCase(), this.margin + 4, this.currentY + 4.8);

    this.currentY += 12;
  }

  /**
   * Render the beautifully organized Score Dashboard at top
   */
  public addMetricsDashboard(result: AnalysisResult) {
    this.checkPageOverflow(40);

    const boxWidth = (this.contentWidth - 9) / 4; // 4 boxes with 3mm gap
    const boxHeight = 22;
    const gap = 3;

    const metrics = [
      {
        title: "AUTHENTICITY",
        val: `${result.humanScore}%`,
        desc: "Linguistic Entropy",
        color: result.humanScore >= 75 ? this.greenColor : result.humanScore >= 45 ? this.orangeColor : this.redColor
      },
      {
        title: "AI DETECTED",
        val: `${result.aiScore}%`,
        desc: "Predictability Flow",
        color: result.aiScore < 25 ? this.greenColor : result.aiScore < 50 ? this.orangeColor : this.redColor
      },
      {
        title: "PLAGIARISM",
        val: `${result.plagiarismScore}%`,
        desc: "Matches Index",
        color: result.plagiarismScore < 15 ? this.greenColor : result.plagiarismScore < 40 ? this.orangeColor : this.redColor
      },
      {
        title: "READABILITY",
        val: `${result.readability.score}`,
        desc: result.readability.gradeLevel,
        color: this.primaryColor
      }
    ];

    metrics.forEach((m, idx) => {
      const x = this.margin + idx * (boxWidth + gap);
      const y = this.currentY;

      // Draw box border and light background
      this.doc.setDrawColor(this.borderColor.r, this.borderColor.g, this.borderColor.b);
      this.doc.setLineWidth(0.2);
      this.doc.setFillColor(this.lightBgColor.r, this.lightBgColor.g, this.lightBgColor.b);
      this.doc.rect(x, y, boxWidth, boxHeight, "FD");

      // Top colored bar to indicate score safety
      this.doc.setFillColor(m.color.r, m.color.g, m.color.b);
      this.doc.rect(x, y, boxWidth, 1.2, "F");

      // Metric title
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(6.5);
      this.doc.setTextColor(100, 116, 139); // slate-500
      this.doc.text(m.title, x + 2.5, y + 5);

      // Score value
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(14);
      this.doc.setTextColor(m.color.r, m.color.g, m.color.b);
      this.doc.text(m.val, x + 2.5, y + 13);

      // Score description
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(6);
      this.doc.setTextColor(148, 163, 184); // slate-400
      this.doc.text(m.desc, x + 2.5, y + 18.5);
    });

    this.currentY += boxHeight + 8;
  }

  /**
   * Adds secondary metrics detail row (Perplexity, Burstiness)
   */
  public addSecondaryMetrics(result: AnalysisResult) {
    this.checkPageOverflow(15);

    const w = this.contentWidth / 2 - 2;
    const y = this.currentY;

    // Perplexity Box
    this.doc.setDrawColor(this.borderColor.r, this.borderColor.g, this.borderColor.b);
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(this.margin, y, w, 14, "FD");
    
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(71, 85, 105); // slate-600
    this.doc.text(`Perplexity (Lexical Entropy): ${result.readability.perplexity} / 100`, this.margin + 3, y + 5.5);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(6.5);
    this.doc.setTextColor(148, 163, 184); // slate-400
    this.doc.text("Higher values reflect human-like randomized vocabulary choice.", this.margin + 3, y + 10);

    // Burstiness Box
    const x2 = this.margin + w + 4;
    this.doc.rect(x2, y, w, 14, "FD");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(71, 85, 105); // slate-600
    this.doc.text(`Burstiness (Structural Variance): ${result.readability.burstiness} / 100`, x2 + 3, y + 5.5);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(6.5);
    this.doc.setTextColor(148, 163, 184); // slate-400
    this.doc.text("Measures sentence structural variety. Standard AI writing scores low (< 25).", x2 + 3, y + 10);

    this.currentY += 20;
  }

  /**
   * Detailed sentence-by-sentence analysis cards
   */
  public addFlaggedSentencesList(result: AnalysisResult) {
    const flagged = result.sentences.filter(s => s.category !== "human");
    if (flagged.length === 0) {
      this.addParagraph("✓ No flagged sentences. The linguistic composition of your document is organically balanced and matches human distribution indexes perfectly.", 9, true, this.greenColor);
      return;
    }

    flagged.forEach((sentence, idx) => {
      this.checkPageOverflow(32);

      const isAi = sentence.category === "ai";
      const probability = isAi ? sentence.aiProbability : sentence.plagiarismProbability;
      const typeLabel = isAi ? "AI Indicator" : "Plagiarism Flag";
      const themeColor = isAi ? this.redColor : this.orangeColor;

      const cardY = this.currentY;
      const cardHeight = 24 + (sentence.suggestions.length > 0 ? 12 : 0);

      // Card container background
      this.doc.setFillColor(this.lightBgColor.r, this.lightBgColor.g, this.lightBgColor.b);
      this.doc.setDrawColor(this.borderColor.r, this.borderColor.g, this.borderColor.b);
      this.doc.rect(this.margin, cardY, this.contentWidth, cardHeight, "FD");

      // Colored Indicator Left Border
      this.doc.setFillColor(themeColor.r, themeColor.g, themeColor.b);
      this.doc.rect(this.margin, cardY, 1.2, cardHeight, "F");

      // Badge header
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(themeColor.r, themeColor.g, themeColor.b);
      this.doc.text(`FLAGGED PHRASE #${idx + 1} (${typeLabel}: ${probability}%)`, this.margin + 4, cardY + 5);

      // Sentence text
      this.doc.setFont("helvetica", "italic");
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(51, 65, 85); // slate-700
      
      const textToSize = `"${sentence.text}"`;
      const textLines = this.doc.splitTextToSize(textToSize, this.contentWidth - 10);
      let textY = cardY + 9;
      textLines.slice(0, 2).forEach((line: string) => {
        this.doc.text(line, this.margin + 4, textY);
        textY += 3.8;
      });

      // Suggested Improvements
      if (sentence.suggestions && sentence.suggestions.length > 0) {
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(7);
        this.doc.setTextColor(13, 148, 136); // Teal-600
        this.doc.text("RECOMMENDED HUMAN REPHRASE:", this.margin + 4, cardY + 18.5);

        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(8);
        this.doc.setTextColor(30, 41, 59); // slate-800
        const recText = `"${sentence.suggestions[0]}"`;
        const recLines = this.doc.splitTextToSize(recText, this.contentWidth - 10);
        this.doc.text(recLines[0] || "", this.margin + 4, cardY + 22);
      }

      this.currentY += cardHeight + 4;
    });
  }

  /**
   * Academic citations list table
   */
  public addCitationsTable(result: AnalysisResult) {
    if (!result.citationSuggestions || result.citationSuggestions.length === 0) {
      this.addParagraph("✓ All statistics and scholarly statements are fully cited. No missing citations flags detected.", 9, true, this.greenColor);
      return;
    }

    result.citationSuggestions.forEach((cite, idx) => {
      this.checkPageOverflow(34);

      const itemY = this.currentY;

      this.doc.setFillColor(255, 255, 255);
      this.doc.setDrawColor(this.borderColor.r, this.borderColor.g, this.borderColor.b);
      this.doc.rect(this.margin, itemY, this.contentWidth, 26, "FD");

      // Side flag decoration
      this.doc.setFillColor(this.primaryColor.r, this.primaryColor.g, this.primaryColor.b);
      this.doc.rect(this.margin, itemY, 1, 26, "F");

      // Citation statement info
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(15, 23, 42); // slate-900
      this.doc.text(`CITATION TRIGGER #${idx + 1}`, this.margin + 3, itemY + 4.5);

      this.doc.setFont("helvetica", "italic");
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 116, 139); // slate-500
      const lines = this.doc.splitTextToSize(`Statement: "${cite.statement}"`, this.contentWidth - 10);
      this.doc.text(lines[0] || "", this.margin + 3, itemY + 8.5);

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(51, 65, 85); // slate-700
      this.doc.text(`Reason: ${cite.reason}`, this.margin + 3, itemY + 12.8);

      // Style options
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7);
      this.doc.setTextColor(13, 148, 136); // Teal-600
      this.doc.text("APA FORM:", this.margin + 3, itemY + 17.5);
      this.doc.text("MLA FORM:", this.margin + 3, itemY + 22.5);

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(30, 41, 59); // slate-800
      
      const apaTruncated = cite.apa.length > 80 ? cite.apa.substring(0, 77) + "..." : cite.apa;
      const mlaTruncated = cite.mla.length > 80 ? cite.mla.substring(0, 77) + "..." : cite.mla;

      this.doc.text(apaTruncated, this.margin + 18, itemY + 17.5);
      this.doc.text(mlaTruncated, this.margin + 18, itemY + 22.5);

      this.currentY += 30;
    });
  }

  /**
   * Final original text snapshot appendix
   */
  public addFullTextAppendix(originalText: string) {
    if (!originalText) return;
    this.addParagraph(originalText, 8.5, false, { r: 71, g: 85, b: 105 });
  }

  /**
   * Save and trigger browser download
   */
  public downloadReport() {
    this.drawFooter();
    
    // Clean string name
    const sanitizedTitle = this.documentTitle
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()
      .substring(0, 30);
    
    this.doc.save(`authentiscribe_audit_${sanitizedTitle}.pdf`);
  }
}

/**
 * Main exportable function to generate and download the PDF report of analysis results.
 */
export function exportAnalysisToPDF(result: AnalysisResult, documentTitle: string = "AI Integrity Audit", originalText: string = "") {
  try {
    const builder = new PDFReportBuilder(documentTitle);

    // Section 1: Executive metrics
    builder.addSectionHeading("1. Executive Integrity metrics");
    builder.addMetricsDashboard(result);
    builder.addSecondaryMetrics(result);

    // Section 2: Sentence-by-sentence analysis & rephrase suggestions
    builder.addSectionHeading("2. AI & Plagiarism Sentence audit");
    builder.addFlaggedSentencesList(result);

    // Section 3: Citation index highlights
    builder.addSectionHeading("3. Factual Verification & Citation Recommendations");
    builder.addCitationsTable(result);

    // Section 4: Full original text snapshot
    if (originalText.trim()) {
      builder.addSectionHeading("Appendix: Audited Plaintext Snapshot");
      builder.addFullTextAppendix(originalText);
    }

    // Download!
    builder.downloadReport();
    return true;
  } catch (error) {
    console.error("Failed to generate and export PDF report:", error);
    throw error;
  }
}
