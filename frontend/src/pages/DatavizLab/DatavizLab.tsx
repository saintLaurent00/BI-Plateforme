import React from 'react';
import { EChartsChart } from '../../components/charts/EChartsChart';
import { SAMPLE_SALES_DATASET, SAMPLE_SALES_DATA } from '../../features/datasets/sample';
import { SampleQueryExecutor } from '../../features/query-execution';
import type { ChartQuery } from '../../domain/query';

const SAMPLE_QUERY: ChartQuery = {
  datasetId: SAMPLE_SALES_DATASET.id,
  dimensions: [
    {
      column: 'region',
      label: 'region',
    },
  ],
  metrics: [
    {
      id: 'sales.total_revenue',
      name: 'revenue',
      label: 'Revenue',
      expression: 'SUM(revenue)',
      expressionType: 'saved',
    },
    {
      name: 'profit_margin',
      label: 'Profit Margin',
      expression: 'SUM(profit) / NULLIF(SUM(revenue), 0) * 100',
      expressionType: 'adhoc',
    },
  ],
  calculatedColumns: [
    {
      id: 'sales.net_value',
      name: 'net_value',
      label: 'Net Value',
      expression: 'quantity * unit_price * (1 - discount)',
      type: 'number',
    },
  ],
  orderBy: [
    {
      column: 'revenue',
      direction: 'desc',
    },
  ],
  limit: 100,
};

const executor = new SampleQueryExecutor({ dataset: SAMPLE_SALES_DATASET, rows: SAMPLE_SALES_DATA as unknown as readonly Record<string, unknown>[] });

export const DatavizLab: React.FC = () => {
  const [result, setResult] = React.useState<{
    data: Record<string, unknown>[];
    query: string;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    executor.execute(SAMPLE_SALES_DATASET, SAMPLE_QUERY)
      .then(response => {
        if (active) {
          setResult({
            data: response.data,
            query: response.query,
          });
        }
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : String(reason));
      });

    return () => {
      active = false;
    };
  }, []);

  const chartData = React.useMemo(
    () =>
      (result?.data ?? []).map(row => ({
        region: String(row.region ?? ''),
        revenue: Number(row.revenue ?? 0),
      })),
    [result],
  );

  return (
    <div className="h-full overflow-auto p-8 space-y-8">
      <header className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
          Dataviz foundation
        </p>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Semantic query lab
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The chart is now fed by a Superset-inspired query model: dimensions,
          saved metrics, ad-hoc SQL metrics, calculated columns and ordering.
          The sample executor is only a local execution adapter.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-h-[520px] rounded-3xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-black tracking-tight text-foreground">
              Revenue by region
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Chart plugin receives query results only; it does not know how the
              data was produced.
            </p>
          </div>

          <div className="h-[430px]">
            {error ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <EChartsChart
                type="Bar"
                data={chartData}
                xAxis="region"
                yAxis={['revenue']}
                config={{
                  showLegend: false,
                  showGrid: true,
                  numberFormat: 'Adaptive formatting',
                }}
              />
            )}
          </div>
        </div>

        <aside className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-sm font-black tracking-tight text-foreground">
            Query model
          </h2>

          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Dataset
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {SAMPLE_SALES_DATASET.name}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Rows
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {SAMPLE_SALES_DATA.length}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Saved metrics
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {SAMPLE_SALES_DATASET.metrics?.length ?? 0}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Calculated columns
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {SAMPLE_SALES_DATASET.calculatedColumns?.length ?? 0}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The same ChartQuery contract will later be executed by the Rust
              query engine instead of this browser-local sample executor.
            </p>
          </div>

          {result && (
            <details className="mt-6 border-t border-border pt-5">
              <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-muted-foreground">
                Generated SQL
              </summary>
              <pre className="mt-3 overflow-auto rounded-xl bg-muted p-3 text-[10px] leading-relaxed text-foreground">
                {result.query}
              </pre>
            </details>
          )}
        </aside>
      </section>
    </div>
  );
};
