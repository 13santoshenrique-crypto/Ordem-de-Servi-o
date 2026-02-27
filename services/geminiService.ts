
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { ServiceOrder, PredictionRisk, DetailedAIReport, ActionPlan5W2H } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJsonString = (str: string | undefined) => {
  if (!str) return "{}";
  try {
    let cleaned = str.replace(/```json/g, "").replace(/```/g, "");
    const firstOpenBrace = cleaned.indexOf('{');
    const firstOpenBracket = cleaned.indexOf('[');
    let startIndex = -1;
    let endIndex = -1;

    if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
        startIndex = firstOpenBrace;
        endIndex = cleaned.lastIndexOf('}') + 1;
    } else if (firstOpenBracket !== -1) {
        startIndex = firstOpenBracket;
        endIndex = cleaned.lastIndexOf(']') + 1;
    }

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        return cleaned.substring(startIndex, endIndex);
    }
    return cleaned.trim();
  } catch (e) {
    console.error("Erro ao limpar JSON da IA:", e);
    return "{}";
  }
};

// Fix: Using gemini-3-pro-image-preview for multimodal image analysis.
// responseMimeType and responseSchema are NOT supported for nano banana series models.
// Requesting JSON structure in the prompt for manual parsing.
export const analyze5SWorkspace = async (base64Image: string, mimeType: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Realize uma auditoria visual 5S (Seiri, Seiton, Seiso, Seiketsu, Shitsuke) nesta área industrial. Identifique desorganização, sujeira, ferramentas fora do lugar ou riscos. Retorne APENAS um objeto JSON com os campos: score (number), compliant (boolean), issuesDetected (string[]), recommendation (string)." }
      ]
    },
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
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
    contents: `Analise o histórico de ordens de serviço. Identifique padrões de falha. Dados: ${JSON.stringify(orders.slice(-50))}`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            equipment: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ["Baixo", "Médio", "Alto", "Crítico"] },
            probability: { type: Type.NUMBER },
            recommendation: { type: Type.STRING },
            estimatedSaving: { type: Type.NUMBER },
            sector: { type: Type.STRING },
          },
          required: ["equipment", "riskLevel", "probability", "recommendation", "estimatedSaving", "sector"]
        }
      },
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};

export const parseExcel5W2H = async (fileName: string, data: any[]): Promise<Partial<ActionPlan5W2H>[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Mapeie os dados desta planilha para 5W2H. Planilha: ${JSON.stringify(data.slice(0, 30))}`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            what: { type: Type.STRING },
            why: { type: Type.STRING },
            where: { type: Type.STRING },
            when: { type: Type.STRING },
            who: { type: Type.STRING },
            how: { type: Type.STRING },
            howMuch: { type: Type.NUMBER },
            sector: { type: Type.STRING, nullable: true },
          },
          required: ["what", "why", "where", "when", "who", "how", "howMuch"]
        }
      },
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};

// Fix: Using gemini-3-pro-image-preview for image-based diagnostics.
// Removed unsupported responseMimeType and responseSchema for this model.
export const analyzeIssueImage = async (base64Image: string, mimeType: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: { 
      parts: [
        { inlineData: { data: base64Image, mimeType } }, 
        { text: "Analise esta imagem industrial. Identifique falhas, desgastes ou anomalias. Retorne APENAS um objeto JSON com: equipment (nome técnico), diagnosis (detalhado)." }
      ] 
    },
    config: { 
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};

export const getDetailedAIAnalysis = async (orders: ServiceOrder[], unitName: string): Promise<DetailedAIReport> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Auditoria executiva para ${unitName}. Dados: ${JSON.stringify(orders.slice(0, 30))}`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          date: { type: Type.STRING },
          summary: { type: Type.STRING },
          sections: { 
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
              },
              required: ["title", "content"]
            }
          },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "date", "summary", "sections", "recommendations"]
      },
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
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
    contents: `Refine para linguagem técnica profissional de engenharia (pt-BR): "${rawText}"`,
  });
  return response.text?.trim() || rawText;
};

export const detectMaintenancePatterns = async (orders: ServiceOrder[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Identifique padrões de falhas recorrentes. Dados: ${JSON.stringify(orders.slice(-50))}`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            reason: { type: Type.STRING },
            intervalDays: { type: Type.NUMBER },
            sector: { type: Type.STRING },
          },
          required: ["title", "reason", "intervalDays", "sector"]
        }
      },
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};

export const getWhatIfSimulation = async (scenario: string, stats: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Simule o cenário industrial: "${scenario}". Dados atuais: ${JSON.stringify(stats)}`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectedSaving: { type: Type.NUMBER },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
        },
        required: ["projectedSaving", "pros", "cons", "summary"]
      },
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};

export const convertExcelToAuditTemplate = async (fileName: string, data: any[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Converta esta planilha em um template de auditoria. Dados: ${JSON.stringify(data.slice(0, 20))}`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
                text: { type: Type.STRING },
                weight: { type: Type.NUMBER },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.NUMBER }
                    },
                    required: ["label", "value"]
                  }
                }
              },
              required: ["id", "category", "text", "weight", "options"]
            }
          }
        },
        required: ["name", "questions"]
      },
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });
  return JSON.parse(cleanJsonString(response.text));
};
