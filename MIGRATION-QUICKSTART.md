# Firebase Migration - Quick Start Guide

**Status:** ✅ Planning Complete, Ready to Execute
**Date:** 2025-11-13

---

## What's Been Done

✅ **Comprehensive Migration Plan Created** (`docs/FIREBASE-MIGRATION-PLAN.md`)
   - Complete architecture design
   - Data Connect schema (500+ lines)
   - GraphQL queries and mutations
   - Cloud Functions specifications
   - File Manager integration plan
   - Testing strategy
   - Deployment checklist

✅ **Initial Data Connect Structure Created**
   - `/dataconnect/dataconnect.yaml` - Main config
   - `/dataconnect/connector/connector.yaml` - Connector config
   - Directory structure ready

---

## Next Steps (In Order)

### Step 1: Complete Data Connect Setup (30 min)

```bash
# 1. Initialize Data Connect with Firebase CLI
firebase init dataconnect

# During initialization:
# - Select existing project: my-box
# - Location: us-central1
# - Create new Cloud SQL instance
# - Database name: mybox-db
# - Enable local emulator: Yes

# 2. This will create/update:
# - dataconnect/ directory (already exists)
# - Cloud SQL instance in Google Cloud
# - Local emulator configuration
```

### Step 2: Create the Schema (1 hour)

Copy the complete schema from `docs/FIREBASE-MIGRATION-PLAN.md` (search for "Phase 2.1") to:

**File:** `dataconnect/schema/schema.gql`

The schema includes:
- User table
- Loan table
- File table
- FileLoanAssociation table
- AuthSession table
- VerificationCode table
- AuthAuditLog table
- RateLimitTracking table

### Step 3: Create GraphQL Queries (1 hour)

Copy queries from plan (search for "Phase 2.2") to:

**File:** `dataconnect/connector/queries.gql`

Includes:
- GetUser, GetUserByEmail
- GetUserLoans, GetLoanWithFiles
- GetUserFiles, GetFilesByLoan
- GetAuthSession, GetActiveSessionsForUser
- GetDashboard

### Step 4: Create GraphQL Mutations (1 hour)

Copy mutations from plan (search for "Phase 2.3") to:

**File:** `dataconnect/connector/mutations.gql`

Includes:
- User CRUD
- Loan CRUD
- File operations
- Auth session management

### Step 5: Deploy Schema (15 min)

```bash
# Test with emulator first
firebase emulators:start --only dataconnect

# Deploy to production
firebase deploy --only dataconnect

# This will:
# ✅ Create PostgreSQL tables
# ✅ Generate TypeScript SDK in src/__generated/dataconnect
# ✅ Set up GraphQL API endpoint
```

### Step 6: Configure Firebase Storage (30 min)

Update `storage.rules` with security rules from plan (search for "Phase 3.2")

```bash
firebase deploy --only storage
```

### Step 7: Install Frontend Dependencies (5 min)

```bash
npm install @firebase/data-connect @cubone/react-file-manager @tanstack/react-query jwt-decode
```

### Step 8: Create Cloud Functions (4 hours)

Implement functions from plan (search for "Phase 4"):
- `functions/src/auth/verifyMagicLink.ts`
- `functions/src/auth/sendVerificationCode.ts`
- `functions/src/auth/verifyCode.ts`
- `functions/src/files/processUpload.ts`

Build and test:
```bash
cd functions
npm run build:watch  # Terminal 1

# Terminal 2
firebase emulators:start --only functions
```

### Step 9: Integrate File Manager (3 hours)

Create `src/components/files/FileManager.tsx` using code from plan (search for "Phase 5.2")

### Step 10: Update Frontend (4 hours)

Use generated Data Connect SDK:

```typescript
import { getUserFiles, createFileMetadata } from '../__generated/dataconnect';

// Type-safe queries!
const { data } = await getUserFiles({ userId });
```

### Step 11: Update n8n Workflow (2 hours)

Replace Azure SQL nodes with HTTP Request nodes calling Data Connect GraphQL API.

### Step 12: Test Everything (4 hours)

```bash
# Start all emulators
firebase emulators:start

# Run tests
npm test

# Manual testing checklist:
# ✅ Upload file
# ✅ Download file
# ✅ Delete file
# ✅ Associate file with loan
# ✅ Generate magic link
# ✅ Verify magic link
# ✅ Send verification code
# ✅ Verify code
# ✅ Access with session JWT
```

---

## Quick Commands Reference

```bash
# Start development (3 terminals)
# Terminal 1: Functions
cd functions && npm run build:watch

# Terminal 2: Emulators
firebase emulators:start

# Terminal 3: Vite
npm run dev

# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only dataconnect
firebase deploy --only functions
firebase deploy --only storage
firebase deploy --only hosting
```

---

## Important Files to Reference

1. **Complete Plan:** `docs/FIREBASE-MIGRATION-PLAN.md`
   - Architecture diagrams
   - Complete code examples
   - Step-by-step instructions

2. **Schema Definition:** Copy from plan to `dataconnect/schema/schema.gql`

3. **Queries:** Copy from plan to `dataconnect/connector/queries.gql`

4. **Mutations:** Copy from plan to `dataconnect/connector/mutations.gql`

5. **Storage Rules:** Copy from plan to `storage.rules`

6. **Cloud Functions:** Implement from plan in `functions/src/`

---

## Migration Strategy

### Option A: All at Once (Risky)
- Migrate everything in one go
- Downtime required
- Faster but risky

### Option B: Gradual (Recommended)
1. **Week 1:** Set up Data Connect, keep Azure running
2. **Week 2:** Migrate file storage, dual-write to both
3. **Week 3:** Migrate auth, redirect new users to Firebase
4. **Week 4:** Complete migration, shut down Azure

### Option C: Feature Flag
- Use environment variables to toggle between old/new
- Can rollback instantly if issues
- No downtime
- Most complex to implement

**Recommendation:** Option B (Gradual)

---

## Rollback Plan

If something goes wrong:

1. **Keep Azure services running** during migration
2. **Feature flag in code:**
   ```typescript
   const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';
   ```
3. **Switch back** by changing environment variable
4. **No data loss** - both systems running in parallel

---

## Cost Monitoring

Set up billing alerts:
1. Firebase Console → Project Settings → Usage and Billing
2. Set alert at $10/month
3. Monitor daily for first week

Expected costs:
- Data Connect: ~$0.26/GB
- Storage: ~$0.026/GB
- Functions: First 2M invocations free
- **Total:** ~$5-15/month (similar to Azure)

---

## Getting Help

If you get stuck:

1. **Check the full plan:** `docs/FIREBASE-MIGRATION-PLAN.md`
2. **Firebase docs:** https://firebase.google.com/docs/data-connect
3. **Data Connect emulator:** http://localhost:4000 (when running)
4. **Function logs:** `firebase functions:log`

---

## Success Criteria

Migration is complete when:

✅ All files uploaded to Firebase Storage
✅ All database records in Data Connect
✅ File manager working with @cubone/react-file-manager
✅ Authentication flow working end-to-end
✅ n8n magic link generation using Data Connect
✅ All tests passing
✅ Azure services can be shut down

---

## Ready to Start?

**Recommended First Step:**

```bash
# 1. Read the full plan
cat docs/FIREBASE-MIGRATION-PLAN.md

# 2. Initialize Data Connect
firebase init dataconnect

# 3. Create schema file
# Copy schema from plan to dataconnect/schema/schema.gql

# 4. Deploy schema
firebase dataconnect:sql:migrate

# 5. Check generated SDK
ls src/__generated/dataconnect

# You should see type-safe functions!
```

**Then follow steps 1-12 above.**

---

## Questions to Answer Before Starting

- [ ] Do you have a Google Cloud Platform account?
- [ ] Is billing enabled on your Firebase project?
- [ ] Do you want to test with emulators first or go straight to production?
- [ ] Should we keep Azure running during migration?
- [ ] Do you want help with any specific step?

---

**Total Time Estimate:** 20-25 hours (3-4 days)
**Recommended Pace:** 1-2 steps per day
**Risk Level:** Low (with gradual migration)

Let me know which step you want to start with!
