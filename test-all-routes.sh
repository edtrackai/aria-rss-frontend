#!/bin/bash

# Frontend Comprehensive Route Testing
# Tests all routes and provides detailed analysis

BASE_URL="https://merged-frontend.vercel.app"
BACKEND_URL="https://backend-5vvgwhc3o-shahlals-projects.vercel.app"

echo "==================================="
echo "Frontend Route Testing"
echo "==================================="
echo "Frontend URL: $BASE_URL"
echo "Backend URL: $BACKEND_URL"
echo ""

# Function to test a route
test_route() {
    local path=$1
    local expected_type=$2
    local description=$3
    
    echo "Testing: $description ($path)"
    echo "Expected: $expected_type"
    
    # Get full response with headers
    response=$(curl -s -i -X GET "$BASE_URL$path" -H "Accept: text/html,application/json" 2>&1)
    
    # Extract status code
    status_code=$(echo "$response" | grep -E "^HTTP" | tail -1 | awk '{print $2}')
    
    # Extract content type
    content_type=$(echo "$response" | grep -i "content-type:" | tail -1)
    
    echo "Status: $status_code"
    echo "Content-Type: $content_type"
    
    # Check for specific patterns in response
    if [[ "$expected_type" == "HTML" ]]; then
        if echo "$response" | grep -q "<html\|<!DOCTYPE\|<div"; then
            echo "✓ HTML content detected"
        else
            echo "✗ No HTML content found"
        fi
    elif [[ "$expected_type" == "JSON" ]]; then
        if echo "$response" | tail -n 1 | jq . >/dev/null 2>&1; then
            echo "✓ Valid JSON response"
            echo "$response" | tail -n 1 | jq . | head -5
        else
            echo "✗ Invalid JSON response"
        fi
    fi
    
    # Check for error patterns
    if echo "$response" | grep -qi "error\|failed\|unauthorized"; then
        echo "⚠️  Possible error detected in response"
    fi
    
    echo "-----------------------------------"
}

# Test App Routes
echo "=== APP ROUTES ==="
echo ""

test_route "/" "HTML" "Homepage"
test_route "/health" "JSON/HTML" "Health Check"
test_route "/login" "HTML" "Login Page"
test_route "/dashboard" "HTML" "Dashboard (may redirect to login)"
test_route "/dashboard/articles/new" "HTML" "Article Creation"
test_route "/dashboard/revenue" "HTML" "Revenue Tracking"

echo ""
echo "=== API ROUTES ==="
echo ""

test_route "/api/test-connection" "JSON" "API Connection Test"
test_route "/api/articles" "JSON" "Articles API"
test_route "/api/affiliate-links" "JSON" "Affiliate Links API"

echo ""
echo "=== BACKEND CONNECTIVITY TEST ==="
echo ""

echo "Testing backend health endpoint..."
backend_response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/health" 2>&1)
echo "Backend health status: $backend_response"

echo ""
echo "=== ADDITIONAL CHECKS ==="
echo ""

# Check for service worker
echo "Checking for service worker..."
sw_check=$(curl -s "$BASE_URL/" | grep -i "service.*worker\|sw.js" | head -1)
if [[ -n "$sw_check" ]]; then
    echo "✓ Service worker detected"
else
    echo "✗ No service worker found"
fi

# Check for environment variables in HTML
echo ""
echo "Checking for exposed environment variables..."
env_check=$(curl -s "$BASE_URL/" | grep -E "NEXT_PUBLIC_|process\.env" | head -5)
if [[ -n "$env_check" ]]; then
    echo "✓ Environment variables properly configured"
else
    echo "⚠️  No environment variables detected in HTML"
fi

echo ""
echo "==================================="
echo "Testing Complete"
echo "==================================="