import { useState, useRef } from "react";
import { Loader2, Copy, Check, PenTool, ClipboardList, Briefcase, FileText } from "lucide-react";
import Markdown from "react-markdown";

export default function KPIGenerator() {
  const [role, setRole] = useState("");
  const [tasks, setTasks] = useState("");
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!role.trim() || !tasks.trim()) {
      setError("职位和工作内容不可为空。");
      return;
    }
    setError("");
    setIsLoading(true);
    setReport("");
    
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, tasks }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report");
      }
      
      setReport(data.report);
    } catch (err: any) {
      setError(err.message || "生成失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = report;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Input Section */}
      <div className="lg:col-span-5 flex flex-col gap-6 bg-white p-6 shadow-sm border border-slate-200 rounded-xl relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl" />
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              当前职位 (职位或角色)
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="例如：后端研发工程师 / 运营专员"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-slate-50 focus:bg-white outline-none disabled:opacity-50 text-slate-800"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-500" />
              本周零碎工作内容
            </label>
            <textarea
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder="例如：修了5个bug、开了3次对齐会、写了首页的接口、帮客服查了几个线上的数据问题..."
              disabled={isLoading}
              rows={8}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-slate-50 focus:bg-white outline-none resize-none disabled:opacity-50 text-slate-800 text-sm leading-relaxed"
            />
            <p className="text-xs text-slate-500 mt-1">越详细越好，剩下的交给 AI 包装。</p>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isLoading || !role || !tasks}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              正在为您进行专业包装...
            </>
          ) : (
            <>
              <PenTool className="w-5 h-5" />
              一键生成专业周报
            </>
          )}
        </button>
      </div>

      {/* Output Section */}
      <div className="lg:col-span-7 bg-white p-6 shadow-sm border border-slate-200 rounded-xl min-h-[500px] flex flex-col relative group">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800">周报预览 / OKR 包装结果</h2>
          </div>
          
          <button
            onClick={handleCopy}
            disabled={!report || isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm
              \${
                !report || isLoading
                  ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                  : copied
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
              }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制，可直接粘贴至飞书
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制至飞书 (Markdown)
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <p className="animate-pulse">正在深度分析工作颗粒度，对齐底层逻辑...</p>
            </div>
          ) : report ? (
            <div className="prose prose-slate prose-sm text-slate-700 max-w-none">
              <Markdown>{report}</Markdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-2 shadow-inner">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-500 text-lg">暂无汇报内容</p>
              <p className="text-sm">在左侧填写内容后，点击生成按钮</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
