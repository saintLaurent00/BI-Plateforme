import type { DatasetMetadata } from './DatasetMetadata';

export interface MetadataCatalog {
  datasets: DatasetMetadata[];
}

export function findDataset(
  catalog: MetadataCatalog,
  datasetId: string,
): DatasetMetadata | undefined {
  return catalog.datasets.find(dataset => dataset.id === datasetId);
}
