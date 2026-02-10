
import { GoogleGenAI, Type } from "@google/genai";
import { ServiceOrder, PredictionRisk, DetailedAIReport, ActionPlan5W2H } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Função robusta para limpar e extrair JSON de respostas da IA.
 * Remove blocos de código Markdown e encontra os limites do objeto/array JSON.
 */
const cleanJsonString = (str: string) => {
  if (!str) return "{}";
  
  try {
    // 1. Remove formatação de código Markdown
    let cleaned = str.replace(/```json/g, "").replace(/```/g, "");
    
    // 2. Encontra o início e fim do JSON (Objeto ou Array)
    const firstOpenBrace = cleaned.indexOf('{');
    const firstOpenBracket = cleaned.indexOf('[');
    
    let startIndex = -1;
    let endIndex = -1;

    // Determina se começa com { ou [
    if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
        startIndex = firstOpenBrace;
        endIndex = cleaned.lastIndexOf('}') + 1;
    } else if (firstOpenBracket !== -1) {
        startIndex = firstOpenBracket;
        endIndex = cleaned.lastIndexOf(']') + 1;
    }

    // Se encontrou limites válidos, extrai apenas o JSON
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        return cleaned.substring(startIndex, endIndex);
    }
    
    return cleaned.trim();
  } catch (e) {
    console.error("Erro ao limpar JSON da IA:", e);
    return "{}"; // Retorna objeto vazio seguro em caso de falha crítica
  }
};

export const getEducationalTeaching = async (query: string, history: { role: 'user' | 'model'; text: string }[] = []) => {
  const ai = getAI();
  const chatHistory = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [...chatHistory, { role: 'user', parts: [{ text: query }] }],
    config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `Você é o Mentor Industrial Sênior da Aviagen. Use Google Search para validar normas NRs atuais. Responda de forma didática e técnica.`
    }
  });

  let output = response.text || "";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    output += "\n\n**Fontes Técnicas (Web):**\n";
    chunks.forEach((c: any) => { if (c.web) output += `- [${c.web.title}](${c.web.uri})\n`; });
  }
  return output;
};

export const getPredictiveMaintenance = async (orders: ServiceOrder[]): Promise<PredictionRisk[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analise o histórico de ordens de serviço. Identifique padrões de falha. Retorne APENAS um array JSON válido (sem markdown, sem texto extra) contendo objetos com os campos: equipment (string), riskLevel (Baixo, Médio, Alto, Crítico), probability (number 0.0-1.0), recommendation (string), estimatedSaving (number), sector (string). Dados: ${JSON.stringify(orders.slice(-50))}`,
    config: { 
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};

export const parseExcel5W2H = async (fileName: string, data: any[]): Promise<Partial<ActionPlan5W2H>[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Mapeie os dados desta planilha para um array de objetos JSON 5W2H. Campos obrigatórios: what (o que), why (por que), where (onde), when (quando/prazo), who (quem), how (como), howMuch (quanto/custo number). Retorne APENAS o JSON. Planilha: ${JSON.stringify(data.slice(0, 30))}`,
    config: { 
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};

export const analyzeIssueImage = async (base64Image: string, mimeType: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { 
      parts: [
        { inlineData: { data: base64Image, mimeType } }, 
        { text: "Analise esta imagem industrial. Identifique falhas, desgastes ou anomalias. Retorne APENAS um objeto JSON (sem markdown) com os campos: 'equipment' (nome do equipamento) e 'diagnosis' (diagnóstico técnico detalhado)." }
      ] 
    },
    config: { 
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};

export const getDetailedAIAnalysis = async (orders: ServiceOrder[], unitName: string): Promise<DetailedAIReport> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Realize uma auditoria executiva para a unidade ${unitName} baseada nestas ordens de serviço. Retorne APENAS um JSON válido seguindo a interface: { title: string, date: string, summary: string, sections: [{title: string, content: string}], recommendations: string[] }. Dados: ${JSON.stringify(orders.slice(0, 30))}`,
    config: { 
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });
  return JSON.parse(cleanJsonString(response.text)) as DetailedAIReport;
};

export const getTechnicalAdvice = async (query: string, history: { role: 'user' | 'model'; text: string }[] = []) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })), { role: 'user', parts: [{ text: query }] }],
    config: { systemInstruction: "Especialista em manutenção industrial. Foco em soluções mecânicas e elétricas. Seja direto e técnico." }
  });
  return response.text || "Sem resposta técnica disponível no momento.";
};

export const refineTechnicalDescription = async (rawText: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Refine para linguagem técnica profissional de engenharia (pt-BR), corrigindo termos e gramática: "${rawText}"`,
  });
  return response.text?.trim() || rawText;
};

export const detectMaintenancePatterns = async (orders: ServiceOrder[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Identifique padrões de falhas recorrentes. Sugira rotinas preventivas. Retorne APENAS um array JSON com objetos contendo: title, reason, intervalDays (number), sector. Dados: ${JSON.stringify(orders.slice(-50))}`,
    config: { 
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};

export const getWhatIfSimulation = async (scenario: string, stats: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Simule o cenário industrial: "${scenario}". Retorne um JSON com: projectedSaving (number), pros (string[]), cons (string[]), summary (string). Dados atuais: ${JSON.stringify(stats)}`,
    config: { 
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};

export const convertExcelToAuditTemplate = async (fileName: string, data: any[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Converta esta planilha em um template de auditoria digital. Retorne um JSON com: name (string), questions (array de objetos com id, category, text, weight (1-5), options [{label, value}]). Dados: ${JSON.stringify(data.slice(0, 20))}`,
    config: { 
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};
