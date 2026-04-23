import axios from 'axios';

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api' 
});

export const getDevelopers = async () => {
  const res = await API.get('/developers');
  return res.data;
};

export const getAnalysis = async (devId) => {
  const res = await API.get(`/analysis/${devId}`);
  return res.data;
};

export const postExplain = async (analysisData) => {
  const res = await API.post('/explain', analysisData);
  // Ensure we return the data object directly
  return res.data;
};
