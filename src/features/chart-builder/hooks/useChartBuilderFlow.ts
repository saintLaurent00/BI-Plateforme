import { useMemo, useState } from 'react';

export type ChartBuilderStep = 'dataset' | 'metric' | 'dimension' | 'preview';

export function useChartBuilderFlow() {
  const [step, setStep] = useState<ChartBuilderStep>('dataset');
  const [dataset, setDataset] = useState<string>('');
  const [metric, setMetric] = useState<string>('');
  const [dimension, setDimension] = useState<string>('');

  const canGoNext = useMemo(() => {
    if (step === 'dataset') return Boolean(dataset);
    if (step === 'metric') return Boolean(metric);
    if (step === 'dimension') return Boolean(dimension);
    return true;
  }, [dataset, metric, dimension, step]);

  const next = () => {
    if (!canGoNext) return;
    if (step === 'dataset') setStep('metric');
    else if (step === 'metric') setStep('dimension');
    else if (step === 'dimension') setStep('preview');
  };

  const previous = () => {
    if (step === 'preview') setStep('dimension');
    else if (step === 'dimension') setStep('metric');
    else if (step === 'metric') setStep('dataset');
  };

  return {
    step,
    dataset,
    metric,
    dimension,
    setDataset,
    setMetric,
    setDimension,
    canGoNext,
    next,
    previous,
  };
}
