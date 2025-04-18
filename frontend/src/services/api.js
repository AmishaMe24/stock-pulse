import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const login = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await axios.post(`${API_URL}/auth/login`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const signup = async (email, password) => {
  const response = await api.post('/auth/signup', { email, password });
  return response.data;
};

// Portfolio services
export const getPortfolios = async () => {
  const response = await api.get('/portfolios');
  return response.data;
};

export const getPortfolio = async (id) => {
  const response = await api.get(`/portfolios/${id}`);
  return response.data;
};

export const createPortfolio = async (name) => {
  const response = await api.post('/portfolios', { name });
  return response.data;
};

export const updatePortfolio = async (id, name) => {
  const response = await api.put(`/portfolios/${id}`, { name });
  return response.data;
};

export const deletePortfolio = async (id) => {
  const response = await api.delete(`/portfolios/${id}`);
  return response.data;
};

// Asset services
export const addAsset = async (portfolioId, asset) => {
  const response = await api.post(`/portfolios/${portfolioId}/assets`, asset);
  return response.data;
};

export const updateAsset = async (assetId, asset) => {
  const response = await api.put(`/portfolios/assets/${assetId}`, asset);
  return response.data;
};

export const deleteAsset = async (assetId) => {
  const response = await api.delete(`/portfolios/assets/${assetId}`);
  return response.data;
};

// Stock services
export const searchStocks = async (query) => {
  const response = await api.get(`/stocks/search?query=${query}`);
  return response.data;
};

export const getStockQuote = async (symbol) => {
  const response = await api.get(`/stocks/quote/${symbol}`);
  return response.data;
};

export const getDailyPrices = async (symbol) => {
  const response = await api.get(`/stocks/daily/${symbol}`);
  return response.data;
};

// Alert services
export const createAlert = async (alert) => {
  const response = await api.post('/alerts', alert);
  return response.data;
};

export const getAlertsByAsset = async (assetId) => {
  const response = await api.get(`/alerts/asset/${assetId}`);
  return response.data;
};

export const updateAlert = async (alertId, alert) => {
  const response = await api.put(`/alerts/${alertId}`, alert);
  return response.data;
};

export const deleteAlert = async (alertId) => {
  const response = await api.delete(`/alerts/${alertId}`);
  return response.data;
};

export default api;