/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, Maximize2, Minimize2, ExternalLink, Download, AlertCircle, Info, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PDFPreviewProps {
  stagedFile: {
    name: string;
    size: number;
    type: string;
    data?: string;
  };
}

export default function PDFPreview({ stagedFile }: PDFPreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stagedFile.data) {
      setError("No document data found for PDF preview.");
      return;
    }

    try {
      setError(null);
      // Clean up previous blob URL if any
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      // Convert base64 to binary
      const binaryString = atob(stagedFile.data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create Blob and URL
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (err: any) {
      console.error("PDF Blob generation error:", err);
      setError("Failed to generate PDF preview from uploaded document bytes.");
    }

    // Cleanup on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [stagedFile.data]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = stagedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (error) {
    return (
      <div className="border border-rose-200 bg-rose-50/50 p-6 rounded flex items-start space-x-3 text-slate-800" id="pdf-preview-error-box">
        <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold uppercase font-mono tracking-wider text-[9px] text-rose-700 block">Preview Generator Failed</span>
          <p className="text-xs text-rose-800 font-sans mt-1 leading-relaxed">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="border border-slate-200 bg-slate-50/50 p-12 rounded flex flex-col items-center justify-center space-y-3" id="pdf-preview-loading">
        <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">Preparing PDF preview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" id="pdf-preview-container">
      {/* Header bar */}
      <div className="bg-slate-900 text-white rounded-t px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800" id="pdf-preview-toolbar">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="bg-rose-500/10 text-rose-400 p-1.5 rounded border border-rose-500/25 flex-shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-widest block">PDF Document Preview</span>
            <span className="text-xs font-bold font-sans truncate block text-slate-200" title={stagedFile.name}>
              {stagedFile.name}
            </span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-1.5 self-end sm:self-auto">
          <a
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors flex items-center space-x-1 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer"
            title="Open in new window / printing layout"
            id="pdf-open-new-tab-btn"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Open Native</span>
          </a>
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors flex items-center space-x-1 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer"
            title="Download PDF document copy"
            id="pdf-download-btn"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Download</span>
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors flex items-center space-x-1 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer"
            title="Maximize PDF layout to full screen"
            id="pdf-maximize-btn"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Full Screen</span>
          </button>
        </div>
      </div>

      {/* Main preview box */}
      <div className="border-x border-b border-slate-200 rounded-b bg-slate-100 overflow-hidden relative" id="pdf-iframe-container" style={{ height: "460px" }}>
        <iframe
          src={`${blobUrl}#toolbar=1`}
          title={`PDF Preview: ${stagedFile.name}`}
          className="w-full h-full border-none"
          id="pdf-preview-iframe"
        />

        {/* Informative helper bottom band */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs border border-slate-200 p-2.5 rounded shadow-md flex items-start space-x-2 text-slate-600 text-[10px] pointer-events-none md:pointer-events-auto select-none font-sans leading-relaxed">
          <Info className="h-3.5 w-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
          <p>
            This is a local secure preview of <strong className="text-slate-800">{stagedFile.name}</strong> before submission. Hover the top margin of the PDF viewport to access built-in navigation, pagination, or zoom controls.
          </p>
        </div>
      </div>

      {/* Fullscreen Modal Portal using Framer Motion */}
      <AnimatePresence>
        {isFullscreen && (
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            id="pdf-preview-fullscreen-overlay"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-lg shadow-2xl w-full h-[90vh] max-w-6xl flex flex-col overflow-hidden text-slate-900"
              onClick={(e) => e.stopPropagation()}
              id="pdf-preview-fullscreen-dialog"
            >
              {/* Fullscreen Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800" id="fullscreen-pdf-header">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="bg-rose-500/10 text-rose-400 p-1.5 rounded border border-rose-500/25 flex-shrink-0 animate-pulse">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-widest block">Interactive Document Reviewer</span>
                    <h3 className="text-sm font-bold font-sans truncate text-slate-200" title={stagedFile.name}>
                      {stagedFile.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-755 text-slate-200 hover:text-white rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Native Tab</span>
                  </a>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-755 text-slate-200 hover:text-white rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Copy</span>
                  </button>
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 rounded-full transition-colors cursor-pointer"
                    title="Close Full Screen"
                    id="pdf-close-fullscreen-btn"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Fullscreen Iframe Viewport */}
              <div className="flex-1 bg-slate-100 p-4" id="fullscreen-pdf-iframe-container">
                <iframe
                  src={`${blobUrl}#toolbar=1`}
                  title={`Fullscreen PDF Preview: ${stagedFile.name}`}
                  className="w-full h-full rounded border border-slate-250 shadow-inner"
                  id="pdf-preview-fullscreen-iframe"
                />
              </div>

              {/* Fullscreen Footer */}
              <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-t border-slate-150 text-[10px] text-slate-400 font-mono" id="fullscreen-pdf-footer">
                <span>File Size: {stagedFile.size > 0 ? `${(stagedFile.size / 1024).toFixed(1)} KB` : "Extracted Bytes"}</span>
                <span>Press ESC or click outside to exit reviewer mode</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
