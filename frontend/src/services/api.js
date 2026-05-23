import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api');

const API = axios.create({ 
  baseURL: API_BASE_URL
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
  return res.data;
};

export const getCoachingNudge = async (devId) => {
  const res = await API.get(`/coaching-nudge/${devId}`);
  return res.data;
};

export const searchDevelopers = async (query) => {
  const res = await API.post('/search-developers', { query });
  return res.data;
};

export const getRawData = async (devId) => {
  const res = await API.get(`/raw-data/${devId}`);
  return res.data;
};
