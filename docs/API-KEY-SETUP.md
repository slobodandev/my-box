# API Key Setup Guide

This guide explains how to configure API keys for the generateAuthLink Cloud Function.

## Overview

The `generateAuthLink` Cloud Function requires API key authentication to prevent unauthorized access. Third-party systems must include a valid API key in the `x-api-key` header when calling the endpoint.

## Configuration Steps

### 1. Set the API Key in Cloud Functions Environment

You can set the `VALID_API_KEYS` environment variable using one of the following methods:

#### Method A: Using Firebase CLI

```bash
# Set a single API key
firebase functions:config:set auth.valid_api_keys="your-secret-api-key-here"

# Set multiple API keys (comma-separated)
firebase functions:config:set auth.valid_api_keys="key1,key2,key3"

# Deploy functions to apply the changes
firebase deploy --only functions
```

#### Method B: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (my-box-53040)
3. Navigate to **Functions** > **Configuration** tab
4. Click **Add variable**
5. Set:
   - **Key**: `auth.valid_api_keys`
   - **Value**: Your comma-separated API keys (e.g., `key1,key2,key3`)
6. Click **Save**
7. Redeploy your functions

#### Method C: Using .env file (Local Development Only)

For local development with Firebase Emulators:

```bash
# In functions/.env
VALID_API_KEYS=test-api-key-12345,another-key
```

### 2. Set the Test API Key in Frontend Environment

For the test simulator page to work, configure the frontend environment:

```bash
# In .env (at project root)
VITE_TEST_API_KEY=test-api-key-12345
VITE_CLOUD_FUNCTIONS_BASE_URL=https://us-central1-my-box-53040.cloudfunctions.net
VITE_CF_GENERATE_AUTH_LINK=/generateAuthLink
```

Make sure the `VITE_TEST_API_KEY` matches one of the keys in your Cloud Functions `VALID_API_KEYS`.

### 3. Generate Secure API Keys

For production use, generate secure random API keys:

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example output:**
```
8K7gxVZ3mN2pL9qR5sT1uW4xY6zA0bC3dE5fG7hI9jK=
```

### 4. Share API Keys with Third-Party Systems

Once configured, provide the API key to authorized third-party systems (like Loan Origination Systems) so they can call the generateAuthLink endpoint.

**Example API call:**

```bash
curl -X POST https://us-central1-my-box-53040.cloudfunctions.net/generateAuthLink \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-here" \
  -d '{
    "email": "borrower@example.com",
    "loanNumber": "LOAN-2024-001",
    "borrowerContactId": "CONTACT-12345",
    "expirationHours": 48
  }'
```

## Security Best Practices

1. **Never commit API keys to version control**
   - Keep API keys in environment variables or secrets management
   - Add `.env` to `.gitignore`

2. **Use different keys for different environments**
   - Development: `dev-api-key-xxx`
   - Staging: `staging-api-key-xxx`
   - Production: `prod-api-key-xxx`

3. **Rotate API keys regularly**
   - Change API keys every 90 days
   - Update all third-party systems with new keys

4. **Use separate keys for each third-party system**
   - Allows you to revoke access for specific systems
   - Makes it easier to track which system made which request

5. **Monitor API usage**
   - Check Cloud Functions logs regularly
   - Set up alerts for unusual activity

## Verification

To verify the API key is configured correctly:

1. Visit your frontend test simulator: `https://my-box-53040.web.app`
2. Enter an email address and click "Send Sign-In Link"
3. Check the browser console for success/error messages
4. Check Cloud Functions logs in Firebase Console

If you see "Invalid or missing API key" errors, double-check that:
- The API key is set in Cloud Functions config
- The frontend `.env` file has the matching key
- Functions have been redeployed after config changes

## Troubleshooting

### Error: "Invalid or missing API key"

**Causes:**
- API key not set in Cloud Functions config
- Frontend `.env` missing `VITE_TEST_API_KEY`
- API key mismatch between frontend and backend

**Solution:**
1. Run `firebase functions:config:get` to check current config
2. Verify `.env` file has correct `VITE_TEST_API_KEY`
3. Redeploy functions after config changes

### Error: "CORS error"

**Cause:** CORS headers not configured in Cloud Function

**Solution:**
- The generateAuthLink function already has CORS configured
- If using custom domain, add it to allowed origins

## Current Configuration

For this project (my-box-53040):

- **Cloud Functions URL**: `https://us-central1-my-box-53040.cloudfunctions.net`
- **generateAuthLink Endpoint**: `/generateAuthLink`
- **Test API Key** (dev only): `test-api-key-12345`

**Next Steps:**
1. Set a production API key using Method A or B above
2. Update frontend `.env` with the API key
3. Share API key securely with authorized systems
4. Test the complete flow

---

For more information, see:
- [API Testing Guide](./API-TESTING-GUIDE.md)
- [Implementation Summary](./IMPLEMENTATION-SUMMARY.md)
- [Deployment Guide](./DEPLOYMENT-GUIDE.md)
