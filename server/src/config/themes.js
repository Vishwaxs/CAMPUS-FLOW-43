// Default theme presets — organizers pick one or customize
const THEME_PRESETS = {
  default: {
    name: 'Campus Default',
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#22c55e',
      error: '#ef4444'
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif'
    },
    layout: 'standard',
    borderRadius: '8px',
    logo: null
  },
  hackathon: {
    name: 'Hackathon Neon',
    colors: {
      primary: '#00ff88',
      secondary: '#00ccff',
      accent: '#ff00ff',
      background: '#0a0a0a',
      surface: '#1a1a2e',
      text: '#e0e0e0',
      textSecondary: '#888888',
      border: '#333333',
      success: '#00ff88',
      error: '#ff4444'
    },
    fonts: {
      heading: "'JetBrains Mono', monospace",
      body: "'Inter', sans-serif"
    },
    layout: 'tech',
    borderRadius: '4px',
    logo: null
  },
  cultural: {
    name: 'Cultural Fest',
    colors: {
      primary: '#e11d48',
      secondary: '#f97316',
      accent: '#eab308',
      background: '#fffbeb',
      surface: '#fff7ed',
      text: '#1c1917',
      textSecondary: '#78716c',
      border: '#e7e5e4',
      success: '#16a34a',
      error: '#dc2626'
    },
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Lato', sans-serif"
    },
    layout: 'festive',
    borderRadius: '16px',
    logo: null
  },
  sports: {
    name: 'Sports Arena',
    colors: {
      primary: '#dc2626',
      secondary: '#1d4ed8',
      accent: '#fbbf24',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0c0a09',
      textSecondary: '#57534e',
      border: '#d6d3d1',
      success: '#15803d',
      error: '#b91c1c'
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif"
    },
    layout: 'bold',
    borderRadius: '6px',
    logo: null
  },
  workshop: {
    name: 'Workshop Minimal',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#18181b',
      textSecondary: '#71717a',
      border: '#e4e4e7',
      success: '#22c55e',
      error: '#f43f5e'
    },
    fonts: {
      heading: "'Plus Jakarta Sans', sans-serif",
      body: "'Plus Jakarta Sans', sans-serif"
    },
    layout: 'clean',
    borderRadius: '12px',
    logo: null
  }
};

module.exports = { THEME_PRESETS };
