# Java Setup for Firebase Emulators

## Why Do I Need Java?

Firebase Emulator Suite requires Java Runtime Environment (JRE) or Java Development Kit (JDK) to run the local emulators for Firestore, Realtime Database, and other services.

## Requirements

- **Java Version**: 11 or higher (LTS versions recommended: 11, 17, or 21)
- **Type**: JRE (Runtime) is sufficient, but JDK (Development Kit) works too

## Installation Methods

### Method 1: Microsoft Build of OpenJDK (Recommended for Windows)

**Why Microsoft OpenJDK?**
- Official Microsoft build
- Pre-configured for Windows
- Auto-configures PATH
- No license concerns

**Installation Steps:**

1. Visit: https://learn.microsoft.com/en-us/java/openjdk/download

2. Download:
   - **Version**: OpenJDK 11 or 17 (LTS)
   - **Installer**: Windows x64 MSI

3. Run the installer:
   - Accept license
   - Use default installation path (e.g., `C:\Program Files\Microsoft\jdk-11.x.x`)
   - ✅ Check: "Set JAVA_HOME variable"
   - ✅ Check: "Add to PATH"

4. Verify installation (open new Command Prompt):
   ```cmd
   java -version
   ```

   Expected output:
   ```
   openjdk version "11.0.x" 2024-xx-xx
   OpenJDK Runtime Environment Microsoft-xxxxxxx (build 11.0.x+x)
   OpenJDK 64-Bit Server VM Microsoft-xxxxxxx (build 11.0.x+x, mixed mode)
   ```

### Method 2: Chocolatey Package Manager

If you have Chocolatey installed:

```powershell
# Open PowerShell as Administrator
choco install openjdk11
```

or for Java 17:

```powershell
choco install openjdk17
```

### Method 3: Winget (Windows Package Manager)

If you have Windows 10/11 with winget:

```powershell
# Microsoft OpenJDK 11
winget install Microsoft.OpenJDK.11

# Or Eclipse Temurin (Adoptium)
winget install EclipseAdoptium.Temurin.11.JDK
```

### Method 4: Eclipse Temurin (Adoptium)

**Alternative OpenJDK distribution:**

1. Visit: https://adoptium.net/

2. Select:
   - **Version**: 11 (LTS) or 17 (LTS)
   - **Operating System**: Windows
   - **Architecture**: x64
   - **Package Type**: JDK

3. Download and run the `.msi` installer

4. During installation:
   - ✅ Check: "Add to PATH"
   - ✅ Check: "Set JAVA_HOME variable"
   - ✅ Check: "JavaSoft (Oracle) registry keys"

## Manual PATH Configuration

If Java installed but not in PATH:

### Windows 10/11

1. **Find Java installation path:**
   ```
   C:\Program Files\Microsoft\jdk-11.x.x\
   C:\Program Files\Java\jdk-11.x.x\
   C:\Program Files\Eclipse Adoptium\jdk-11.x.x\
   ```

2. **Add to System PATH:**
   - Right-click "This PC" → Properties
   - Click "Advanced system settings"
   - Click "Environment Variables"

   **Add JAVA_HOME:**
   - Under "System variables", click "New"
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Microsoft\jdk-11.x.x` (your path)

   **Update PATH:**
   - Under "System variables", find "Path"
   - Click "Edit" → "New"
   - Add: `%JAVA_HOME%\bin`
   - Click OK

3. **Verify (open NEW terminal):**
   ```cmd
   echo %JAVA_HOME%
   java -version
   ```

### Using Command Line (PowerShell as Administrator)

```powershell
# Set JAVA_HOME
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Microsoft\jdk-11.0.xx', [System.EnvironmentVariableTarget]::Machine)

# Add to PATH
$path = [System.Environment]::GetEnvironmentVariable('Path', [System.EnvironmentVariableTarget]::Machine)
$newPath = $path + ';%JAVA_HOME%\bin'
[System.Environment]::SetEnvironmentVariable('Path', $newPath, [System.EnvironmentVariableTarget]::Machine)
```

## Verification Checklist

After installation, verify everything works:

```bash
# 1. Check Java version
java -version
# Should show: openjdk version "11.x.x" or higher

# 2. Check Java compiler (if JDK installed)
javac -version
# Should show: javac 11.x.x or higher

# 3. Check JAVA_HOME
echo %JAVA_HOME%
# Should show: C:\Program Files\Microsoft\jdk-11.x.x (or similar)

# 4. Check PATH
echo %PATH%
# Should include: ...;%JAVA_HOME%\bin;...
```

## Test Firebase Emulators

Once Java is installed:

```bash
# Navigate to your project
cd C:\Users\bobah\WebstormProjects\my-box

# Try starting emulators
npm run emulators
```

Expected output:
```
i  emulators: Starting emulators: auth, firestore, functions, hosting, storage
✔  emulators: All emulators started successfully
```

## Troubleshooting

### "Java not found" after installation

**Solution:**
1. Close ALL terminal windows
2. Open NEW terminal (important!)
3. Try `java -version` again

### Multiple Java versions installed

**Check all versions:**
```cmd
where java
```

**Use specific version:**
1. Update JAVA_HOME to point to desired version
2. Ensure that version's `bin` folder is first in PATH

### WSL (Windows Subsystem for Linux) Users

If using WSL, install Java in WSL:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-11-jdk

# Verify
java -version
```

### "Access Denied" errors

**Solution:**
- Run installer as Administrator
- Right-click installer → "Run as administrator"

### Emulator still won't start

**Check Java version:**
```bash
java -version
```

Must be **Java 11 or higher**. Java 8 is NOT supported.

**Reinstall Firebase CLI:**
```bash
npm install -g firebase-tools
```

## Recommended Version

**For Firebase Emulators:**
- ✅ **Java 11** (LTS) - Most tested, recommended
- ✅ **Java 17** (LTS) - Also works well
- ✅ **Java 21** (Latest LTS) - Works, cutting edge
- ❌ **Java 8** - Too old, not supported

## Quick Reference

```bash
# Install via Winget
winget install Microsoft.OpenJDK.11

# Install via Chocolatey
choco install openjdk11

# Verify installation
java -version

# Start Firebase emulators
npm run emulators
```

## Resources

- [Microsoft OpenJDK Downloads](https://learn.microsoft.com/en-us/java/openjdk/download)
- [Adoptium (Eclipse Temurin)](https://adoptium.net/)
- [Firebase Emulator Requirements](https://firebase.google.com/docs/emulator-suite/install_and_configure)
- [Oracle JDK Downloads](https://www.oracle.com/java/technologies/downloads/)
