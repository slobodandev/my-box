# End-to-End Testing Guide

This guide walks you through testing the complete authentication and file management flow.

## Prerequisites

Before testing, ensure:

1. ✅ Cloud Functions are deployed
2. ✅ Frontend is deployed to Firebase Hosting
3. ✅ API key is configured in Cloud Functions
4. ✅ Environment variables are set

## Test Scenarios

### Scenario 1: Test Simulator Flow (Third-Party API Simulation)

This simulates how a third-party system (like a Loan Origination System) would trigger the authentication flow.

#### Step 1: Visit the Test Simulator

1. Open your browser
2. Navigate to: `https://my-box-53040.web.app`
3. You should see the **Sign In** page with a "TEST MODE" badge

**Expected Result:**
- Landing page displays with email input form
- "TEST MODE" badge is visible
- "Advanced Options" toggle is available

#### Step 2: Enter Email and Submit

1. Enter your email address (must be a real email you can access)
2. Optionally, expand "Advanced Options" and customize:
   - Loan Number (default: `LOAN-TEST-001`)
   - Borrower Contact ID (default: `CONTACT-TEST-001`)
3. Click **"Send Sign-In Link"**

**Expected Result:**
- Loading spinner appears
- Request is sent to `generateAuthLink` Cloud Function
- You're redirected to `/auth/email-sent` page
- Success message displays

**Troubleshooting:**
- If you see "Invalid or missing API key" error:
  - Check `.env` file has `VITE_TEST_API_KEY=test-api-key-12345`
  - Verify `functions/.env` has `VALID_API_KEYS=test-api-key-12345`
  - Redeploy Cloud Functions if needed

#### Step 3: Check Your Email

1. Open your email inbox
2. Look for an email from Firebase Authentication
3. Subject should be similar to: "Sign in to [Your App]"

**Expected Result:**
- Email received within 1-2 minutes
- Contains a "Sign In" button/link
- Link URL contains Firebase action code

**Troubleshooting:**
- No email received? Check:
  - Spam/Junk folder
  - Email address was typed correctly
  - Firebase Authentication is enabled in console
  - Firebase Auth domain is configured

#### Step 4: Click the Sign-In Link

1. Click the **"Sign In"** button/link in the email
2. Link will open in your browser

**Expected Result:**
- Browser navigates to `https://my-box-53040.web.app/auth/verify?oobCode=...&apiKey=...`
- Verify page shows "Verifying Sign-In Link" with loading spinner
- Email link verification completes
- Success message shows: "Sign-In Successful!"
- After 1.5 seconds, you're redirected to the file manager

**Troubleshooting:**
- "Invalid or expired sign-in link" error:
  - Link may have been used already
  - Link may have expired (15 minutes)
  - Request a new link from test simulator
- "Confirm Your Email" prompt:
  - Email was cleared from localStorage
  - Enter your email manually and submit

#### Step 5: File Manager Access

1. After successful sign-in, you should see the file manager page

**Expected Result:**
- File manager interface is visible
- User is authenticated
- Session token is stored in localStorage
- Can upload files, view files, delete files

**Verify Authentication:**
1. Open browser DevTools (F12)
2. Go to **Application** > **Local Storage** > `https://my-box-53040.web.app`
3. Check for:
   - `mybox_session_token`: JWT session token
   - `mybox_user`: User information

### Scenario 2: Direct API Call (Postman/cURL)

This tests the generateAuthLink API directly as a third-party system would call it.

#### Using cURL

```bash
curl -X POST https://us-central1-my-box-53040.cloudfunctions.net/generateAuthLink \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-api-key-12345" \
  -d '{
    "email": "your.email@example.com",
    "loanNumber": "LOAN-2024-001",
    "borrowerContactId": "CONTACT-12345",
    "expirationHours": 48
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Authentication link sent successfully",
  "sessionId": "uuid-here",
  "userId": "uuid-here"
}
```

#### Using Postman

1. Import the Postman collection: `docs/MyBox_API.postman_collection.json`
2. Open the **"Generate Auth Link"** request
3. Update the request body with your email
4. Click **Send**
5. Check your email for the sign-in link

### Scenario 3: Session Validation

Test that the session token works correctly for protected endpoints.

#### Step 1: Get Session Token

1. Sign in using Scenario 1
2. Open DevTools > Application > Local Storage
3. Copy the value of `mybox_session_token`

#### Step 2: Test validateSession Endpoint

```bash
curl -X GET https://us-central1-my-box-53040.cloudfunctions.net/validateSession \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "valid": true,
  "message": "Session is valid",
  "user": {
    "id": "user-id",
    "email": "your.email@example.com",
    "role": "user",
    "sessionId": "session-id",
    "loanIds": "[\"loan-id-1\",\"loan-id-2\"]"
  }
}
```

#### Step 3: Test listFiles Endpoint

```bash
curl -X POST https://us-central1-my-box-53040.cloudfunctions.net/listFiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN_HERE" \
  -d '{
    "page": 1,
    "pageSize": 10
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "files": [],
  "total": 0,
  "page": 1,
  "pageSize": 10,
  "totalPages": 0
}
```

### Scenario 4: File Upload Flow

Test the complete file upload workflow.

#### Step 1: Sign In

Complete Scenario 1 to authenticate

#### Step 2: Upload a File

1. In the file manager, click **"Upload File"**
2. Select a file from your computer
3. Optionally add tags
4. Click **Upload**

**Expected Result:**
- File uploads to Firebase Storage
- Progress bar shows upload progress
- File metadata is saved to database
- File appears in file list
- File is associated with loans from your session

#### Step 3: Verify File in Storage

1. Go to Firebase Console
2. Navigate to **Storage**
3. Browse to `users/{userId}/loans/{loanId}/` or `users/{userId}/personal/`
4. Verify file exists

#### Step 4: Download the File

1. In file manager, find the uploaded file
2. Click **Download** button
3. File should download to your computer

#### Step 5: Delete the File (Soft Delete)

1. Click **Delete** button on the file
2. Confirm deletion
3. File should disappear from the list
4. In database, file's `deletedAt` timestamp is set (soft delete)

## Verification Checklist

After completing all scenarios, verify:

- [ ] Email link is received when using test simulator
- [ ] Email link successfully completes authentication
- [ ] User is redirected to file manager after sign-in
- [ ] Session token is stored in localStorage
- [ ] Session token can be validated via API
- [ ] Files can be uploaded to Firebase Storage
- [ ] Files are associated with loan context from session
- [ ] Files can be downloaded
- [ ] Files can be soft-deleted
- [ ] API calls with invalid API key are rejected
- [ ] Expired session tokens are rejected

## Common Issues

### Issue: CORS Error

**Symptom:** Browser console shows CORS policy error

**Solution:**
- Cloud Functions already have CORS configured
- If using custom domain, update CORS allowed origins
- Check that request includes proper headers

### Issue: "Invalid or missing API key"

**Symptom:** 401 error when calling generateAuthLink

**Solution:**
1. Verify `.env` has `VITE_TEST_API_KEY`
2. Verify `functions/.env` has `VALID_API_KEYS`
3. Ensure API keys match
4. Redeploy frontend and functions

### Issue: Email Not Received

**Symptom:** No sign-in email after submission

**Solution:**
1. Check spam folder
2. Verify email address is correct
3. Check Firebase Console > Authentication for errors
4. Ensure Firebase Auth is enabled
5. Check Cloud Functions logs for errors

### Issue: "Invalid action code"

**Symptom:** Email link shows "expired or invalid"

**Solution:**
- Link can only be used once
- Links expire after 15 minutes
- Request a new link from test simulator

### Issue: Session Token Expired

**Symptom:** "Invalid or expired session token" error

**Solution:**
- Session tokens expire after 7 days
- Sign in again to get a new session token
- Token expiration can be configured in `functions/src/utils/jwt.ts`

## Monitoring and Logs

### Cloud Functions Logs

View logs in Firebase Console:
1. Go to **Functions** tab
2. Click on a function name
3. View **Logs** tab
4. Filter by severity (Error, Warning, Info)

### Frontend Logs

Check browser console:
1. Press F12 to open DevTools
2. Go to **Console** tab
3. Look for auth-related messages
4. Check Network tab for API requests

### Database State

Check Data Connect or Firestore:
1. Go to Firebase Console
2. Navigate to **Firestore** or **Data Connect**
3. View collections:
   - `users` - User profiles
   - `auth_sessions` - Active sessions
   - `files` - File metadata
   - `verification_codes` - Verification codes (if using SMS/code flow)

## Next Steps

After successful testing:

1. **Production Configuration:**
   - Generate secure API keys
   - Update Cloud Functions config with prod keys
   - Configure custom email templates in Firebase Auth
   - Set up monitoring and alerts

2. **Integration with Third-Party Systems:**
   - Share API documentation with integrators
   - Provide production API keys securely
   - Set up webhook endpoints if needed
   - Monitor API usage and rate limits

3. **Security Hardening:**
   - Enable Firebase App Check
   - Configure Cloud Armor for DDoS protection
   - Set up audit logging
   - Implement rate limiting

---

For more information:
- [API Testing Guide](./API-TESTING-GUIDE.md)
- [API Key Setup Guide](./API-KEY-SETUP.md)
- [Implementation Summary](./IMPLEMENTATION-SUMMARY.md)
