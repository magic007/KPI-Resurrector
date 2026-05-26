import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to generate KPI report
  app.post("/api/generate-report", async (req, res) => {
    try {
      const { role, tasks, lengthLevel, personality } = req.body;

      if (!role || !tasks) {
        return res.status(400).json({ error: "Role and tasks are required." });
      }

      let lengthInstructions = "";
      if (lengthLevel === "short") {
        lengthInstructions = "要求内容精炼、单刀直入、极简汇报。删除冗冗的排比，重在极简归纳并量化成果和展现核心价值。";
      } else {
        lengthInstructions = "要求内容详实、逻辑严密、多维展开。对关键要点进行深度剖析、充分包装和润色，多维度体现业务厚度和底层思考。";
      }

      let personalityInstructions = "";
      if (personality) {
        personalityInstructions = `汇报语气与风格：请采用 “${personality}” 的风格。将其融入表达、措辞中，避免机械呆板，使报告看起来是一个具有该特质的真实职场专业人员所写。`;
      }

      const prompt = `你是一个深谙大厂黑话、互联网思维和 OKR 管理体系的资深职场导师。
请帮我把本周的零碎工作任务，包装成高级的、结构化的周报汇报内容。

我的职位：${role}
本周零碎工作：${tasks}

定制化风格与要求：
- ${lengthInstructions}
- ${personalityInstructions}

核心要求：
1. 自然且高技巧性地使用专业职场或大厂高品质词汇（如：赋能、颗粒度、对齐、底层逻辑、闭环、抓手、沉淀等，不要生搬硬套，注重契合语境）。
2. 将零碎的事务分类并包装归纳到 1-3 个核心的 OKR (Objectives and Key Results) 框架下。每个 OKR 应当包含明确的 Objective (目标) 以及几条对应的 Key Results (关键结果，包含可量化/可预估的产出指标或具体交付物)。
3. 提供“复盘要点”或分析，总结本周工作的亮点与可以精进的不足之处。
4. 生成配套合理的“下周工作计划”，展现前瞻性与前后期承接性。
5. 整体使用纯正、规范的 Markdown 格式输出，排版清晰美观，便于一键复制或直接导入飞书文档进行顺畅阅读。

输出结构规范：
# 本周工作汇报
[一篇非常专业的高质量高级总结，言简意赅，体现格局与战略视野]

## 一、核心 OKR 及达成情况
[列出 1-3 个 OKR，将零碎工作完美包装进去，列出 Objective 与 Key Results]

## 二、工作复盘 (亮点与改进)
- **核心亮点**：[指出 1-2 个亮点及对应的业务价值]
- **改进方向**：[诚恳且高级的改进意见，展现自驱反思力]

## 三、下周工作计划
[基于本周工作推导，有条理、分缓急地做出计划安排]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "你是一个专业的职场周报与KPI包装助手。",
          temperature: 0.7,
        }
      });

      const reportText = response.text;
      
      res.json({ report: reportText });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:\${PORT}`);
  });
}

startServer();
