const API_BASE = '/api';

async function fetchApi(path, options = {}) {
  const userId = localStorage.getItem('campus_flow_user_id');
  const headers = {
    'Content-Type': 'application/json',
    ...(userId ? { 'x-user-id': userId } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

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

// NEW: AI Theme Generation (Additive Feature)
export const generateTheme = (answers) => fetchApi('/events/generate-theme', { method: 'POST', body: JSON.stringify(answers) });

// Platform
export const getPlatformModules = () => fetchApi('/platform/modules');
export const getThemePresets = () => fetchApi('/platform/themes');
export const getPlatformStats = () => fetchApi('/platform/stats');
export const getRecommendations = (userId) => fetchApi(`/platform/recommendations/${userId}`);

