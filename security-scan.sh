#!/bin/bash
# 🔒 PRE-COMMIT SECURITY SCANNER
# Run this before every git commit to ensure no secrets are exposed

echo "🔍 Running Security Scan..."
echo "=========================="

# Check for common secret patterns
echo "📋 Checking for exposed secrets..."
if grep -r --include="*.py" --include="*.js" --include="*.ts" --include="*.json" \
    -E "(sk-[a-zA-Z0-9]{32,}|gsk_[a-zA-Z0-9]{32,}|hf_[a-zA-Z0-9]{32,}|xoxb-[0-9]{10,})" . 2>/dev/null; then
    echo "❌ CRITICAL: API keys found in source code!"
    echo "🚨 DO NOT COMMIT! Remove all API keys first."
    exit 1
fi

# Check if .env exists (should be gitignored)
if [ -f ".env" ]; then
    echo "⚠️  WARNING: .env file exists"
    echo "🔍 Verifying it's gitignored..."
    if git check-ignore .env > /dev/null 2>&1; then
        echo "✅ .env is properly gitignored"
    else
        echo "❌ CRITICAL: .env file is NOT gitignored!"
        echo "🚨 Add .env to .gitignore immediately!"
        exit 1
    fi
fi

# Check for common password/secret words
echo "🔍 Scanning for potential secrets..."
if grep -r --include="*.py" --include="*.js" --include="*.ts" \
    -i "password.*=\|secret.*=\|token.*=\|apikey.*=" . 2>/dev/null | grep -v "your_" | grep -v "example" | grep -v "template"; then
    echo "⚠️  Potential secrets found - please review"
fi

# Check Python cache and node_modules are gitignored
echo "📁 Checking build artifacts..."
if [ -d "__pycache__" ] && ! git check-ignore __pycache__ > /dev/null 2>&1; then
    echo "⚠️  WARNING: __pycache__ not gitignored"
fi
if [ -d "node_modules" ] && ! git check-ignore node_modules > /dev/null 2>&1; then
    echo "⚠️  WARNING: node_modules not gitignored"
fi

echo ""
echo "✅ Security scan completed!"
echo "🚀 Safe to commit if no critical issues found above."
echo ""
