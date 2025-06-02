#!/bin/bash

# Add Supabase environment variables to Vercel
echo "Adding Supabase environment variables to Vercel..."

# You need to run this with the Vercel CLI installed
# Install with: npm i -g vercel

vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://gimmdayqdhxfflaedles.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbW1kYXlxZGh4ZmZsYWVkbGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NjA4MTQsImV4cCI6MjA1MjAzNjgxNH0.MiU7PxE-LFOBf5p6Kw6mcrGNC4Y5RFdq8Ljiw2L5fZw"

echo "Environment variables added! Now redeploy your project."