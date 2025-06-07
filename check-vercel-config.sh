#!/bin/bash

echo "====================================="
echo "Vercel Configuration Diagnostic Check"
echo "====================================="
echo ""

# Check if Vercel CLI is installed
echo "1. Checking Vercel CLI..."
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI is installed"
    vercel --version
else
    echo "❌ Vercel CLI not installed. Install with: npm i -g vercel"
    exit 1
fi

echo ""
echo "2. Checking Current Project..."
# Show current project info
vercel project ls 2>/dev/null || echo "❌ Not logged in to Vercel"

echo ""
echo "3. Checking Domain Configuration..."
# Check domain status
echo "Checking ai-reviewed.com..."
vercel domains inspect ai-reviewed.com 2>/dev/null || echo "❌ Cannot access domain info"

echo ""
echo "4. Checking DNS Records..."
# Use dig or nslookup to check DNS
if command -v dig &> /dev/null; then
    echo "A Records:"
    dig +short A ai-reviewed.com
    echo ""
    echo "CAA Records:"
    dig +short CAA ai-reviewed.com
    echo ""
    echo "Nameservers:"
    dig +short NS ai-reviewed.com
else
    echo "Using nslookup..."
    nslookup ai-reviewed.com
fi

echo ""
echo "5. Checking SSL Certificate..."
echo "Testing HTTPS connection..."
curl -Is https://ai-reviewed.com | head -n 1 || echo "❌ HTTPS connection failed"

echo ""
echo "6. Checking Environment Variables..."
echo "Production variables configured in vercel.json:"
grep -A 20 '"env"' vercel.json | head -20

echo ""
echo "7. Testing Endpoints..."
echo ""
echo "Testing merged-frontend.vercel.app..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://merged-frontend.vercel.app

echo ""
echo "Testing ai-reviewed.com..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://ai-reviewed.com || echo "Failed"

echo ""
echo "Testing www.ai-reviewed.com..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://www.ai-reviewed.com || echo "Failed"

echo ""
echo "====================================="
echo "Diagnostic Complete"
echo "====================================="
echo ""
echo "Common Issues:"
echo "1. CAA Record blocking SSL: 0 issue 'artservcrypt.org'"
echo "2. Domain shows 'Invalid Configuration' in Vercel"
echo "3. DNS is correct but domain not properly linked to project"
echo ""
echo "Recommended Actions:"
echo "1. Contact Vercel Support to remove the CAA record"
echo "2. Use https://merged-frontend.vercel.app in the meantime"
echo "3. Or try: vercel domains rm ai-reviewed.com && vercel domains add ai-reviewed.com"