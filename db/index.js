import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const client = new pg.Client({
  host: process.env.SUPABASE_DB_HOST,
  database: process.env.SUPABASE_DB_NAME,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  port: process.env.SUPABASE_DB_PORT,
  ssl: {
    rejectUnauthorized: false 
  }
});

client.connect()
  .then(() => console.log('✅ Connected to Supabase PostgreSQL database'))
  .catch(err => console.error('❌ Database connection error:', err));

export { client };
export const query = (text, params) => client.query(text, params);





