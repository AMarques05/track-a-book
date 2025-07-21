import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Use DATABASE_URL if available (Render deployment), otherwise use individual env vars
const connectionConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false 
      }
    }
  : {
      host: process.env.SUPABASE_DB_HOST,
      database: process.env.SUPABASE_DB_NAME,
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD,
      port: process.env.SUPABASE_DB_PORT || 5432,
      ssl: {
        rejectUnauthorized: false 
      }
    };

const client = new pg.Client(connectionConfig);

client.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch(err => {
    console.error('❌ Database connection error:', err);
    console.error('Connection config:', {
      ...connectionConfig,
      // Don't log the actual password/connection string for security
      ...(connectionConfig.password && { password: '[HIDDEN]' }),
      ...(connectionConfig.connectionString && { connectionString: '[HIDDEN]' })
    });
  });

export { client };
export const query = (text, params) => client.query(text, params);





