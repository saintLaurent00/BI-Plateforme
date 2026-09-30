import { GoogleGenAI } from "@google/genai";

export class AIService {
  private ai: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async getChartRecommendation(columns: any[]) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tu es un expert en Business Intelligence pour Hifadih BI. Analyse ces colonnes d'un dataset et recommande le meilleur type de graphique (Bar, Line, Pie, Area, Scatter) et quels champs utiliser pour l'axe X et l'axe Y. Réponds en JSON avec les clés 'chartType', 'xAxis', 'yAxis', 'reasoning' (en français).
      
      Colonnes: ${JSON.stringify(columns)}`,
      config: {
        responseMimeType: "application/json"
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return null;
    }
  }

  async analyzeData(data: any[]) {
    const summary = data.slice(0, 10); // Send a sample
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tu es l'IA de Hifadih BI. Analyse cet échantillon de données et donne 3 insights clés en français pour un tableau de bord professionnel.
      
      Données: ${JSON.stringify(summary)}`,
    });

    return response.text;
  }
}

export const aiService = new AIService();
