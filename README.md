# MyBox - Loan File Management System

A modern, lightweight loan file management system built with React, TypeScript, Vite, and Tailwind CSS.

## 🎯 Overview

MyBox is a secure document management platform that allows users to organize and manage files related to their loans and personal documents. Built with a modern tech stack and integrated with n8n workflow automation and Azure cloud services.

## ✨ Features

### Implemented ✅
- 📁 File browsing with search and filtering
- 🏦 Loan-based file organization
- 🔍 Real-time search across all files
- 📄 Support for multiple file types (PDF, DOC, DOCX, XLS, XLSX, images)
- 🌓 Dark mode support
- 📱 Responsive design
- 🔄 Loading states and error handling
- 📊 Pagination for large file lists

### Coming Soon 🚧
- 📤 File upload functionality
- 📥 File download
- 🗑️ File deletion
- 🔐 User authentication
- 👤 Personal file management
- 💼 Loan details pages
- 🔄 Windows desktop sync

## 🛠️ Tech Stack

### Frontend
- **React 18+** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router v7** - Navigation
- **Axios** - HTTP client
- **date-fns** - Date formatting

### Backend Services
- **n8n** - Workflow automation (http://48.223.194.241:5678)
- **Azure Blob Storage** - File storage (to be configured)
- **Azure SQL Database** - Data persistence (to be configured)

### Design
- **Material Symbols Outlined** - Icons
- **Inter Font** - Typography
- **Custom Tailwind Theme** - Matching UI mockup

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Windows installation)
- npm or yarn
- Access to n8n instance

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-box
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your configuration
# - n8n webhook URLs are pre-configured
# - Azure credentials (when available)
# - Mock user settings for development
```

### Running the Application

**Development mode:**
```bash
npm run dev
```
The application will be available at http://localhost:5173/

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

### Testing
```bash
# Run unit tests
npm test

# Run linting
npm run lint
```

## 📁 Project Structure

```
my-box/
├── src/
│   ├── components/      # React components
│   │   ├── layout/      # Layout components (Sidebar, etc.)
│   │   ├── files/       # File-related components
│   │   └── common/      # Reusable components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   │   └── n8n/         # n8n integration services
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── constants/       # App constants
├── n8n-workflows/       # n8n workflow specifications
├── ui-design/           # UI mockup files
├── PDR.md              # Product Requirements Document
├── CLAUDE.md           # AI agent instructions
├── PLANNING.md         # Project plan
├── TASKS.md            # Task breakdown
└── PROJECT-SUMMARY.md  # Current project status
```

## 🔗 n8n Workflows

The following workflows are deployed and active:

| Workflow | Endpoint | Purpose |
|----------|----------|---------|
| Get Loan List | `/webhook/get-loans` | Retrieve user's loans |
| File List | `/webhook/file-list` | List files with filters |
| File Upload | `/webhook/file-upload` | Upload files to Azure |
| File Download | `/webhook/file-download` | Download files securely |
| File Delete | `/webhook/file-delete` | Soft delete files |

## 📚 Documentation

- **[PDR.md](./PDR.md)** - Complete product requirements and architecture
- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines and UI design system
- **[PLANNING.md](./PLANNING.md)** - 6-phase project plan
- **[TASKS.md](./TASKS.md)** - Detailed task breakdown
- **[PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)** - Current implementation status

## 🎨 Design System

### Colors
- **Primary:** #135bec (Blue)
- **Background Light:** #f6f6f8
- **Background Dark:** #101622

### Typography
- **Font Family:** Inter
- **Weights:** 400, 500, 700, 900

### Layout
- **Sidebar:** 256px fixed width
- **Icons:** Material Symbols Outlined
- **Responsive:** Mobile-first design

## 🧪 Development Status

**Phase 0: Project Setup** ✅ **COMPLETE**
- [x] Project initialization
- [x] UI components matching mockup
- [x] n8n workflow creation
- [x] Service layer implementation
- [x] Type definitions
- [x] Utility functions
- [x] Custom React hooks
- [x] Component integration with APIs

**Phase 1: Core Features** 🚧 **IN PROGRESS**
- [ ] File upload functionality
- [ ] File download implementation
- [ ] Authentication system
- [ ] Complete all pages
- [ ] Unit testing

## 🤝 Contributing

This is a test project. For development:

1. Follow the coding guidelines in [CLAUDE.md](./CLAUDE.md)
2. Use the defined type definitions
3. Match the UI design system
4. Write tests for new features
5. Use ESLint and Prettier for code formatting

## 📝 Notes

- Currently using mock user ID (`user-123`) for development
- All API calls go through n8n webhooks
- Azure Blob Storage and SQL Database to be configured in Phase 1
- UI exactly matches the design mockup in `ui-design/`

## 📄 License

This is a test project for demonstration purposes.

---

**Status:** Phase 0 Complete - Ready for Phase 1 Development 🎉
