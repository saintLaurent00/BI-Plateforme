import { executeQuery } from '../lib/db';
import axios from 'axios';

const API_URL = '/api';

export const biService = {
  async runRawQuery(sql: string) {
    try {
      const response = await axios.post(`${API_URL}/query/raw`, { sql }, {
        headers: { 'X-User': 'admin' }
      });
      return response.data;
    } catch (err) {
      console.warn('API Query failed, falling back to local WASM execution');
      const data = await executeQuery(sql);
      return { data, metadata: { source: 'local-wasm' } };
    }
  },

  async getDatasets() {
    // Return mock datasets metadata
    return [
      {
        name: "transactions",
        table_name: "transactions",
        columns: [
          { name: "id", type: "number" },
          { name: "date", type: "date" },
          { name: "category", type: "string" },
          { name: "amount", type: "number" },
          { name: "merchant", type: "string" },
        ],
        metrics: [
          { name: "total_amount", expression: "SUM(amount)" },
          { name: "transaction_count", expression: "COUNT(*)" },
          { name: "avg_amount", expression: "AVG(amount)" },
        ]
      }
    ];
  },

  async runQuery(request: {
    dataset: string;
    metrics: string[];
    dimensions: string[];
    filters?: any[];
  }) {
    // Generate SQL locally for GitHub Pages (no backend)
    const selectParts: string[] = [];
    request.dimensions.forEach(d => selectParts.push(`"${d}"`));

    // Map metrics
    const metricsMap: Record<string, string> = {
      "total_amount": "SUM(amount)",
      "transaction_count": "COUNT(*)",
      "avg_amount": "AVG(amount)"
    };

    request.metrics.forEach(m => {
      const expr = metricsMap[m] || m;
      selectParts.push(`${expr} AS "${m}"`);
    });

    const groupBy = request.dimensions.length > 0
      ? `GROUP BY ${request.dimensions.map(d => `"${d}"`).join(', ')}`
      : '';

    const sql = `SELECT ${selectParts.join(', ')} FROM "${request.dataset}" ${groupBy} LIMIT 1000`;

    const data = await executeQuery(sql);

    // Simple insight generation logic in frontend for GH Pages
    const insights = [];
    if (data.length > 0 && request.dataset === "transactions") {
        insights.push({
            type: "volume",
            message: `Analyse terminée sur ${data.length} segments de données.`,
            severity: "neutral"
        });
    }

    return {
      sql,
      data,
      insights
    };
  }
};
