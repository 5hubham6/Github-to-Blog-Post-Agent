# 🛡️ Security Configuration Guide

## 🔑 Environment Variables Setup

### Required API Keys (Choose at least one)
```bash
# Free Options (Recommended)
GROQ_API_KEY=gsk_your-actual-groq-key-here
HUGGINGFACE_API_KEY=hf_your-actual-token-here

# Paid Options
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Azure OpenAI (Future)
AZURE_OPENAI_API_KEY=your-azure-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2023-12-01-preview
AZURE_DEPLOYMENT_NAME=gpt-4o
```

## 🚨 Security Best Practices

### 1. API Key Management
- **Never commit .env files to Git**
- **Use different keys for dev/staging/production**
- **Rotate keys regularly**
- **Use Azure Key Vault or AWS Secrets Manager in production**

### 2. Network Security
- **Configure CORS for specific domains only**
- **Use HTTPS in production**
- **Implement rate limiting**
- **Add request validation**

### 3. Error Handling
- **Never expose internal errors to users**
- **Log errors securely without sensitive data**
- **Use generic error messages for API responses**

### 4. Production Deployment
- **Use environment-specific .env files**
- **Enable security headers**
- **Set up monitoring and alerts**
- **Regular security audits**

## 🔍 Security Scanning Commands
```bash
# Check for exposed secrets
git log --grep="password\|secret\|key\|token" --all

# Scan for potential security issues
grep -r "api.key\|secret\|password" --include="*.py" --include="*.js" --include="*.ts" .

# Verify .env is gitignored
git check-ignore .env
```

## ⚡ Quick Security Checklist Before Push
- [ ] No .env files committed
- [ ] No API keys in source code
- [ ] .gitignore includes all sensitive patterns
- [ ] No personal information in comments
- [ ] Error messages don't expose internals
- [ ] CORS configured properly
- [ ] Dependencies are up to date
