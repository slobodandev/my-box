# MyBox - Loan File Management System

A modern, secure document management platform for organizing and managing loan-related files.

## Overview

MyBox enables users to:
- Upload and manage loan-related documents
- Organize files by loan association
- Store personal files securely
- Access files through a responsive web interface

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+, TypeScript, Vite, Tailwind CSS |
| Backend | Firebase Cloud Functions |
| Database | Firebase Data Connect (PostgreSQL) |
| Storage | Firebase Storage |
| Authentication | Firebase Email Link Auth |
| Email | Resend |

## Features

### Implemented
- File upload/download/delete operations
- Loan-based file organization
- Search and filtering
- Passwordless authentication (Email Link)
- Dark mode support
- Responsive design

### Pending
- End-to-end testing
- Production deployment

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project configured

### Installation

```bash
# Clone repository
git clone <repository-url>
cd my-box

# Install dependencies
npm install

# Install Cloud Functions dependencies
cd functions && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials
```

### Development

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start frontend
npm run dev
```

Application runs at http://localhost:5173

### Build & Deploy

```bash
# Build frontend
npm run build

# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only functions
firebase deploy --only hosting
firebase deploy --only dataconnect
```

## Project Structure

```
my-box/
├── functions/           # Firebase Cloud Functions
│   └── src/
│       ├── auth/       # Authentication functions
│       ├── files/      # File operation functions
│       └── users/      # User management functions
├── dataconnect/        # Firebase Data Connect
│   ├── schema/         # GraphQL schema
│   └── connector/      # Queries and mutations
├── src/                # React frontend
│   ├── components/     # UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom hooks
│   ├── contexts/       # React contexts
│   └── services/       # Firebase services
├── docs/               # Documentation
└── public/             # Static assets
```

## Cloud Functions

| Function | Purpose |
|----------|---------|
| `generateAuthLink` | Generate auth links for third-party API |
| `verifyEmailLink` | Handle email link verification |
| `validateSession` | Validate session tokens |
| `processUpload` | Process file uploads |
| `listFiles` | List files with filters |
| `deleteFile` | Soft delete files |
| `generateDownloadURL` | Generate signed download URLs |

## Documentation

- [Implementation Summary](docs/IMPLEMENTATION-SUMMARY.md)
- [Migration Status](docs/MIGRATION-STATUS.md)
- [Cloud Functions Config](docs/CLOUD-FUNCTIONS-CONFIG.md)
- [Firebase Emulators](docs/FIREBASE-EMULATORS.md)
- [Deployment Guide](docs/DEPLOYMENT-GUIDE.md)
- [Hooks Guide](docs/HOOKS-GUIDE.md)

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm test             # Run tests
npm run preview      # Preview production build
```

## Environment Variables

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_KEY=
```

## Architecture Note

This project was migrated from n8n + Azure to Firebase in November 2025. Historical documentation is available in `docs/archive/`.

## License

This is a test project for demonstration purposes.

---

**Status:** Migration Complete - Ready for Testing & Deployment
