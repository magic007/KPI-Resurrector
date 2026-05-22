/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import KPIGenerator from "./components/KPIGenerator";
import { TrendingUp } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                KPI 续命器
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                职场黑话包装 · OKR 智能推导 · 一键飞书导出
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-10">
        <KPIGenerator />
      </main>

      <footer className="text-center py-8 text-sm text-slate-400">
        <div className="max-w-6xl mx-auto border-t border-slate-200 pt-8">
          <p>赋能职场，打破内卷边界。 Powered by Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}
