# Firebase Emulators Guide

## Overview

Firebase Local Emulator Suite allows you to develop and test your app locally without connecting to production Firebase services. This is useful for:
- Development without affecting production data
- Testing without incurring costs
- Working offline
- Running automated tests

## Configured Emulators

Your project has the following emulators configured:

| Service | Port | URL |
|---------|------|-----|
| **Authentication** | 9099 | http://localhost:9099 |
| **Firestore** | 8080 | http://localhost:8080 |
| **Storage** | 9199 | http://localhost:9199 |
| **Functions** | 5001 | http://localhost:5001 |
| **Hosting** | 5000 | http://localhost:5000 |
| **Emulator UI** | 4000 | http://localhost:4000 |

## Starting Emulators

### Option 1: Using NPM Scripts (Recommended)

```bash
# Start all emulators
npm run emulators

# Start all emulators with imported data
npm run emulators:import
```

### Option 2: Using Firebase CLI Directly

```bash
# Start all emulators
firebase emulators:start

# Start specific emulators only
firebase emulators:start --only auth,firestore,storage

# Start with data import
firebase emulators:start --import=./emulator-data

# Start with data export on shutdown
firebase emulators:start --export-on-exit=./emulator-data
```

## Development Workflow

### 1. Start Development Environment

**Terminal 1: Start Firebase Emulators**
```bash
npm run emulators
```

**Terminal 2: Start Vite Dev Server**
```bash
npm run dev
```

Your app will automatically connect to emulators in development mode (configured in `src/config/firebase.ts`).

### 2. Access Emulator UI

Open http://localhost:4000 to access the Firebase Emulator Suite UI where you can:
- View and edit Firestore data
- Manage authentication users
- Browse storage files
- View logs and traces
- Test functions

## Data Persistence

### Export Data (Save Emulator State)

```bash
# Export data from running emulators
npm run emulators:export

# Or manually
firebase emulators:export ./emulator-data
```

This creates a snapshot of your emulator data in the `./emulator-data` directory.

### Import Data (Load Previous State)

```bash
# Start emulators with imported data
npm run emulators:import

# Or manually
firebase emulators:start --import=./emulator-data
```

### Auto-save on Exit

```bash
firebase emulators:start --export-on-exit=./emulator-data
```

This automatically saves emulator data when you stop the emulators (Ctrl+C).

## Automatic Emulator Connection

Your app automatically connects to emulators in development mode. This is configured in `src/config/firebase.ts`:

```typescript
if (import.meta.env.DEV) {
  // Connects to Auth emulator on port 9099
  // Connects to Firestore emulator on port 8080
  // Connects to Storage emulator on port 9199
}
```

No code changes needed when switching between development and production!

## Seeding Test Data

### Option 1: Using Emulator UI
1. Start emulators: `npm run emulators`
2. Open http://localhost:4000
3. Manually add test data through the UI

### Option 2: Using Scripts (Future Enhancement)
Create seed scripts in `scripts/seed-emulator-data.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Connect to emulators
// Add seed data
```

## Testing with Emulators

### Unit Tests

```typescript
// test/firebase.test.ts
import { connectFirestoreEmulator } from 'firebase/firestore';

beforeAll(() => {
  connectFirestoreEmulator(db, 'localhost', 8080);
});
```

### Integration Tests

Run tests against emulators:
```bash
# Terminal 1: Start emulators
npm run emulators

# Terminal 2: Run tests
npm run test
```

## Cloud Functions

### Building Functions (REQUIRED)

**IMPORTANT:** Before starting the emulators, you MUST compile your TypeScript functions to JavaScript.

Firebase Functions are written in TypeScript (`functions/src/*.ts`) but need to be compiled to JavaScript (`functions/lib/*.js`) before they can run.

#### Build Once:
```bash
cd functions
npm run build
```

#### Build and Watch (Recommended for Development):
```bash
cd functions
npm run build:watch
```

This watches for changes and automatically rebuilds.

#### Common Function Errors:

**Error:** `functions\lib\index.js does not exist, can't deploy Cloud Functions`

**Solution:**
```bash
# Navigate to functions directory
cd functions

# Build TypeScript to JavaScript
npm run build

# Verify lib directory exists
ls lib/
# You should see: index.js, index.js.map

# Go back to project root
cd ..

# Now start emulators
npm run emulators
```

### Development Workflow with Functions

**Terminal 1: Build Functions (watch mode)**
```bash
cd functions
npm run build:watch
```

**Terminal 2: Start Emulators**
```bash
npm run emulators
```

**Terminal 3: Start Vite Dev Server**
```bash
npm run dev
```

## Troubleshooting

### Functions: lib/index.js does not exist

**Error Message:**
```
Failed to load function definition from source: FirebaseError: There was an error reading functions\package.json:
functions\lib\index.js does not exist, can't deploy Cloud Functions
```

**Cause:** TypeScript functions haven't been compiled to JavaScript.

**Solution:**
```bash
cd functions
npm run build
cd ..
firebase emulators:start
```

**Permanent Fix:** Use `npm run build:watch` in a separate terminal to auto-rebuild on changes.

### Port Already in Use

If you get a port conflict error:

```bash
# Find process using the port (Windows)
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <process_id> /F

# Or change port in firebase.json
```

### Emulators Not Connecting

1. Check that emulators are running: `firebase emulators:list`
2. Verify ports in `firebase.json` match those in `src/config/firebase.ts`
3. Check browser console for connection errors
4. Ensure you're running in development mode (`npm run dev`)

### Clear Emulator Data

```bash
# Delete emulator data directory
rm -rf emulator-data/

# Start fresh
npm run emulators
```

### CORS Issues

If you encounter CORS issues:
1. Emulators should handle CORS automatically
2. Ensure you're using `http://127.0.0.1` or `http://localhost` (not mixing them)
3. Check that Vite dev server is running on the same domain

## Security Rules Testing

Test your Firestore and Storage rules locally:

```bash
# Initialize rules
firebase init firestore
firebase init storage

# Edit rules
# - firestore.rules
# - storage.rules

# Rules are automatically loaded by emulators
```

### Test Rules in Emulator UI

1. Go to http://localhost:4000
2. Navigate to Firestore or Storage tab
3. Use the "Rules" section to test different scenarios

## Production vs Development

### Development (with Emulators)
- `npm run dev` - Vite starts, connects to emulators
- Data is local, no costs
- Changes don't affect production

### Production (with Real Firebase)
- `npm run build` - Builds for production
- Connects to real Firebase services
- Uses production credentials from `.env`

## Best Practices

1. **Always use emulators for development** - Avoid accidentally modifying production data
2. **Export data regularly** - Use `--export-on-exit` to save your work
3. **Commit seed data** - Version control your test data setup
4. **Use realistic data** - Test with data similar to production
5. **Test security rules** - Verify rules work as expected before deploying
6. **Clear data between tests** - Ensure consistent test results

## Firebase Hosting with Emulator

To test the built app locally:

```bash
# Build the app
npm run build

# Start hosting emulator
firebase emulators:start --only hosting

# Visit http://localhost:5000
```

## Deployment

When you're ready to deploy to production:

```bash
# Deploy everything
npm run firebase:deploy

# Deploy only hosting
npm run firebase:deploy:hosting

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only functions
```

## Resources

- [Firebase Emulator Suite Documentation](https://firebase.google.com/docs/emulator-suite)
- [Connect your app to the emulators](https://firebase.google.com/docs/emulator-suite/connect_and_prototype)
- [Test with emulators](https://firebase.google.com/docs/emulator-suite/install_and_configure)

## Quick Reference

```bash
# Start all emulators
npm run emulators

# Start dev server (connects to emulators automatically)
npm run dev

# Access Emulator UI
http://localhost:4000

# Export data
npm run emulators:export

# Import data
npm run emulators:import

# Deploy to production
npm run firebase:deploy
```
