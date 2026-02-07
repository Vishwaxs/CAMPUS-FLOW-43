const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('campus_flow_token');
}

async function fetchApi(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Auth
export const signup = (data) => fetchApi('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
export const login = (data) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const logout = () => fetchApi('/auth/logout', { method: 'POST' });
export const getMe = () => fetchApi('/auth/me');

// Users
export const getUsers = () => fetchApi('/users');
export const getUser = (id) => fetchApi(`/users/${id}`);
export const getUserRegistrations = (id) => fetchApi(`/users/${id}/registrations`);
export const getUserParticipation = (id) => fetchApi(`/users/${id}/participation`);

// Events
export const getEvents = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchApi(`/events${query ? `?${query}` : ''}`);
};
export const getEvent = (slug) => fetchApi(`/events/${slug}`);
export const createEvent = (data) => fetchApi('/events', { method: 'POST', body: JSON.stringify(data) });
export const updateEvent = (slug, data) => fetchApi(`/events/${slug}`, { method: 'PATCH', body: JSON.stringify(data) });
export const registerForEvent = (slug) => fetchApi(`/events/${slug}/register`, { method: 'POST' });
export const cancelRegistration = (slug) => fetchApi(`/events/${slug}/register`, { method: 'DELETE' });
export const getEventRegistrations = (slug) => fetchApi(`/events/${slug}/registrations`);
export const createAnnouncement = (slug, data) => fetchApi(`/events/${slug}/announcements`, { method: 'POST', body: JSON.stringify(data) });
export const createScheduleItem = (slug, data) => fetchApi(`/events/${slug}/schedule`, { method: 'POST', body: JSON.stringify(data) });

// Platform
export const getPlatformModules = () => fetchApi('/platform/modules');
export const getThemePresets = () => fetchApi('/platform/themes');
export const getPlatformStats = () => fetchApi('/platform/stats');
export const getRecommendations = (userId) => fetchApi(`/platform/recommendations/${userId}`);
