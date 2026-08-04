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

// URL direta para download do PDF com a lista de confirmados
export const urlPdfConfirmados = () => `${API_URL}/api/rsvp/pdf`;

// ═══════════════════════════════════════
// PRESENTES
// ═══════════════════════════════════════

export const listarPresentes = async (categoria) => {
  const response = await api.get('/api/presentes', {
    params: categoria ? { categoria } : {},
  });
  return response.data;
};

export const listarCategoriasPresentes = async () => {
  const response = await api.get('/api/presentes/categorias');
  return response.data.categorias;
};

export const reservarPresente = async (presenteId, nome) => {
  const response = await api.post(
    `/api/presentes/${presenteId}/reservar?nome=${encodeURIComponent(nome)}`
  );
  return response.data;
};

export const contribuirPresente = async (presenteId, nome, valor) => {
  const response = await api.post(`/api/presentes/${presenteId}/contribuir`, {
    nome,
    valor,
  });
  return response.data;
};

export const cancelarReserva = async (presenteId) => {
  const response = await api.delete(`/api/presentes/${presenteId}/reservar`);
  return response.data;
};

export default api;
