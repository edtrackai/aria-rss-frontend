# Fixing "Invalid Configuration" for ai-reviewed.com

## Current Status
- Domain: ai-reviewed.com
- Status: Invalid Configuration (as shown in screenshot)
- This means the domain is added but DNS is not properly configured

## Steps to Fix:

### 1. Click on "ai-reviewed.com" in the Domains list
This will open the domain configuration page

### 2. You should see one of these options:

#### Option A: If you see "Enable Domain"
- Click the "Enable Domain" button
- Since you bought it from Vercel, it should automatically configure

#### Option B: If you see DNS configuration instructions
- Look for either:
  - "Set the following DNS records" 
  - "Configure your domain"
  
### 3. For Vercel-purchased domains:
The configuration should show:
- Type: A
- Name: @
- Value: 76.76.21.21

And potentially:
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

### 4. If DNS is already configured:
Sometimes you need to:
1. Click "Refresh" to check DNS status
2. Wait a few minutes for propagation
3. Remove and re-add the domain

### 5. Alternative Quick Fix:
1. Click the three dots (...) next to ai-reviewed.com
2. Select "Remove"
3. Click "Add Domain" again
4. Enter: ai-reviewed.com
5. Follow the setup wizard

Since you bought the domain from Vercel, it should automatically:
- Configure DNS records
- Set up SSL certificate
- Start routing traffic

## Also Add www subdomain:
1. Click "Add Domain"
2. Enter: www.ai-reviewed.com
3. Set it to redirect to ai-reviewed.com

## Troubleshooting:
If it still shows "Invalid Configuration":
1. Go to Vercel Domains page: https://vercel.com/domains
2. Find ai-reviewed.com
3. Make sure it's not assigned to another project
4. Check if DNS is properly configured there

## Expected Result:
Once properly configured, you should see:
- ai-reviewed.com ✓ (green checkmark)
- SSL certificate active
- Domain accessible