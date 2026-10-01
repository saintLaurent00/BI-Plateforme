export default function buildQuery(formData: any) {
  const { metrics, groupby, limit, order_by_cols } = formData;
  return {
    metrics,
    columns: groupby,
    orderby: order_by_cols,
    row_limit: limit || 100,
  };
}
