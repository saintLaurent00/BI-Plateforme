import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const biService = {
  async getDatasets() {
    const response = await axios.get(`${API_BASE_URL}/datasets`);
    return response.data;
  },

  async runQuery(request: {
    dataset: string;
    metrics: string[];
    dimensions: string[];
    filters?: any[];
  }) {
    const response = await axios.post(`${API_BASE_URL}/query`, request);
    return response.data;
  }
};
