import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ═══════════════════════════════════════
// RSVP
// ═══════════════════════════════════════

export const criarRSVP = async (dados) => {
  const response = await api.post('/api/rsvp', dados);
  return response.data;
};

export const listarRSVPs = async () => {
  const response = await api.get('/api/rsvp');
  return response.data;
};

export const obterEstatisticas = async () => {
  const response = await api.get('/api/rsvp/stats');
  return response.data;
};

// ═══════════════════════════════════════
// PRESENTES
// ═══════════════════════════════════════

export const listarPresentes = async () => {
  const response = await api.get('/api/presentes');
  return response.data;
};

export const reservarPresente = async (presenteId, nome) => {
  const response = await api.post(
    `/api/presentes/${presenteId}/reservar?nome=${encodeURIComponent(nome)}`
  );
  return response.data;
};

export const cancelarReserva = async (presenteId) => {
  const response = await api.delete(`/api/presentes/${presenteId}/reservar`);
  return response.data;
};

export default api;
