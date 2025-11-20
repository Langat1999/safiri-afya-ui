// Vercel serverless function entry point
import app from '../backend/src/server.js';

// Export wrapped handler for Vercel
export default async (req, res) => {
  return app(req, res);
};
