// @ts-nocheck
import buildQuery from '../src/buildQuery';

describe('BarChart buildQuery', () => {
  it('should build basic query', () => {
    const formData = { metrics: ['sum__sales'], groupby: ['city'] };
    const result = buildQuery(formData);
    expect(result.metrics).toEqual(['sum__sales']);
    expect(result.columns).toEqual(['city']);
  });
});
