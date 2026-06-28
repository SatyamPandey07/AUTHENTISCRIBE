/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, FileText, Sparkles, BarChart2, History, Info } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasApiKey: boolean;
}

export default function Header({ activeTab, setActiveTab, hasApiKey }: HeaderProps) {
  const tabs = [
    { id: "SCANNER", label: "Detection Suite", icon: ShieldCheck },
    { id: "HUMANIZER", label: "Humanize Module", icon: Sparkles },
    { id: "ANALYTICS", label: "Linguistic Patterns", icon: BarChart2 },
    { id: "HISTORY", label: "Integrity Reports", icon: History },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center font-bold text-white font-sans text-lg">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 font-display">
                AUTHENTISCRIBE
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-bold">
                AI Integrity & Writing Suite
              </p>
            </div>
          </div>

          {/* Settings / API Key status */}
          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-wider border ${
                hasApiKey
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
              id="api-status"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${hasApiKey ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span>{hasApiKey ? "Connected" : "Key Needed"}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
