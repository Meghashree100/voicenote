import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
import taskRoutes from './routes/tasks.js';
import parseRoutes from './routes/parse.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/parse', parseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VoiceNote API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting VoiceNote API server...');
    console.log('📦 Initializing database connection...');
    
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log('');
      console.log('✨ Server started successfully!');
      console.log(`🌐 Server is running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      console.log('');
    });
  } catch (error) {
    console.error('');
    console.error('❌ Failed to start server:', error.message);
    console.error('');
    console.error('💡 To diagnose MongoDB connection issues, run:');
    console.error('   npm run test-mongo');
    console.error('');
    console.error('💡 Quick fixes:');
    console.error('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.error('   2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
    console.error('   3. Set MONGODB_URI in .env file for Atlas connection');
    console.error('');
    process.exit(1);
  }
}

startServer();

