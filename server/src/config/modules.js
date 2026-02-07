// Platform module definitions — the plug-and-play registry
const MODULES = [
  {
    id: 'registration',
    name: 'Registration',
    description: 'Accept RSVPs and manage participant sign-ups',
    icon: 'clipboard-list',
    default_enabled: 1,
    config_schema: JSON.stringify({
      max_participants: { type: 'number', label: 'Max Participants', default: 100 },
      waitlist_enabled: { type: 'boolean', label: 'Enable Waitlist', default: false },
      requires_approval: { type: 'boolean', label: 'Require Approval', default: false }
    }),
    sort_order: 1
  },
  {
    id: 'schedule',
    name: 'Schedule',
    description: 'Timeline and agenda for the event',
    icon: 'calendar',
    default_enabled: 1,
    config_schema: JSON.stringify({
      show_speakers: { type: 'boolean', label: 'Show Speakers', default: true },
      enable_tracks: { type: 'boolean', label: 'Enable Multi-Track', default: false }
    }),
    sort_order: 2
  },
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'Post updates and alerts for participants',
    icon: 'megaphone',
    default_enabled: 1,
    config_schema: JSON.stringify({
      allow_push: { type: 'boolean', label: 'Push Notifications', default: false }
    }),
    sort_order: 3
  },
  {
    id: 'teams',
    name: 'Team Formation',
    description: 'Allow participants to form or join teams',
    icon: 'users',
    default_enabled: 0,
    config_schema: JSON.stringify({
      max_team_size: { type: 'number', label: 'Max Team Size', default: 4 },
      min_team_size: { type: 'number', label: 'Min Team Size', default: 2 },
      allow_solo: { type: 'boolean', label: 'Allow Solo Participation', default: false }
    }),
    sort_order: 4
  },
  {
    id: 'voting',
    name: 'Live Voting',
    description: 'Create polls and collect votes in real time',
    icon: 'vote',
    default_enabled: 0,
    config_schema: JSON.stringify({
      anonymous: { type: 'boolean', label: 'Anonymous Votes', default: true },
      show_results_live: { type: 'boolean', label: 'Show Results Live', default: true }
    }),
    sort_order: 5
  },
  {
    id: 'checkin',
    name: 'QR Check-In',
    description: 'QR-code based attendance tracking',
    icon: 'qr-code',
    default_enabled: 0,
    config_schema: JSON.stringify({
      generate_qr: { type: 'boolean', label: 'Auto-Generate QR', default: true }
    }),
    sort_order: 6
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    description: 'Track and display participant or team rankings',
    icon: 'trophy',
    default_enabled: 0,
    config_schema: JSON.stringify({
      show_scores: { type: 'boolean', label: 'Show Scores Publicly', default: true },
      update_frequency: { type: 'select', label: 'Update Frequency', options: ['realtime', 'hourly', 'manual'], default: 'manual' }
    }),
    sort_order: 7
  }
];

module.exports = { MODULES };
