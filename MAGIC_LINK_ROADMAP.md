# Magic Link Management - Feature Roadmap

## ✅ Phase 1: Basic Implementation (Current)

### Features Implemented
- [x] Generate magic link button for each user
- [x] Modal with borrower email and send-to email fields
- [x] Days valid configuration (1-30 days)
- [x] Integration with existing `generateAuthLink` cloud function
- [x] Copy link to clipboard functionality
- [x] Auto-populate borrower email as default send-to email

### User Flow
1. Admin clicks "Generate Link" button next to user
2. Modal opens with pre-filled borrower email (user's email)
3. Admin can override send-to email if needed
4. Admin sets expiry days (default: 7 days)
5. Link is generated and can be copied
6. Link can be manually sent to borrower

---

## 📋 Phase 2: Advanced Features (Future)

### Database Schema Updates

#### New table: `magic_links`
```sql
CREATE TABLE magic_links (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  borrower_email VARCHAR(255) NOT NULL,
  send_to_email VARCHAR(255) NOT NULL,
  magic_link_url TEXT NOT NULL,
  session_id VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  sent_at TIMESTAMP,
  last_sent_at TIMESTAMP,
  send_count INTEGER DEFAULT 0,
  used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMP,
  revoked_by UUID
);
```

#### Indexes
- `idx_magic_links_user_id` on `user_id`
- `idx_magic_links_session_id` on `session_id`
- `idx_magic_links_expires_at` on `expires_at`
- `idx_magic_links_is_active` on `is_active`

### Features to Implement

#### 1. **Persistent Link Storage**
- Store all generated links in database
- Track creation, expiry, and usage
- Link to user record for easy retrieval

#### 2. **Link Management in User Table**
- Show existing active links for each user
- Display expiry countdown (e.g., "Expires in 3 days")
- Visual indicators:
  - 🟢 Active (more than 2 days left)
  - 🟡 Expiring soon (less than 2 days)
  - 🔴 Expired
  - ✅ Used

#### 3. **Resend Functionality**
- "Resend" button for existing active links
- Track send count and timestamps
- Option to generate fresh link vs resend existing
- Email history for each link

#### 4. **Link Renewal/Extension**
- Extend expiry date of existing link
- Generate new link with same parameters
- Automatically revoke old link when new one is created

#### 5. **Link Revocation**
- Manual revoke button for active links
- Automatic revocation when:
  - User successfully signs in
  - New link is generated for same user
  - Admin manually revokes

#### 6. **Enhanced Modal UI**
```
┌─────────────────────────────────────────┐
│  Generate Magic Link for John Doe       │
├─────────────────────────────────────────┤
│                                          │
│  Existing Links (2):                     │
│  ┌────────────────────────────────────┐ │
│  │ 🟢 Active - Expires in 4 days      │ │
│  │ Created: 2025-01-10 2:30 PM        │ │
│  │ Sent 2 times                       │ │
│  │ [Copy] [Resend] [Revoke]           │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ 🔴 Expired - 2 days ago            │ │
│  │ Created: 2025-01-01 10:00 AM       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ─── or Generate New Link ───           │
│                                          │
│  Borrower Email:                        │
│  john.doe@example.com                   │
│                                          │
│  Send To Email:                         │
│  john.doe@example.com                   │
│                                          │
│  Valid For: [7] days                    │
│                                          │
│  [ ] Send email immediately             │
│                                          │
│  [Cancel]  [Generate New Link]          │
└─────────────────────────────────────────┘
```

#### 7. **Email Integration**
- Checkbox to send email immediately upon generation
- Template-based email with:
  - Personalized greeting
  - Magic link button
  - Expiry information
  - Support contact
- Track email delivery status
- Resend failed emails

#### 8. **Analytics & Monitoring**
- Dashboard showing:
  - Total links generated
  - Active links count
  - Expired links count
  - Usage rate (clicked vs unused)
  - Average time to use link
- Per-user link history
- Audit log for all link operations

#### 9. **Borrower vs Login Email Distinction**
- Store both emails separately
- Borrower email: Name/reference only
- Login email: Used for authentication
- Support multiple login emails per borrower
- Display both in UI clearly:
  ```
  Borrower: John Doe (john.contractor@company.com)
  Login Email: john.personal@gmail.com
  ```

#### 10. **Bulk Operations**
- Generate links for multiple users
- Batch send emails
- Export link report (CSV/Excel)
- Bulk revoke expired links

#### 11. **Security Enhancements**
- Rate limiting per user/admin
- Suspicious activity detection
- IP address tracking
- Device fingerprinting
- Alert on multiple failed login attempts

---

## 🔧 Technical Implementation Notes

### GraphQL Queries Needed

```graphql
# Get all magic links for a user
query GetUserMagicLinks($userId: UUID!) {
  magic_links(where: { user_id: { eq: $userId } }, orderBy: { created_at: DESC }) {
    id
    borrower_email
    send_to_email
    expires_at
    created_at
    sent_at
    last_sent_at
    send_count
    used_at
    is_active
  }
}

# Get active magic links
query GetActiveMagicLinks($userId: UUID!) {
  magic_links(
    where: {
      user_id: { eq: $userId }
      is_active: { eq: true }
      expires_at: { gt: $now }
    }
  ) {
    # ... fields
  }
}
```

### Mutations Needed

```graphql
# Create magic link record
mutation CreateMagicLink($data: MagicLinkInsertInput!) {
  magic_link_insert(data: $data)
}

# Update send count
mutation UpdateMagicLinkSendCount($id: UUID!, $sendCount: Int!, $lastSentAt: Timestamp!) {
  magic_link_update(
    id: $id
    data: { send_count: $sendCount, last_sent_at: $lastSentAt }
  )
}

# Revoke magic link
mutation RevokeMagicLink($id: UUID!, $revokedBy: UUID!) {
  magic_link_update(
    id: $id
    data: { is_active: false, revoked_at: $now, revoked_by: $revokedBy }
  )
}

# Mark as used
mutation MarkMagicLinkUsed($sessionId: String!) {
  magic_link_update(
    where: { session_id: { eq: $sessionId } }
    data: { used_at: $now, is_active: false }
  )
}
```

### Cloud Function Updates

```typescript
// Add to generateAuthLink.ts
interface GenerateAuthLinkRequest {
  email: string;
  borrowerEmail?: string; // NEW: Separate borrower email
  sendToEmail: string;    // NEW: Explicit send-to email
  daysValid: number;      // NEW: Days instead of hours
  sendEmail?: boolean;    // NEW: Send immediately flag
  userId?: string;        // NEW: Existing user ID if known
}

// Store link in database after generation
await createMagicLink({
  userId: user.id,
  borrowerEmail: borrowerEmail || email,
  sendToEmail: sendToEmail,
  magicLinkUrl: emailLink,
  sessionId: sessionId,
  expiresAt: expiresAt,
  createdBy: requestingAdminId,
});

// Send email if requested
if (sendEmail) {
  await sendMagicLinkEmail({
    to: sendToEmail,
    borrowerName: borrowerName,
    link: emailLink,
    expiresAt: expiresAt,
  });
}
```

### Service Layer

```typescript
// src/services/magicLinkService.ts
export async function getUserMagicLinks(userId: string): Promise<MagicLink[]>
export async function generateMagicLink(params: GenerateLinkParams): Promise<MagicLink>
export async function resendMagicLink(linkId: string): Promise<void>
export async function revokeMagicLink(linkId: string, revokedBy: string): Promise<void>
export async function extendMagicLink(linkId: string, additionalDays: number): Promise<MagicLink>
export async function getMagicLinkStats(userId?: string): Promise<LinkStats>
```

---

## 📅 Implementation Timeline Estimate

### Phase 2.1: Database & Core Functionality (Week 1-2)
- [ ] Add `magic_links` table to schema
- [ ] Create GraphQL queries and mutations
- [ ] Update cloud function to store links
- [ ] Create service layer

### Phase 2.2: UI Enhancements (Week 3)
- [ ] Show existing links in modal
- [ ] Add resend functionality
- [ ] Add revoke functionality
- [ ] Implement expiry countdown

### Phase 2.3: Email Integration (Week 4)
- [ ] Email template design
- [ ] SendGrid/Firebase integration
- [ ] Send email checkbox
- [ ] Email delivery tracking

### Phase 2.4: Analytics & Polish (Week 5)
- [ ] Analytics dashboard
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Security enhancements

---

## 🎯 Success Metrics

- **User Adoption**: 80%+ of borrowers use magic links successfully
- **Time to Login**: Average < 2 minutes from link generation to first login
- **Link Usage Rate**: 70%+ of generated links are used
- **Email Delivery**: 95%+ successful email delivery rate
- **Admin Efficiency**: 50% reduction in support tickets for login issues

---

## 📚 Related Documentation

- [Firebase Email Link Auth](https://firebase.google.com/docs/auth/web/email-link-auth)
- [Firebase User Management](https://firebase.google.com/docs/auth/web/manage-users)
- [Firebase Password Auth](https://firebase.google.com/docs/auth/web/password-auth)
- [Current Implementation](/src/pages/admin/GenerateMagicLink.tsx)
- [Cloud Function](/functions/src/auth/generateAuthLink.ts)

---

**Last Updated:** 2025-01-18
**Status:** Phase 1 Complete, Phase 2 Planned
