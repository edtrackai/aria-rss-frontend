# Setting up ai-reviewed.com Domain in Vercel

Since you own ai-reviewed.com and purchased it through Vercel, follow these steps:

## Step 1: Add Domain to Your Project

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your project: **merged-frontend**
3. Go to **Settings** tab
4. Click on **Domains** in the left sidebar
5. Click **Add Domain**
6. Enter: `ai-reviewed.com`
7. Click **Add**

## Step 2: Configure Domain

Since you purchased the domain through Vercel, it should automatically:
- Set up the DNS records
- Configure SSL certificates
- Route traffic to your deployment

You'll also want to add the www subdomain:
1. Add `www.ai-reviewed.com` as well
2. Set it to redirect to `ai-reviewed.com`

## Step 3: Wait for DNS Propagation

- DNS changes can take 0-48 hours to propagate
- Since it's a Vercel domain, it's usually instant

## Step 4: Update Environment Variables

Once the domain is connected, we should update the environment variables in your project.

### In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Update these values:
   - `NEXT_PUBLIC_SITE_URL` = `https://ai-reviewed.com`
   - `NEXT_PUBLIC_DOMAIN` = `ai-reviewed.com`

### Locally update .env.production:
```
NEXT_PUBLIC_SITE_URL=https://ai-reviewed.com
NEXT_PUBLIC_DOMAIN=ai-reviewed.com
```

## Step 5: Update Configuration Files

The following files need domain updates:
- `vercel.json` - Update domain references
- `.env.production` - Update SITE_URL
- Any hardcoded references to merged-frontend.vercel.app

## Verifying Setup

After adding the domain, you should see:
- ✅ Domain verified (since you own it via Vercel)
- ✅ SSL certificate active
- ✅ DNS configured

## Common Issues

If the domain doesn't work immediately:
1. Check if it shows "Invalid Configuration" - this means DNS isn't set up
2. Check if it shows "Domain Not Found" - domain might not be added to project
3. Check if it redirects to Vercel dashboard - domain not properly assigned

Since you bought it from Vercel, most of these issues shouldn't occur.