import { useMemo, useState } from 'react';

import { runBIQuery } from '../../../services/queryEngineService';
import { useChartBuilderFlow } from '../hooks/useChartBuilderFlow';
import QueryExecutionMotion from './QueryExecutionMotion';

const DATASETS = ['transactions'];
const METRICS = ['sum(amount)', 'count(*)', 'avg(amount)'];
const DIMENSIONS = ['date', 'region', 'channel'];

export default function ChartBuilderWizard() {
  const flow = useChartBuilderFlow();
  const [loading, setLoading] = useState(false);
  const [resultCount, setResultCount] = useState<number>(0);

  const canPreview = useMemo(
    () => Boolean(flow.dataset && flow.metric && flow.dimension),
    [flow.dataset, flow.metric, flow.dimension],
  );

  const handlePreview = async () => {
    if (!canPreview) return;

    setLoading(true);
    try {
      const response = await runBIQuery({
        dataset: flow.dataset,
        metrics: [flow.metric],
        dimensions: [flow.dimension],
        filters: [],
      });
      setResultCount(response.meta.row_count ?? response.data.length);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 p-4">
      <h2 className="text-lg font-semibold">Chart Builder (Guided UX)</h2>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          Dataset
          <select value={flow.dataset} onChange={(e) => flow.setDataset(e.target.value)} className="rounded-md border p-2">
            <option value="">Sélectionner</option>
            {DATASETS.map((dataset) => (
              <option key={dataset} value={dataset}>
                {dataset}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Metric
          <select value={flow.metric} onChange={(e) => flow.setMetric(e.target.value)} className="rounded-md border p-2">
            <option value="">Sélectionner</option>
            {METRICS.map((metric) => (
              <option key={metric} value={metric}>
                {metric}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Dimension
          <select value={flow.dimension} onChange={(e) => flow.setDimension(e.target.value)} className="rounded-md border p-2">
            <option value="">Sélectionner</option>
            {DIMENSIONS.map((dimension) => (
              <option key={dimension} value={dimension}>
                {dimension}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={flow.previous} className="rounded-md border px-3 py-2 text-sm" disabled={flow.step === 'dataset'}>
          Retour
        </button>
        <button type="button" onClick={flow.next} className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" disabled={!flow.canGoNext || flow.step === 'preview'}>
          Continuer
        </button>
        <button type="button" onClick={handlePreview} className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white" disabled={!canPreview || loading}>
          Prévisualiser
        </button>
      </div>

      {loading ? <QueryExecutionMotion loading={loading} /> : <p className="text-sm text-slate-600">Lignes retournées: {resultCount}</p>}
    </section>
  );
}
