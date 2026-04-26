import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-3-flash-preview";
const MAX_SAMPLE_SIZE = 10;

interface ChartRecommendation {
  chartType: string;
  xAxis: string;
  yAxis: string;
  reasoning: string;
}

export class KwakuService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not configured');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async getChartRecommendation(columns: any[]): Promise<ChartRecommendation | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Tu es Kwaku, expert en Business Intelligence. Analyse ces colonnes de dataset et recommande:
1. Le meilleur type de graphique (Bar, Line, Pie, Area, Scatter)
2. Les champs pour l'axe X et Y
3. Une explication brève

Colonnes: ${JSON.stringify(columns)}

Réponds UNIQUEMENT en JSON avec les clés: chartType, xAxis, yAxis, reasoning (en français).`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return this._validateChartRecommendation(parsed) ? parsed : null;
    } catch (error) {
      console.error('Chart recommendation failed:', error);
      return null;
    }
  }

  async analyzeData(data: any[]): Promise<string> {
    try {
      const sample = data.slice(0, MAX_SAMPLE_SIZE);
      const response = await this.ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Tu es Kwaku, expert en BI. Analyse cet échantillon de données et fournis 3 insights clés en français, adaptés pour un dashboard professionnel. Sois concis et actionable.

Données: ${JSON.stringify(sample)}`,
      });

      return response.text || '';
    } catch (error) {
      console.error('Data analysis failed:', error);
      return 'Analyse non disponible.';
    }
  }

  private _validateChartRecommendation(obj: any): obj is ChartRecommendation {
    return obj && typeof obj === 'object' &&
      'chartType' in obj && typeof obj.chartType === 'string' &&
      'xAxis' in obj && typeof obj.xAxis === 'string' &&
      'yAxis' in obj && typeof obj.yAxis === 'string' &&
      'reasoning' in obj && typeof obj.reasoning === 'string';
  }
}

export const kwakuService = new KwakuService();
