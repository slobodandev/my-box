# Product Requirements Document (PDR)
## Loan File Management System

**Version:** 1.0
**Date:** 2025-11-10
**Status:** Draft

---

## 1. Executive Summary

A lightweight web-based file management system that enables users to manage documents related to loans and personal files. The system leverages Azure cloud services for storage and database, n8n for workflow automation, and provides a modern React-based interface.

---

## 2. Objectives

- Provide a centralized platform for loan-related file management
- Enable users to upload, download, and organize files
- Associate files with specific loans or maintain them as personal documents
- Support multi-loan file associations
- Integrate with Azure infrastructure for scalability and reliability
- Automate file operations through n8n workflows
- Prepare for future desktop synchronization capabilities

---

## 3. Technology Stack

### 3.1 Frontend
- **Framework:** React 18+ with Vite
- **Language:** TypeScript
- **CSS Framework:** Tailwind CSS
- **Icons:** Material Symbols Outlined (Google Icons)
- **Font:** Inter (Google Fonts)
- **Build Tool:** Vite
- **Package Manager:** npm/yarn/pnpm
- **UI Design Reference:** See `ui-design/screen.png` and `ui-design/code.html` for design mockup

### 3.2 Backend/Services
- **File Storage:** Azure Blob Storage
- **Database:** Azure SQL Database
- **Workflow Engine:** n8n (self-hosted or cloud)
- **API Integration:** n8n webhooks and HTTP nodes

### 3.3 Future Enhancements
- **Desktop Sync:** Windows desktop application for file synchronization

---

## 4. UI/UX Design Reference

### 4.1 Design Mockup
The UI design mockup is located in `ui-design/` directory:
- **Screenshot:** `ui-design/screen.png`
- **HTML Reference:** `ui-design/code.html`

### 4.2 Design System

#### Colors
- **Primary:** #135bec (Blue)
- **Background Light:** #f6f6f8
- **Background Dark:** #101622
- **File Type Colors:**
  - PDF: Red (#ef4444)
  - Document: Blue (#3b82f6)
  - Image: Green (#22c55e)

#### Typography
- **Font Family:** Inter (sans-serif)
- **Heading:** 3xl (30px), bold
- **Body:** Base (16px), normal
- **Small:** sm (14px)

#### Layout
- **Sidebar Width:** 256px (w-64)
- **Border Radius:**
  - Default: 0.25rem
  - Large: 0.5rem
  - XL: 0.75rem (for cards)
  - Full: 9999px (for pills/badges)

#### Components
- **Buttons:** Primary blue background, rounded-lg, shadow-sm, hover effect
- **Cards/Panels:** White background, rounded-xl, border
- **Badges:** Rounded-full pills for loan associations
  - Blue badges for loans
  - Gray badges for personal files
- **Table:** Striped rows, hover states, bordered
- **Icons:** Material Symbols Outlined, 24px base size
- **Search Bar:** Icon prefix, rounded-lg, border
- **Pagination:** Numbered buttons with active state

### 4.3 Key UI Screens

#### Main Dashboard (All Files)
- Left sidebar with navigation
- Welcome header with user name
- Search and filter bar
- File list table with:
  - File name with icon
  - File size
  - Upload date
  - Associated loans (as badges)
  - Actions menu
- Pagination footer

#### Sidebar Navigation
- Logo and app name
- Navigation items:
  - All Files (default view)
  - Personal Files
  - Loans (expandable list)
- "New Loan" button at bottom

---

## 5. Functional Requirements

### 5.1 User Management
- **FR-1.1:** System shall authenticate users
- **FR-1.2:** System shall maintain user profiles with metadata
- **FR-1.3:** Users shall have unique identifiers for file association

### 5.2 Loan Management
- **FR-2.1:** System shall retrieve loan information from Azure SQL DB
- **FR-2.2:** System shall display loan details (ID, borrower, status, etc.)
- **FR-2.3:** Users shall be able to view loans they have access to
- **FR-2.4:** System shall support loan-specific file organization

### 5.3 File Management

#### 5.3.1 File Upload
- **FR-3.1:** Users shall upload files through the web interface
- **FR-3.2:** Upload process shall be handled via n8n workflow
- **FR-3.3:** Files shall be stored in Azure Blob Storage
- **FR-3.4:** File metadata shall be stored in Azure SQL DB
- **FR-3.5:** Users shall be able to associate files with one or multiple loans
- **FR-3.6:** Users shall be able to upload personal files without loan association

#### 5.3.2 File Download
- **FR-3.7:** Users shall download files through the web interface
- **FR-3.8:** Download process shall be handled via n8n workflow
- **FR-3.9:** System shall retrieve files using blob storage identifiers
- **FR-3.10:** System shall log download activities

#### 5.3.3 File Listing
- **FR-3.11:** Users shall view all their files
- **FR-3.12:** Users shall filter files by loan association
- **FR-3.13:** Users shall view personal files separately
- **FR-3.14:** System shall display file metadata (name, size, upload date, type)
- **FR-3.15:** File listing shall be retrieved via n8n workflow

#### 5.3.4 File Organization
- **FR-3.16:** Users shall tag files with custom labels
- **FR-3.17:** Users shall search files by name, date, or loan
- **FR-3.18:** System shall support file categorization
- **FR-3.19:** Users shall be able to update file associations

### 5.4 Data Model Requirements

#### 5.4.1 Database Schema
- **FR-4.1:** Users table (user_id, name, email, created_at, etc.)
- **FR-4.2:** Loans table (loan_id, borrower, amount, status, etc.)
- **FR-4.3:** Files table (file_id, user_id, blob_identifier, filename, size, content_type, uploaded_at, etc.)
- **FR-4.4:** File-Loan associations table (file_id, loan_id, associated_at)
- **FR-4.5:** Audit logs table (action, user_id, file_id, timestamp)

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR-1.1:** File upload shall support files up to 100MB
- **NFR-1.2:** File listing shall load within 2 seconds
- **NFR-1.3:** File download shall stream efficiently

### 5.2 Security
- **NFR-2.1:** All file operations shall be authenticated
- **NFR-2.2:** Users shall only access their own files or authorized loan files
- **NFR-2.3:** Communication with Azure services shall use secure connections
- **NFR-2.4:** Sensitive data shall be encrypted at rest and in transit

### 5.3 Scalability
- **NFR-3.1:** System shall handle up to 10,000 files per user
- **NFR-3.2:** System shall support concurrent uploads/downloads
- **NFR-3.3:** Azure Blob Storage shall provide horizontal scaling

### 5.4 Usability
- **NFR-4.1:** Interface shall be intuitive and responsive
- **NFR-4.2:** System shall provide clear error messages
- **NFR-4.3:** File operations shall show progress indicators

### 5.5 Maintainability
- **NFR-5.1:** Code shall follow TypeScript best practices
- **NFR-5.2:** Components shall be modular and reusable
- **NFR-5.3:** System shall have comprehensive documentation

---

## 6. Architecture Overview

### 6.1 System Components

```
┌─────────────────┐
│   React App     │ (Vite + TypeScript + Ant Design)
└────────┬────────┘
         │
         ├─────────────┐
         │             │
    ┌────▼─────┐  ┌───▼──────────┐
    │   n8n    │  │  Azure SQL   │
    │ Workflows│  │   Database   │
    └────┬─────┘  └──────────────┘
         │
    ┌────▼──────────┐
    │  Azure Blob   │
    │   Storage     │
    └───────────────┘
```

### 6.2 Workflow Architecture

#### Upload Workflow (n8n)
1. React app sends file + metadata to n8n webhook
2. n8n uploads file to Azure Blob Storage
3. n8n receives blob identifier
4. n8n inserts metadata into Azure SQL DB
5. n8n returns success response to React app

#### Download Workflow (n8n)
1. React app requests file by file_id via n8n
2. n8n queries Azure SQL DB for blob identifier
3. n8n retrieves file from Azure Blob Storage
4. n8n streams file back to React app

#### List Files Workflow (n8n)
1. React app requests file list (with filters) via n8n
2. n8n queries Azure SQL DB
3. n8n returns file metadata array
4. React app renders file list

---

## 7. User Stories

### 7.1 File Upload
**As a** loan officer
**I want to** upload documents related to a specific loan
**So that** all loan documentation is centrally stored and accessible

### 7.2 Multi-Loan Association
**As a** user
**I want to** associate a single document with multiple loans
**So that** I don't need to upload duplicate files

### 7.3 Personal Files
**As a** user
**I want to** upload personal files not related to any loan
**So that** I can use the system as a general document repository

### 7.4 File Organization
**As a** user
**I want to** filter and search my files
**So that** I can quickly find documents I need

### 7.5 File Download
**As a** user
**I want to** download files I previously uploaded
**So that** I can work with them locally

---

## 8. Future Enhancements

### 8.1 Phase 2 - Desktop Synchronization
- Windows desktop application for automatic file sync
- Bi-directional sync between local folder and Azure Blob Storage
- Conflict resolution mechanisms
- Offline access to files

### 8.2 Phase 3 - Additional Features
- File versioning
- Collaborative file annotations
- Advanced search with OCR
- Mobile application
- Automated file organization using AI

---

## 9. Constraints and Assumptions

### 9.1 Constraints
- Must use Azure infrastructure
- Must use n8n for workflow automation
- Must use Ant Design for UI components
- Initial deployment is web-only

### 9.2 Assumptions
- Users have modern web browsers (Chrome, Firefox, Edge, Safari)
- Azure services are properly configured and accessible
- n8n instance is available and operational
- Users have stable internet connections
- Azure SQL DB schema can be modified as needed

---

## 10. Success Metrics

- **Metric 1:** Users can upload files with 99% success rate
- **Metric 2:** File retrieval time < 3 seconds for files < 10MB
- **Metric 3:** Zero unauthorized file access incidents
- **Metric 4:** User satisfaction score > 4.0/5.0
- **Metric 5:** System uptime > 99.5%

---

## 11. Dependencies

- Azure subscription with Blob Storage and SQL Database
- n8n instance (cloud or self-hosted)
- Access credentials for Azure services
- Database schema and sample data
- Network connectivity between all services

---

## 12. Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Azure service outage | High | Low | Implement retry logic, show user-friendly errors |
| n8n workflow failure | High | Medium | Add error handling, logging, and fallback mechanisms |
| Large file upload issues | Medium | Medium | Implement chunked uploads, progress indicators |
| Security vulnerabilities | High | Medium | Regular security audits, follow OWASP guidelines |
| Database connection issues | High | Low | Connection pooling, timeout handling |

---

## 13. Open Questions

1. What are the authentication requirements? (Azure AD, custom, OAuth?)
2. What are the specific file type restrictions?
3. What is the retention policy for files?
4. Are there regulatory compliance requirements (GDPR, HIPAA, etc.)?
5. What are the user roles and permissions structure?
6. Should files be soft-deleted or permanently deleted?
7. What is the expected number of concurrent users?

---

## 14. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Technical Lead | | | |
| Stakeholder | | | |

---

## Appendix A: Glossary

- **Blob Storage:** Azure's object storage solution for cloud
- **n8n:** Open-source workflow automation tool
- **Vite:** Modern frontend build tool
- **Ant Design:** Enterprise-class UI design language and React UI library
- **Azure SQL DB:** Microsoft's cloud-based relational database service
