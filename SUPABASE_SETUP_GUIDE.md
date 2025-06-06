# Supabase Database Setup Guide

## Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: `gimmdayqdhxfflaedles`

## Step 2: Run Database Setup Script

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the contents of `setup-database.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)

## Step 3: Verify Setup

After running the script, you should see:
```json
{
  "status": "connected",
  "timestamp": "2025-06-06T...",
  "user_count": 1,
  "article_count": 1
}
```

## Step 4: Update Environment Variables

### Frontend (.env.production)
Already configured correctly:
```
NEXT_PUBLIC_SUPABASE_URL=https://gimmdayqdhxfflaedles.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Backend (Vercel Environment Variables)
Need to add:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.gimmdayqdhxfflaedles.supabase.co:5432/postgres
SUPABASE_URL=https://gimmdayqdhxfflaedles.supabase.co
SUPABASE_SERVICE_KEY=[Get from Supabase Dashboard > Settings > API]
```

## Step 5: Get Your Database Connection String

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Find **Connection string** section
3. Copy the **URI** (it starts with `postgresql://`)
4. Replace `[YOUR-PASSWORD]` with your database password

## Step 6: Get Service Role Key

1. In Supabase Dashboard, go to **Settings** → **API**
2. Find **Service role key** (keep this secret!)
3. Copy this key for backend configuration

## Troubleshooting

### If tables already exist:
The script handles this automatically with `IF NOT EXISTS` checks.

### If you get permission errors:
1. Go to **Authentication** → **Policies**
2. Make sure RLS is enabled but policies allow public read

### If connection fails:
1. Check if your Supabase project is active (not paused)
2. Verify the anon key hasn't expired
3. Make sure you're using the correct project URL

## Quick Test

After setup, test the connection:
```bash
curl https://gimmdayqdhxfflaedles.supabase.co/rest/v1/articles \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbW1kYXlxZGh4ZmZsYWVkbGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NjA4MTQsImV4cCI6MjA1MjAzNjgxNH0.MiU7PxE-LFOBf5p6Kw6mcrGNC4Y5RFdq8Ljiw2L5fZw"
```

Should return an array with at least one article.