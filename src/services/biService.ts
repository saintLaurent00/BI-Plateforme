import { executeQuery } from '../lib/db';

export const biService = {
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
