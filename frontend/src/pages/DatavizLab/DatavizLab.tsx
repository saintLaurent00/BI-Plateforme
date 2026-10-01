import React from 'react';
import { EChartsChart } from '../../components/charts/EChartsChart';
import { aggregateByDimension } from '../../features/dataviz/utils/aggregation';
import { SAMPLE_SALES_DATASET } from '../../features/dataviz/data/sampleDatasets';

export const DatavizLab: React.FC = () => {
  const revenueByRegion = React.useMemo(
    () =>
      aggregateByDimension(
        SAMPLE_SALES_DATASET.rows,
        'region',
        'revenue',
        'sum',
      ),
    [],
  );

  return (
    <div className="h-full overflow-auto p-8 space-y-8">
      <header className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
          Dataviz development
        </p>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Chart construction lab
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Reference environment for validating every visualization against the
          shared deterministic sample dataset.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-[520px] rounded-3xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-black tracking-tight text-foreground">
              Revenue by region
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              First reference implementation: Bar chart + sample sales dataset.
            </p>
          </div>

          <div className="h-[430px]">
            <EChartsChart
              type="Bar"
              data={revenueByRegion}
              xAxis="region"
              yAxis={['revenue']}
              config={{
                showLegend: false,
                showGrid: true,
                numberFormat: 'Adaptive formatting',
              }}
            />
          </div>
        </div>

        <aside className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-sm font-black tracking-tight text-foreground">
            Sample dataset
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
                {SAMPLE_SALES_DATASET.rows.length}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Fields
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {SAMPLE_SALES_DATASET.fields.length}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Charts must consume this shared source instead of embedding
              demonstration data inside individual chart implementations.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
};
