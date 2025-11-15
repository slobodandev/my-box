# Firebase Emulator Management Guide

## Quick Commands

### Start Emulators
```bash
firebase emulators:start
```

### Stop All Emulators

**Method 1: In the terminal where emulators are running**
```bash
# Press Ctrl+C
```

**Method 2: Kill all Firebase processes**
```bash
# PowerShell (Run as Administrator)
Get-Process | Where-Object {$_.ProcessName -match "firebase|java"} | Stop-Process -Force

# Or CMD (Run as Administrator)
taskkill /F /IM java.exe
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *firebase*"
```

### Check Port Usage

```bash
# Check specific port (e.g., 8080)
netstat -ano | findstr :8080

# Kill process by PID
taskkill /F /PID <PID_NUMBER>
```

## Common Port Conflicts

### PostgreSQL on Port 5432

If you have PostgreSQL installed and running, it will conflict with Data Connect emulator.

**Solution 1: Stop PostgreSQL Service (Recommended)**
```bash
# Run PowerShell as Administrator
net stop postgresql-x64-16

# Or stop via Services
services.msc
# Find "postgresql-x64-16" and stop it
```

**Solution 2: Let Data Connect Use Alternative Port**
- Data Connect will automatically use port 5434 if 5432 is taken
- This is fine for development

### Port 8080 Already in Use

**Solution: Changed to port 8081 in firebase.json**
- Firestore emulator now uses port 8081 instead of 8080
- This avoids conflicts with common applications

## Current Emulator Ports

| Service      | Port  | URL                           |
|--------------|-------|-------------------------------|
| Auth         | 9099  | http://localhost:9099         |
| Functions    | 5001  | http://localhost:5001         |
| Firestore    | 8081  | http://localhost:8081         |
| Hosting      | 5000  | http://localhost:5000         |
| Storage      | 9199  | http://localhost:9199         |
| Data Connect | 9399  | http://localhost:9399         |
| UI           | 4000  | http://localhost:4000         |

## Troubleshooting

### Error: "Port XXX is not open"

1. **Find what's using the port:**
   ```bash
   netstat -ano | findstr :PORT_NUMBER
   ```

2. **Kill the process:**
   ```bash
   taskkill /F /PID <PID>
   ```

3. **Restart emulators:**
   ```bash
   firebase emulators:start
   ```

### Error: "Could not start Firestore Emulator, port taken"

- I've already changed Firestore to port 8081
- If still having issues, check what's on 8081:
  ```bash
  netstat -ano | findstr :8081
  ```

### Error: PostgreSQL conflict on port 5432

**Option 1: Stop PostgreSQL temporarily**
```bash
# Run as Administrator
net stop postgresql-x64-16

# After testing, restart it
net start postgresql-x64-16
```

**Option 2: Let emulator use port 5434**
- Just ignore the warning
- Data Connect will work on port 5434

### Clean Restart

If emulators are stuck or behaving strangely:

```bash
# 1. Kill all Firebase/Java processes
taskkill /F /IM java.exe
taskkill /F /IM node.exe

# 2. Clear emulator data (optional)
firebase emulators:start --export-on-exit=./emulator-data

# 3. Start fresh
firebase emulators:start
```

## Best Practices

1. **Always use Ctrl+C to stop emulators cleanly**
   - Don't just close the terminal
   - Let emulators shut down gracefully

2. **Stop PostgreSQL when using Data Connect emulator**
   - Prevents port conflicts
   - Restart PostgreSQL after testing

3. **Use the Emulator UI**
   - Visit http://localhost:4000
   - View all emulator statuses
   - Inspect data in Firestore, Auth, Storage

4. **Export data on exit**
   ```bash
   firebase emulators:start --export-on-exit=./emulator-data
   ```

5. **Import previous data**
   ```bash
   firebase emulators:start --import=./emulator-data
   ```

## Environment Setup

### Update Frontend .env for Emulators

When using emulators locally, update your `.env`:

```bash
# Use local emulators instead of production
VITE_CLOUD_FUNCTIONS_BASE_URL=http://localhost:5001/my-box-53040/us-central1
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_PROJECT_ID=demo-my-box
```

### Connect Firebase SDK to Emulators

Your `src/config/firebase.ts` should detect emulators automatically:

```typescript
if (import.meta.env.DEV) {
  // Connect to emulators in development
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectFirestoreEmulator(firestore, 'localhost', 8081);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

## Quick Reference

### Start with Data Export
```bash
firebase emulators:start --export-on-exit=./emulator-data
```

### Start with Data Import
```bash
firebase emulators:start --import=./emulator-data
```

### Start Only Specific Emulators
```bash
# Only Auth and Functions
firebase emulators:start --only auth,functions

# Only Firestore and Data Connect
firebase emulators:start --only firestore,dataconnect
```

### Check Emulator Status
```bash
# Visit the Emulator UI
http://localhost:4000
```

---

For more information, see:
- [Firebase Emulator Suite Documentation](https://firebase.google.com/docs/emulator-suite)
- [FIREBASE-EMULATORS.md](./FIREBASE-EMULATORS.md)
