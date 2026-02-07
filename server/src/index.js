const express = require('express');
const cors = require('cors');
const { authMiddleware } = require('./middleware/auth');
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');
const platformRouter = require('./routes/platform');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// Routes
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/platform', platformRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Campus Flow API', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║  CAMPUS FLOW API — v1.0.0             ║`);
  console.log(`  ║  Running on http://localhost:${PORT}     ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});
