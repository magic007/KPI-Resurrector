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
  const [lengthLevel, setLengthLevel] = useState("short");
  const [personality, setPersonality] = useState("沉稳务实");
  const [customPersonality, setCustomPersonality] = useState("");

  const personalityOptions = ["沉稳务实", "积极进取", "细致严谨", "高效干练", "谦逊复盘", "协作担当", "创新思考", "其他"];

  const quickTemplates = [
    {
      label: "技术开发类",
      role: "后端研发工程师",
      tasks: "修了5个历史遗留bug，优化了数据库查询性能；开了3次需求对齐会，确定了下个版本的技术方案；完成了首页的新增接口开发；配合测试排查了几个线上的数据异常问题。"
    },
    {
      label: "产品运营类",
      role: "用户运营专员",
      tasks: "发了3篇公众号推文，策划了周末的促活抽奖活动并上线；处理了每天大概几十个用户的投诉工单；和产研开了会讨论新功能的用户反馈；拉了上周的数据报表写了总结。"
    },
    {
      label: "设计创意类",
      role: "UI/UX 设计师",
      tasks: "做完了营销大促活动的20张各种尺寸宣传海报；和开发对了下新版个人中心页面的视觉稿，改了几个组件的间距和颜色；参加了设计规范系统的评审会并记录了反馈。"
    }
  ];

  const applyTemplate = (template: { role: string, tasks: string }) => {
    setRole(template.role);
    setTasks(template.tasks);
  };

  const handleGenerate = async () => {
    if (!role.trim() || !tasks.trim()) {
      setError("职位和工作内容不可为空。");
      return;
    }
    setError("");
    setIsLoading(true);
    setReport("");
    
    try {
      const activePersonality = personality === "其他" ? customPersonality : personality;
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, tasks, lengthLevel, personality: activePersonality }),
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-500" />
                本周零碎工作内容
              </label>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="text-xs text-slate-500 py-1 mr-1">快捷模板:</span>
              {quickTemplates.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => applyTemplate(item)}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors border border-blue-100 disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>

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

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              汇报性格与风格 (去AI味)
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {personalityOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPersonality(opt)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
                    personality === opt
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  } disabled:opacity-50`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {personality === "其他" && (
              <input
                type="text"
                value={customPersonality}
                onChange={(e) => setCustomPersonality(e.target.value)}
                placeholder="请输入自定义性格，如：幽默风趣、数据驱动..."
                disabled={isLoading}
                className="w-full mt-2 px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-slate-50 focus:bg-white outline-none text-sm disabled:opacity-50"
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              生成结果长度
            </label>
            <div className="flex items-center gap-4 mt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="lengthLevel"
                  value="short"
                  checked={lengthLevel === "short"}
                  onChange={(e) => setLengthLevel(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                较短 (极简，一句话总结)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors">
                <input
                  type="radio"
                  name="lengthLevel"
                  value="long"
                  checked={lengthLevel === "long"}
                  onChange={(e) => setLengthLevel(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                较长 (点到为止)
              </label>
            </div>
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
