
import { GoogleGenAI, Type } from "@google/genai";
import { ServiceOrder, PredictionRisk, DetailedAIReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Busca Geográfica de Unidades: Utiliza Google Maps para validar localizações.
 */
export const getUnitLocationDetails = async (locationQuery: string, latLng?: { latitude: number, longitude: number }) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Encontre detalhes da localidade: "${locationQuery}". Extraia: Nome Oficial, País, Moeda local (ISO), e fuso horário. RESPONDA EM PORTUGUÊS BRASIL.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: latLng
        }
      }
    },
  });
  
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const getTechnicalAdvice = async (query: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Você é o Especialista Técnico Sênior da Aviagen. Responda estritamente em Português do Brasil, de forma curta e prática: ${query}`,
  });
  return response.text;
};

export const analyzeIssueImage = async (base64Image: string, mimeType: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Analise esta imagem de um problema técnico na Aviagen. Identifique o equipamento, a provável causa da falha e sugira o tipo de Ordem de Serviço (Preventiva/Corretiva). RESPONDA EM PORTUGUÊS BRASIL em JSON estruturado." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          equipment: { type: Type.STRING },
          diagnosis: { type: Type.STRING },
          suggestedAction: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          requiredParts: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["equipment", "diagnosis", "suggestedAction"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getEducationalTeaching = async (query: string, history: { role: 'user' | 'model'; text: string }[]) => {
  const chat = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [...chat, { role: 'user', parts: [{ text: query }] }],
    config: {
      systemInstruction: "Você é o Mentor SGI da Aviagen. Sua missão é ensinar técnicos e gestores sobre tópicos de manutenção, normas técnicas (NBR/ISO), segurança do trabalho e processos industriais. RESPONDA SEMPRE EM PORTUGUÊS DO BRASIL. Seja didático e profissional.",
    },
  });
  return response.text;
};

export const getWhatIfSimulation = async (scenario: string, currentStats: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Simule cenário: "${scenario}". Dados: ${JSON.stringify(currentStats)}. RESPONDA EM PORTUGUÊS BRASIL.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectedSaving: { type: Type.NUMBER },
          impactLevel: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING }
        },
        required: ["projectedSaving", "summary"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getPredictiveMaintenance = async (orders: ServiceOrder[]): Promise<PredictionRisk[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analise histórico Aviagen: ${JSON.stringify(orders.slice(-50))}. GERE RECOMENDAÇÕES EM PORTUGUÊS BRASIL.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sector: { type: Type.STRING },
            equipment: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            probability: { type: Type.NUMBER },
            recommendation: { type: Type.STRING },
            estimatedSaving: { type: Type.NUMBER }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getDetailedAIAnalysis = async (orders: ServiceOrder[], unitName: string): Promise<DetailedAIReport> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Auditoria governança ${unitName}: ${JSON.stringify(orders.slice(0, 100))}. GERE RELATÓRIO COMPLETO EM PORTUGUÊS BRASIL.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          date: { type: Type.STRING },
          summary: { type: Type.STRING },
          sections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING } } } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}") as DetailedAIReport;
};
