# MyBox Firebase Deployment Guide

Complete guide for deploying the MyBox application with Firebase services.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Data Connect Deployment](#data-connect-deployment)
4. [Cloud Functions Deployment](#cloud-functions-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [n8n Workflow Setup](#n8n-workflow-setup)
7. [Environment Variables](#environment-variables)
8. [Post-Deployment Testing](#post-deployment-testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Git repository access
- n8n instance (self-hosted or cloud)

---

## Firebase Project Setup

### 1. Initialize Firebase Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase in the project (if not already done)
firebase init

# Select the following services:
# - Data Connect
# - Functions
# - Hosting
# - Storage
```

### 2. Configure Firebase Project

Create `.firebaserc` file in the project root:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 3. Enable Required Firebase Services

In the Firebase Console (https://console.firebase.google.com):

1. **Firebase Authentication**
   - Go to Authentication → Sign-in method
   - Enable Email/Password provider (for manual testing)

2. **Cloud Firestore** (optional for future use)
   - Go to Firestore Database
   - Create database in production mode

3. **Cloud Storage**
   - Go to Storage
   - Create default bucket
   - Storage rules will be deployed automatically

4. **Data Connect**
   - Go to Data Connect
   - Create a PostgreSQL instance
   - Note the connection details

5. **Cloud Functions**
   - Go to Functions
   - Enable billing (required for Cloud Functions)
   - Upgrade to Blaze plan if not already

---

## Data Connect Deployment

### 1. Configure Data Connect

Update `dataconnect/dataconnect.yaml`:

```yaml
specVersion: v1alpha
serviceId: mybox-dataconnect
location: us-central1  # Change to your preferred region

schema:
  source: ./schema
  datasource:
    postgresql:
      database: mybox-db
      cloudSql:
        instanceId: your-project-id:us-central1:mybox-sql  # Update with your instance ID

connectorDirs:
  - ./connector
```

### 2. Deploy Data Connect Schema

```bash
# Deploy the schema to Data Connect
firebase deploy --only dataconnect
```

This will:
- Create all database tables
- Set up indexes
- Generate TypeScript SDK in `src/__generated/dataconnect/`

### 3. Verify Data Connect

```bash
# Test Data Connect locally
firebase emulators:start --only dataconnect

# Open Data Connect UI
# http://localhost:9399
```

---

## Cloud Functions Deployment

### 1. Set Environment Variables

```bash
# Navigate to functions directory
cd functions

# Set JWT secret (IMPORTANT: Use a strong random secret in production)
firebase functions:config:set jwt.secret="$(openssl rand -base64 64)"

# Set Firebase Functions URL (for frontend)
firebase functions:config:set app.base_url="https://your-app.web.app"

# Get config (to verify)
firebase functions:config:get
```

Alternatively, use `.env` file for local development:

```bash
# functions/.env
JWT_SECRET=your-super-secret-jwt-key-change-this
APP_BASE_URL=http://localhost:5173
FIREBASE_DATACONNECT_URL=http://localhost:9399
```

### 2. Install Dependencies

```bash
# In functions directory
npm install
```

### 3. Build Functions

```bash
# Build TypeScript
npm run build
```

### 4. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:verifyMagicLink,functions:verifyCode
```

### 5. Note Function URLs

After deployment, note the function URLs:

```
verifyMagicLink: https://us-central1-your-project.cloudfunctions.net/verifyMagicLink
sendVerificationCode: https://us-central1-your-project.cloudfunctions.net/sendVerificationCode
verifyCode: https://us-central1-your-project.cloudfunctions.net/verifyCode
validateSession: https://us-central1-your-project.cloudfunctions.net/validateSession
processUpload: https://us-central1-your-project.cloudfunctions.net/processUpload
generateDownloadURL: https://us-central1-your-project.cloudfunctions.net/generateDownloadURL
```

---

## Frontend Deployment

### 1. Configure Environment Variables

Create `.env.production` in project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Cloud Functions URL
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-your-project.cloudfunctions.net

# n8n Webhooks
VITE_N8N_MAGIC_LINK_WEBHOOK=https://your-n8n.com/webhook/auth/generate-link
VITE_N8N_SEND_CODE_WEBHOOK=https://your-n8n.com/webhook/auth/send-code
```

### 2. Build Frontend

```bash
# In project root
npm run build
```

This creates the `dist/` folder with optimized production build.

### 3. Deploy to Firebase Hosting

```bash
# Deploy hosting
firebase deploy --only hosting

# Or full deployment
firebase deploy
```

### 4. Access Your Application

```
https://your-project.web.app
```

---

## n8n Workflow Setup

### 1. Import Workflow

1. Open your n8n instance
2. Go to Workflows
3. Click "Import from file"
4. Select `n8n-workflows/auth-generate-magic-link-v2.json`
5. Activate the workflow

### 2. Configure Workflow Environment

Set the following environment variables in n8n:

```bash
JWT_SECRET=same-as-firebase-functions
FIREBASE_DATACONNECT_URL=https://dataconnect.googleapis.com/v1alpha/projects/your-project/locations/us-central1/services/mybox-dataconnect
APP_BASE_URL=https://your-app.web.app
NODE_ENV=production
```

### 3. Update Webhook URLs

Update the webhook URLs in your frontend `.env`:

```env
VITE_N8N_MAGIC_LINK_WEBHOOK=https://your-n8n.com/webhook-test/auth/generate-link
```

### 4. Configure Email Sending

In the n8n workflow, replace the "Send Email" placeholder node with your email service:

**Option A: SendGrid**
- Add SendGrid node
- Configure API key
- Use email template from workflow

**Option B: AWS SES**
- Add AWS SES node
- Configure credentials
- Use email template

**Option C: SMTP**
- Add Email Send node
- Configure SMTP settings
- Use email template

### 5. Test Workflow

```bash
# Test magic link generation
curl -X POST https://your-n8n.com/webhook/auth/generate-link \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "loanIds": [],
    "expirationMinutes": 15
  }'
```

---

## Environment Variables

### Firebase Functions

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing | Generated via `openssl rand -base64 64` |
| `APP_BASE_URL` | Frontend URL | `https://your-app.web.app` |
| `FIREBASE_DATACONNECT_URL` | Data Connect API URL | Auto-configured |
| `NODE_ENV` | Environment | `production` |

### Frontend (.env.production)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | Yes |
| `VITE_FIREBASE_FUNCTIONS_URL` | Cloud Functions base URL | Yes |
| `VITE_N8N_MAGIC_LINK_WEBHOOK` | n8n magic link webhook | Yes |

### n8n Workflow

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET` | Same as Firebase Functions | Yes |
| `FIREBASE_DATACONNECT_URL` | Data Connect API URL | Yes |
| `APP_BASE_URL` | Frontend URL | Yes |

---

## Post-Deployment Testing

### 1. Test Authentication Flow

```bash
# 1. Request magic link
curl -X POST https://your-n8n.com/webhook/auth/generate-link \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# 2. Extract magic link from email (check your email service logs)

# 3. Verify magic link (from frontend)
# Navigate to: https://your-app.web.app/auth/verify?token=<JWT>

# 4. Enter verification code

# 5. Receive session token
```

### 2. Test File Upload

```javascript
// Frontend test
const testUpload = async () => {
  const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

  // Upload to Firebase Storage
  const storagePath = await uploadFile({
    userId: 'test-user-id',
    fileId: crypto.randomUUID(),
    file,
  });

  console.log('Uploaded to:', storagePath);

  // Process upload via Cloud Function
  const response = await processUpload({
    userId: 'test-user-id',
    storagePath,
    originalFilename: 'test.pdf',
  }, sessionToken);

  console.log('File processed:', response);
};
```

### 3. Test File Download

```javascript
// Frontend test
const testDownload = async () => {
  const response = await generateDownloadURL({
    fileId: 'test-file-id',
    expiryMinutes: 60,
  }, sessionToken);

  console.log('Download URL:', response.downloadUrl);

  // Open URL
  window.open(response.downloadUrl, '_blank');
};
```

### 4. Monitor Cloud Functions

```bash
# View function logs
firebase functions:log

# Or in Firebase Console
# Go to Functions → Logs
```

---

## Troubleshooting

### Issue: Data Connect schema deployment fails

**Solution:**
1. Check PostgreSQL instance is running
2. Verify `dataconnect.yaml` configuration
3. Ensure billing is enabled
4. Check firewall rules

```bash
# View Data Connect logs
firebase dataconnect:logs
```

### Issue: Cloud Functions timeout

**Solution:**
1. Increase function timeout in `firebase.json`:

```json
{
  "functions": [{
    "source": "functions",
    "timeout": "60s"
  }]
}
```

2. Optimize function code
3. Use background functions for long-running tasks

### Issue: CORS errors in frontend

**Solution:**
Add CORS headers to Cloud Functions:

```typescript
res.set('Access-Control-Allow-Origin', '*');
res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### Issue: JWT verification fails

**Solution:**
1. Ensure JWT_SECRET matches between n8n and Cloud Functions
2. Check token expiration
3. Verify token format (Bearer <token>)
4. Check issuer and audience claims

```bash
# View JWT_SECRET in functions
firebase functions:config:get jwt.secret
```

### Issue: File upload permissions denied

**Solution:**
1. Check `storage.rules` are deployed:

```bash
firebase deploy --only storage
```

2. Verify user is authenticated
3. Check file size limits
4. Verify storage path matches rules

### Issue: n8n workflow not triggering

**Solution:**
1. Check workflow is activated
2. Verify webhook URL is correct
3. Check n8n logs
4. Test webhook manually with curl

---

## Rollback Procedure

If deployment fails, you can rollback:

```bash
# Rollback functions
firebase deploy:rollback functions

# Rollback hosting
firebase deploy:rollback hosting

# Rollback to specific version
firebase deploy:rollback functions --version 12345
```

---

## Performance Optimization

### 1. Enable CDN for Hosting

Firebase Hosting automatically uses CDN, but you can optimize:

```json
{
  "hosting": {
    "headers": [{
      "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
      "headers": [{
        "key": "Cache-Control",
        "value": "max-age=31536000"
      }]
    }]
  }
}
```

### 2. Optimize Cloud Functions

- Use minimum instance count for critical functions
- Enable concurrency
- Use regional deployment

```json
{
  "functions": [{
    "source": "functions",
    "runtime": "nodejs20",
    "minInstances": 1,
    "maxInstances": 10,
    "concurrency": 80
  }]
}
```

### 3. Data Connect Optimization

- Add indexes for frequently queried fields
- Use connection pooling
- Implement caching layer (Redis) if needed

---

## Security Checklist

- [ ] JWT_SECRET is strong and secure
- [ ] Storage rules are properly configured
- [ ] Data Connect has appropriate access controls
- [ ] HTTPS is enforced (Firebase Hosting does this automatically)
- [ ] Environment variables are not committed to Git
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] File type and size limits are enforced
- [ ] Audit logging is enabled

---

## Monitoring and Alerts

### Set up Firebase Monitoring

1. Go to Firebase Console → Performance
2. Enable Performance Monitoring
3. Set up alerts for:
   - Function errors
   - High latency
   - Storage quota
   - Database connections

### Cloud Logging

```bash
# View all logs
gcloud logging read "resource.type=cloud_function"

# Filter by function
gcloud logging read "resource.labels.function_name=verifyMagicLink"
```

---

## Cost Estimation

**Firebase Services:**
- Data Connect: ~$0.10/hour for PostgreSQL instance
- Cloud Functions: ~$0.40/million invocations
- Storage: $0.026/GB/month
- Hosting: Free for <10GB served/month

**Total estimated cost:** $50-100/month for moderate usage

---

## Support and Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [Data Connect Guide](https://firebase.google.com/docs/data-connect)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [n8n Documentation](https://docs.n8n.io)

---

**Last Updated:** 2025-11-13
**Version:** 1.0.0
