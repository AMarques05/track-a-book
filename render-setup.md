# Render Deployment Setup for Track-A-Book

## Environment Variables for Render

When deploying to Render, you need to set these environment variables in your Render dashboard:

### Method 1: Using Supabase Connection Pooler (Recommended)

Instead of using individual database variables, use the connection pooler URL from Supabase:

1. Go to your Supabase project dashboard
2. Click on "Settings" → "Database"
3. Scroll down to "Connection pooling"
4. Copy the "Connection string" (it should look like: `postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`)

Set this in Render:
```
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Method 2: Using Direct Connection (Alternative)

If you prefer individual variables:
```
SUPABASE_DB_HOST=aws-0-us-west-1.compute.amazonaws.com  
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.xxxxx
SUPABASE_DB_PASSWORD=[your_password]
SUPABASE_DB_PORT=5432
```

### Required for Both Methods:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SESSION_SECRET=your_session_secret_here
PORT=10000
```

### Google Books API (if using):
```
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

## Important Notes:

1. **Use Connection Pooler**: Method 1 is recommended because Render has connection limits, and Supabase's connection pooler helps manage this.

2. **SSL is Required**: The updated database configuration automatically handles SSL connections which are required for production.

3. **Port Configuration**: Render will automatically set the PORT environment variable, but you can also set it to 10000.

4. **Session Store**: Currently using memory store which works for single-instance deployments on Render.

## Deployment Steps:

1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Set the environment variables above in Render dashboard
4. Set build command: `npm install`
5. Set start command: `node app.js`
6. Deploy!

## Troubleshooting:

If you still get connection errors:
1. Check that all environment variables are set correctly in Render
2. Make sure you're using the connection pooler URL (Method 1)
3. Verify your Supabase project is active and accessible
4. Check Render logs for specific error messages
