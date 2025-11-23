# Resend Email Setup Guide

This project uses [Resend](https://resend.com) for sending transactional emails (magic links and welcome emails).

## Why Resend?

- Simple, modern API
- Excellent deliverability
- Great developer experience
- Built-in email analytics
- Generous free tier (3,000 emails/month)

## Setup Instructions

### 1. Create a Resend Account

1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Go to [API Keys](https://resend.com/settings/api-keys)
2. Click "Create API Key"
3. Name it (e.g., "MyBox Production")
4. Copy the API key (starts with `re_`)

**Important:** Save this key securely - you won't be able to see it again!

### 3. Verify Your Domain (For Production)

For production use, you need to verify your sending domain:

1. Go to [Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the provided DNS records to your domain:
   - **SPF Record:** Verifies your domain can send email
   - **DKIM Record:** Adds a digital signature to emails
   - **DMARC Record:** Prevents email spoofing

Example DNS records:
```
TXT  @  v=spf1 include:_spf.resend.com ~all
TXT  resend._domainkey  [provided by Resend]
TXT  _dmarc  v=DMARC1; p=none; pct=100; rua=mailto:dmarc@yourdomain.com
```

5. Wait for DNS propagation (usually 5-15 minutes)
6. Click "Verify Domain" in Resend dashboard

### 4. Configure Firebase Cloud Functions

#### Option A: Using Firebase Functions Config (Recommended for Production)

```bash
cd functions

# Set Resend configuration
firebase functions:config:set \
  resend.api_key="re_your_api_key_here" \
  resend.from_email="noreply@yourdomain.com" \
  resend.from_name="MyBox File Management" \
  company.name="MyBox"

# Deploy configuration
firebase deploy --only functions:config
```

#### Option B: Using .env File (For Local Development)

1. Copy the example file:
   ```bash
   cd functions
   cp .env.example .env
   ```

2. Edit `.env` and add your Resend credentials:
   ```bash
   RESEND_API_KEY=re_your_actual_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   RESEND_FROM_NAME=MyBox File Management
   COMPANY_NAME=MyBox
   ```

3. **Important:** Never commit the `.env` file to version control!

### 5. Testing (Development Mode)

For testing, you can use Resend's test mode:

1. In your Resend dashboard, use the test API key
2. Test emails will be sent to the Resend inbox (not real recipients)
3. View test emails at [https://resend.com/emails](https://resend.com/emails)

**Test Configuration:**
```bash
RESEND_API_KEY=re_test_your_test_key
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=MyBox Development
```

### 6. Deploy to Production

```bash
# Build functions
cd functions
npm run build

# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:generateAuthLink,functions:createUserWithMagicLink
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | Yes | Your Resend API key | `re_123abc...` |
| `RESEND_FROM_EMAIL` | Yes | Verified sender email | `noreply@yourdomain.com` |
| `RESEND_FROM_NAME` | No | Sender display name | `MyBox File Management` |
| `COMPANY_NAME` | No | Company name in emails | `MyBox` |

## Email Templates

The system sends two types of emails:

### 1. Magic Link Email
- **Trigger:** When generating access links for existing users
- **Contains:** Secure authentication link, loan information (optional)
- **Template:** HTML + Plain text with branded design
- **Expiration:** Configurable (default 48 hours)

### 2. Welcome Email
- **Trigger:** When creating new user accounts
- **Contains:** Welcome message, magic link (optional), feature overview
- **Template:** HTML + Plain text with branded design
- **Expiration:** Configurable (default 48 hours)

## Customizing Email Templates

Email templates are in `functions/src/services/emailService.ts`:

1. **HTML Templates:**
   - `generateMagicLinkEmailHTML()` - Magic link email
   - `generateWelcomeEmailHTML()` - Welcome email

2. **Plain Text Templates:**
   - `generateMagicLinkEmailText()` - Magic link plain text
   - `generateWelcomeEmailText()` - Welcome email plain text

To customize:
1. Edit the HTML/text template functions
2. Update styles, content, or structure
3. Test with Resend's test mode
4. Rebuild and deploy functions

## Monitoring & Analytics

### View Email Stats

1. Go to [Resend Dashboard](https://resend.com/emails)
2. View sent emails, opens, clicks, bounces
3. Check delivery status and errors

### Webhook Integration (Optional)

Set up webhooks to track email events:

```bash
# Configure webhook URL
firebase functions:config:set resend.webhook_url="https://your-cloud-function-url/webhook"
```

Supported events:
- `email.sent` - Email successfully sent
- `email.delivered` - Email delivered to recipient
- `email.opened` - Recipient opened the email
- `email.clicked` - Recipient clicked a link
- `email.bounced` - Email bounced
- `email.complained` - Recipient marked as spam

## Troubleshooting

### Emails Not Sending

1. **Check API Key:**
   ```bash
   firebase functions:config:get resend
   ```

2. **Check Function Logs:**
   ```bash
   firebase functions:log --only generateAuthLink
   ```

3. **Verify Domain:**
   - Ensure domain is verified in Resend dashboard
   - Check DNS records are correctly configured

### Email Going to Spam

1. **Verify Domain:** Make sure SPF, DKIM, and DMARC are configured
2. **Warm Up Domain:** Start with low volume, gradually increase
3. **Check Content:** Avoid spam trigger words
4. **Monitor Reputation:** Check delivery rates in Resend dashboard

### Rate Limits

Free tier limits:
- **3,000 emails/month**
- **100 emails/day**

If you exceed limits:
- Upgrade to paid plan
- Implement rate limiting in your code
- Queue emails for batch sending

## Migration from SendGrid

The codebase has been updated to use Resend instead of SendGrid. Key changes:

1. **Package:** `@sendgrid/mail` → `resend`
2. **API Key:** `SENDGRID_API_KEY` → `RESEND_API_KEY`
3. **From Email:** `SENDGRID_FROM_EMAIL` → `RESEND_FROM_EMAIL`
4. **From Name:** `SENDGRID_FROM_NAME` → `RESEND_FROM_NAME`

The email templates remain the same - no changes needed!

## Support & Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resend/resend-node)
- [Resend SMTP Settings](https://resend.com/settings/smtp)
- [Resend Status Page](https://status.resend.com)
- [Resend Discord Community](https://resend.com/discord)

## Cost Estimates

| Plan | Emails/Month | Price | Best For |
|------|--------------|-------|----------|
| Free | 3,000 | $0 | Development, testing |
| Pro | 50,000 | $20 | Small production apps |
| Business | 100,000+ | Custom | Large scale apps |

Visit [Resend Pricing](https://resend.com/pricing) for current rates.
