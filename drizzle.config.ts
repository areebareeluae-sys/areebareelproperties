import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config(); // Yeh line .env file ko parh leti hai

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  },
});