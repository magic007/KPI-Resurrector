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
      const { role, tasks } = req.body;

      if (!role || !tasks) {
        return res.status(400).json({ error: "Role and tasks are required." });
      }

      const prompt = `你是一个深谙大厂黑话、互联网思维和 OKR 管理体系的资深职场导师。
请帮我把本周的零碎工作任务，包装成高级的、结构化的周报汇报内容。

我的职位：${role}
本周零碎工作：${tasks}

要求：
1. 使用专业的职场词汇（如：赋能、颗粒度、对齐、底层逻辑、闭环、抓手、沉淀等，恰当自然地使用）。
2. 将零碎的事务归纳到1-3个核心的 OKR (Objectives and Key Results) 框架下。每个 OKR 包含 Objective (目标) 和几个 Key Results (关键结果，带上量化预估或具体价值输出)。
3. 提供“复盘要点”，总结本周工作的亮点与不足。
4. 生成合理的“下周计划”。
5. 整体使用 Markdown 格式输出，排版清晰美观，便于直接阅读。

输出结构：
# 本周工作汇报
[一段简短的高级总结]

## 一、核心 OKR 及达成情况
[列出 1-3 个 OKR，将零碎工作包装进去]

## 二、复盘要点 (亮点与不足)
[分别列出亮点与可改进的不足之处]

## 三、下周工作计划
[基于本周工作，推导出下周的合理计划]`;

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
