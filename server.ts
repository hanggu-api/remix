import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "30mb" }));

// Health check endpoint (checked by platform & reverse proxy)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Lazy initialize Gemini if available
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error("Failed to initialize Gemini client:", e);
    }
  }
  return aiClient;
}

// Endpoint to analyze service request (text, voice transcript, image descriptions)
app.post("/api/analyze-request", async (req, res) => {
  try {
    const { title, description, mediaType, imageBase64 } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `Você é o assistente de triagem inteligente da plataforma ProServiços.
Analise o pedido do cliente abaixo e extraia em JSON puro (sem formatação markdown extra):
- category: A categoria profissional mais adequada (escolha estritamente entre: "Eletricista", "Jardineiro", "Encanador", "Pintor", "Pedreiro", "Marceneiro", "Limpeza / Diarista", "Chaveiro", "Outros")
- serviceType: nome curto do serviço identificado (ex: "Troca de Lâmpada e Soquete", "Corte de Grama e Poda")
- urgency: "Baixa", "Média" ou "Alta"
- estimatedDuration: tempo estimado razoável (ex: "1 a 2 horas")
- requiredTools: lista de ferramentas/materiais prováveis necessários (array de strings)
- technicalSummary: resumo claro e objetivo para os profissionais entenderem o problema (máximo 2 frases)
- priceRangeEstimate: faixa de preço média de mercado no Brasil para esse serviço (ex: "R$ 80 - R$ 150")

Título informado pelo cliente: "${title || ''}"
Descrição/Áudio transcrito: "${description || ''}"
${imageBase64 ? "[O cliente anexou uma foto do problema]" : ""}`;

        const parts: any[] = [{ text: prompt }];

        if (imageBase64 && imageBase64.startsWith("data:image")) {
          const base64Data = imageBase64.split(",")[1];
          const mimeMatch = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        }

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: parts,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, analysis: parsed });
        }
      } catch (geminiError) {
        console.warn("Gemini analysis error, using fallback analyzer:", geminiError);
      }
    }

    // Smart heuristic fallback
    const fullText = `${title || ""} ${description || ""}`.toLowerCase();
    let category = "Eletricista";
    let serviceType = "Serviço Elétrico";
    let tools = ["Chave de fenda", "Multímetro", "Fita isolante"];
    let priceRange = "R$ 80 - R$ 160";

    if (fullText.includes("lâmpada") || fullText.includes("lampada") || fullText.includes("luz") || fullText.includes("tomada") || fullText.includes("disjuntor") || fullText.includes("fio") || fullText.includes("chuveiro")) {
      category = "Eletricista";
      serviceType = fullText.includes("lampada") || fullText.includes("lâmpada") ? "Troca de Lâmpada e Reator" : "Manutenção Elétrica";
      tools = ["Escada", "Lâmpadas adequadas", "Chave de teste", "Alicate"];
      priceRange = "R$ 70 - R$ 140";
    } else if (fullText.includes("grama") || fullText.includes("jardim") || fullText.includes("poda") || fullText.includes("árvore") || fullText.includes("planta")) {
      category = "Jardineiro";
      serviceType = "Corte de Grama e Manutenção de Jardim";
      tools = ["Cortador de grama", "Tesoura de poda", "Sacos de descarte", "Ancinho"];
      priceRange = "R$ 120 - R$ 250";
    } else if (fullText.includes("vazamento") || fullText.includes("torneira") || fullText.includes("cano") || fullText.includes("pia") || fullText.includes("ralo") || fullText.includes("descarga")) {
      category = "Encanador";
      serviceType = "Reparo Hidráulico e Desentupimento";
      tools = ["Chave grifo", "Fita veda rosca", "Vedações de reposição", "Desentupidor"];
      priceRange = "R$ 90 - R$ 190";
    } else if (fullText.includes("pintar") || fullText.includes("tinta") || fullText.includes("parede") || fullText.includes("massa")) {
      category = "Pintor";
      serviceType = "Pintura e Retoque de Paredes";
      tools = ["Rolos de lã", "Fita crepe", "Lixa", "Bandeja de tinta"];
      priceRange = "R$ 150 - R$ 350";
    } else if (fullText.includes("porta") || fullText.includes("móvel") || fullText.includes("armário") || fullText.includes("madeira")) {
      category = "Marceneiro";
      serviceType = "Ajuste ou Reparo de Marcenaria";
      tools = ["Parafusadeira", "Dobradiças", "Nível", "Trena"];
      priceRange = "R$ 100 - R$ 220";
    } else if (fullText.includes("fechadura") || fullText.includes("chave") || fullText.includes("tranca")) {
      category = "Chaveiro";
      serviceType = "Troca ou Abertura de Fechadura";
      tools = ["Michas", "Chaves de fenda", "Fechadura compatível"];
      priceRange = "R$ 90 - R$ 180";
    } else if (fullText.includes("limpeza") || fullText.includes("faxina") || fullText.includes("diarista")) {
      category = "Limpeza / Diarista";
      serviceType = "Higienização e Limpeza";
      tools = ["Produtos de limpeza", "Panos de microfibra", "Aspirador"];
      priceRange = "R$ 150 - R$ 250";
    }

    return res.json({
      success: true,
      analysis: {
        category,
        serviceType,
        urgency: fullText.includes("urgente") || fullText.includes("rápido") || fullText.includes("hoje") ? "Alta" : "Média",
        estimatedDuration: "1 a 3 horas",
        requiredTools: tools,
        technicalSummary: `Solicitação classificada como ${category} para ${serviceType}. Enviada para profissionais verificados da região.`,
        priceRangeEstimate: priceRange
      }
    });
  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message || "Erro ao analisar pedido" });
  }
});

// Vercel Postgres Database Health Status
app.get("/api/db-status", async (req, res) => {
  const isConfigured = !!process.env.POSTGRES_URL;
  res.json({
    status: "ok",
    vercelPostgresConnected: isConfigured,
    mode: isConfigured ? "vercel_postgres" : "in_memory_simulation",
    database: process.env.POSTGRES_DATABASE || "local_mock",
    host: process.env.POSTGRES_HOST ? "Neon / Vercel Cloud" : "localhost",
    message: isConfigured
      ? "Conexão com o Vercel Postgres ativa com sucesso!"
      : "Vercel Postgres pronto para conexão (basta vincular no painel da Vercel)."
  });
});

// Initialize Vercel Postgres schema
app.post("/api/init-db", async (req, res) => {
  try {
    if (!process.env.POSTGRES_URL) {
      return res.json({
        success: true,
        mode: "mock",
        message: "Modo de simulação ativo. Vincule um banco Vercel Postgres nas configurações da Vercel para persistência na nuvem."
      });
    }

    const { initVercelDatabase } = await import("./src/lib/db.js").catch(async () => await import("./src/lib/db"));
    const result = await initVercelDatabase();
    return res.json(result);
  } catch (err: any) {
    console.error("Database init error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Web Push API - Subscription endpoint
app.post("/api/notifications/subscribe", async (req, res) => {
  try {
    const handler = (await import("./api/notifications/subscribe.js").catch(async () => await import("./api/notifications/subscribe"))).default;
    return await handler(req, res);
  } catch (err: any) {
    console.error("Subscribe route error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Web Push API - Send notification endpoint
app.post("/api/notifications/send", async (req, res) => {
  try {
    const handler = (await import("./api/notifications/send.js").catch(async () => await import("./api/notifications/send"))).default;
    return await handler(req, res);
  } catch (err: any) {
    console.error("Send notification route error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Google Maps Grounding with Gemini 2.5 Flash
app.post("/api/maps-grounding", async (req, res) => {
  try {
    const { query, latitude = -23.5617, longitude = -46.6865 } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API não configurada" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query || "Quais são as melhores lojas de materiais elétricos, hidráulicos e de construção mais próximas de mim?",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: Number(latitude),
              longitude: Number(longitude)
            }
          }
        }
      }
    });

    const text = response.text || "";
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract place URLs and details as mandated by guidelines
    const places = rawChunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        title: chunk.maps.title || "Localização no Google Maps",
        uri: chunk.maps.uri || "",
        address: chunk.maps.address || "",
        rating: chunk.maps.rating || null,
        reviewSnippets: chunk.maps.placeAnswerSources?.reviewSnippets || []
      }));

    return res.json({
      success: true,
      text,
      places,
      groundingChunks: rawChunks
    });
  } catch (err: any) {
    console.error("Maps Grounding error:", err);
    return res.status(500).json({ error: err.message || "Erro no Maps Grounding" });
  }
});

// Audio Transcription using gemini-2.5-transcribe
app.post("/api/transcribe-audio", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "Áudio base64 obrigatório" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API não configurada" });
    }

    const cleanBase64 = audioBase64.includes(",") ? audioBase64.split(",")[1] : audioBase64;

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-transcribe",
      contents: {
        parts: [
          audioPart,
          { text: "Transcreva este áudio em português com máxima precisão. Retorne exclusivamente o texto falado." }
        ]
      }
    });

    return res.json({
      success: true,
      text: response.text ? response.text.trim() : ""
    });
  } catch (err: any) {
    console.error("Audio transcription error:", err);
    return res.status(500).json({ error: err.message || "Erro ao transcrever áudio" });
  }
});

// Multi-turn Gemini Chatbot with specific role system instructions
app.post("/api/gemini-chat", async (req, res) => {
  try {
    const { messages, modelChoice = "gemini-2.5-flash", roleType = "specialist" } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API não configurada" });
    }

    let systemInstruction = "Você é o assistente inteligente da plataforma ProServiços.";
    if (roleType === "specialist") {
      systemInstruction = `Você é o Engenheiro & Técnico Especialista da ProServiços. Responda dúvidas técnicas de clientes e prestadores sobre elétrica (norma NBR 5410), hidráulica, alvenaria, pintura e marcenaria. Indique ferramentas, cuidados de segurança, normas vigentes e recomende a contratação de profissionais verificados quando houver risco. Seja conciso, claro e cordial.`;
    } else if (roleType === "fast") {
      systemInstruction = `Você é o Atendente Rápido ProServiços. Dê respostas ultra-rápidas, dinâmicas e diretas ao ponto sobre serviços, dúvidas frequentes de contratação e valores médios.`;
    } else if (roleType === "inspector") {
      systemInstruction = `Você é o Perito de Qualidade e Garantia Técnica da ProServiços. Auxilie na verificação de conformidade de serviços, certificado de garantia legal de 90 dias (CDC) e emissão de recibos MEI.`;
    }

    let selectedModel = "gemini-2.5-flash";
    if (modelChoice === "gemini-2.5-pro") {
      selectedModel = "gemini-2.5-pro";
    } else if (modelChoice === "gemini-2.5-flash-lite" || roleType === "fast") {
      selectedModel = "gemini-2.5-flash-lite";
    }

    // Prepare multi-turn contents format
    const formattedContents = (messages || []).map((m: any) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content || m.text || "" }]
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction
      }
    });

    return res.json({
      success: true,
      text: response.text || "",
      modelUsed: selectedModel
    });
  } catch (err: any) {
    console.error("Gemini chat error:", err);
    return res.status(500).json({ error: err.message || "Erro no Gemini Chat" });
  }
});

// Start Express server and connect Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
