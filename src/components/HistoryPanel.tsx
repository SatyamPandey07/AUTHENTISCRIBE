/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { SavedScan, SavedHumanization } from "../types";
import { History, ShieldCheck, Sparkles, Trash2, ChevronRight, FileText, Calendar } from "lucide-react";

interface HistoryPanelProps {
  scans: SavedScan[];
  humanizations: SavedHumanization[];
  onLoadScan: (scan: SavedScan) => void;
  onLoadHumanization: (hum: SavedHumanization) => void;
  onDeleteScan: (id: string) => void;
  onDeleteHumanization: (id: string) => void;
}

export default function HistoryPanel({
  scans,
  humanizations,
  onLoadScan,
  onLoadHumanization,
  onDeleteScan,
  onDeleteHumanization
}: HistoryPanelProps) {
  
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6" id="history-repository-root">
      
      {/* Introduction */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-sm" id="history-intro">
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono flex items-center space-x-2">
            <History className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span>Saved Repository & Drafts</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
            Your document audits and humanized versions are securely persisted in your local workspace. Restore them into the live scanners at any time.
          </p>
        </div>
      </div>

      {/* Dual Repository Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="repository-grid">
        
        {/* Past Audits & Scans list */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4" id="past-audits-panel">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono">
              Saved Originality Audits ({scans.length})
            </h3>
          </div>

          {scans.length > 0 ? (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 animate-fade-in" id="scans-list-container">
              {scans.map((scan) => (
                <div 
                  key={scan.id}
                  className="border border-slate-150 hover:border-slate-300 p-3.5 rounded bg-slate-50/40 hover:bg-white flex justify-between items-center transition-all group"
                >
                  <div className="min-w-0 space-y-1 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate font-sans">{scan.title}</p>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(scan.timestamp)}</span>
                      </span>
                      <span className="text-emerald-600">Score: {scan.result.humanScore}% human</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onLoadScan(scan)}
                      className="px-3 py-1.5 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
                      title="Load audit back into workspace"
                    >
                      <span>Restore</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onDeleteScan(scan.id)}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded" id="empty-scans-repo">
              <FileText className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs font-bold font-mono uppercase tracking-widest text-slate-600">No Audits Saved</p>
              <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto mt-2 leading-relaxed">
                Your future PDF, Word, or plain text document scans will automatically save here.
              </p>
            </div>
          )}
        </div>

        {/* Past Humanizations list */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-4" id="past-humanizations-panel">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 font-mono">
              Humanized Notes Drafts ({humanizations.length})
            </h3>
          </div>

          {humanizations.length > 0 ? (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 animate-fade-in" id="humanizations-list-container">
              {humanizations.map((hum) => (
                <div 
                  key={hum.id}
                  className="border border-slate-150 hover:border-slate-300 p-3.5 rounded bg-slate-50/40 hover:bg-white flex justify-between items-center transition-all group"
                >
                  <div className="min-w-0 space-y-1 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate font-sans">{hum.title}</p>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(hum.timestamp)}</span>
                      </span>
                      <span className="text-indigo-600">{hum.result.style} tone</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onLoadHumanization(hum)}
                      className="px-3 py-1.5 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
                      title="Load into humanize board"
                    >
                      <span>Restore</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onDeleteHumanization(hum.id)}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Delete draft"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded" id="empty-humanizations-repo">
              <Sparkles className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs font-bold font-mono uppercase tracking-widest text-slate-600">No Draft Notes Saved</p>
              <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto mt-2 leading-relaxed">
                When you run the Machine-to-Human converter, drafts are captured and archived here.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
