const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed with status ${response.status}`);
    error.fields = data.fields || {};
    throw error;
  }
  return data;
}

export const expenseApi = {
  list: () => request('/expenses'),
  create: expense => request('/expenses', { method: 'POST', body: expense }),
  update: (id, expense) => request(`/expenses/${id}`, { method: 'PUT', body: expense }),
  remove: id => request(`/expenses/${id}`, { method: 'DELETE' })
};
