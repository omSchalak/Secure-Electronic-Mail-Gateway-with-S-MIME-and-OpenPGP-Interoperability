import app from './app.js';
import { initializeSampleCredentials } from './data/sampleKeys.js';

const PORT = process.env.PORT || 5000;

// Initialize crypto state and start standalone server
async function startServer() {
  try {
    await initializeSampleCredentials();
    app.listen(PORT, () => {
      console.log(`================================================================`);
      console.log(`SECURE ELECTRONIC MAIL GATEWAY WITH S/MIME & OPENPGP INTEROP`);
      console.log(`Domain: Network Security & Secure Communication Protocols`);
      console.log(`Website Creator: Mansi Chalak`);
      console.log(`Status: Backend API running on http://localhost:${PORT}`);
      console.log(`================================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Only start standalone server when executed directly (not in Vercel serverless)
if (process.env.VERCEL !== '1' && !process.env.VERCEL) {
  startServer();
}

export default app;
