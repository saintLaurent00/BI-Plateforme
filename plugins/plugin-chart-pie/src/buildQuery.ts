export default function buildQuery(formData: any) {
  const { metrics, groupby, limit } = formData;
  return {
    metrics,
    columns: groupby,
    row_limit: limit || 100,
  };
}
