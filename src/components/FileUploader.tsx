/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface FileUploaderProps {
  onFileLoaded: (text: string, fileData?: { data: string; name: string; type: string }) => void;
  onClear: () => void;
  stagedFile: { name: string; size: number; type: string } | null;
}

export default function FileUploader({ onFileLoaded, onClear, stagedFile }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsParsing(true);
    setError(null);
    try {
      const fileType = file.type || "";
      const fileName = file.name;

      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        // PDF files will be sent directly to Gemini as base64 bytes
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(",")[1];
          onFileLoaded("", {
            data: base64String,
            name: fileName,
            type: "application/pdf"
          });
          setIsParsing(false);
        };
        reader.onerror = () => {
          throw new Error("Failed to read PDF file bytes.");
        };
        reader.readAsDataURL(file);
        
      } else if (fileName.endsWith(".docx") || fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Send Word files to Express backend for extraction using mammoth
        const reader = new FileReader();
        reader.onload = async () => {
          const base64String = (reader.result as string).split(",")[1];
          try {
            const res = await fetch("/api/extract-text", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileData: base64String })
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || "Failed to parse Word file on server");
            }

            const data = await res.json();
            onFileLoaded(data.text, {
              data: base64String,
              name: fileName,
              type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            });
          } catch (err: any) {
            setError(err.message || "Failed to convert Word file to text.");
          } finally {
            setIsParsing(false);
          }
        };
        reader.readAsDataURL(file);

      } else if (fileType.startsWith("text/") || fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".json")) {
        // Read text files locally
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          onFileLoaded(text);
          setIsParsing(false);
        };
        reader.onerror = () => {
          throw new Error("Failed to read text file.");
        };
        reader.readAsText(file);
      } else {
        throw new Error("Unsupported file type. Please upload a .txt, .md, .pdf, or .docx file.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading your file.");
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="w-full" id="file-uploader-container">
      {stagedFile ? (
        <div className="border border-slate-200 bg-slate-50/50 rounded p-4 flex items-center justify-between" id="staged-file-info">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-sm border border-indigo-100 flex-shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate font-sans">{stagedFile.name}</p>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                {stagedFile.type === "application/pdf" ? "PDF Bytes • Ready for AI Scan" : formatSize(stagedFile.size)}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClear();
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-slate-400 hover:text-rose-600 p-2 rounded hover:bg-rose-50 transition-colors cursor-pointer"
            title="Remove document"
            id="remove-file-btn"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/20"
              : "border-slate-200 hover:border-indigo-500 hover:bg-slate-50/50"
          }`}
          id="dropzone"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.md,.pdf,.docx"
            className="hidden"
            id="file-input-raw"
          />

          {isParsing ? (
            <div className="flex flex-col items-center justify-center py-4" id="parsing-file-loader">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono">Processing document...</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">Extracting plain text metadata & formatting</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="bg-slate-50 text-slate-600 p-3 rounded-sm border border-slate-100 mb-3">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono">
                Drag & drop document or <span className="text-indigo-600 underline decoration-2 cursor-pointer">browse</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-2 uppercase font-mono tracking-wider">
                PDF, DOCX, TXT, or MD • max 10MB
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start space-x-2 bg-rose-50 text-rose-800 p-3 rounded border border-rose-150 text-xs" id="file-uploader-error">
          <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="font-mono text-[10px] uppercase font-bold text-rose-700">
            <span>File Error: </span>
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
