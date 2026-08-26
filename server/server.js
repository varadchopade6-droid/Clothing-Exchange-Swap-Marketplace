import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';
const port = process.env.PORT || 5000;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace-with-a-long-random-secret') {
  console.error('JWT_SECRET must be set to a secure production value.');
  process.exit(1);
}
connectDatabase().then(() => app.listen(port, () => console.log(`API listening on port ${port}`))).catch((error) => { console.error('Database connection failed:', error.message); process.exit(1); });
