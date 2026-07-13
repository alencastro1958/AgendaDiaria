# Implementation Tasks

## Overview

This document outlines the implementation tasks for transforming AgendaDiaria into a multi-user system with authentication, persistent storage, and subscription management. Tasks are organized by phases for systematic implementation.

---

## Phase 1: Project Setup and Infrastructure

### 1.1 Backend Project Initialization
- [x] Initialize Node.js project with npm/yarn
- [x] Set up TypeScript configuration (optional but recommended)
- [x] Configure ESLint and Prettier for code quality
- [x] Create project structure (src/, tests/, config/, etc.)
- [x] Set up environment variable management (.env with dotenv)
- [x] Configure nodemon for development auto-reload
- [x] Create .gitignore for node_modules, .env, logs

### 1.2 Database Setup
- [x] Install PostgreSQL locally or use Docker container
- [-] Install pg and pg-pool packages
- [x] Create database and user with appropriate permissions
- [-] Implement database connection module with connection pooling
- [x] Create database migration system (node-pg-migrate or knex)
- [ ] Write initial migration for users table
- [~] Write migration for email_tokens table
- [~] Write migration for notes table
- [~] Write migration for links table
- [~] Write migration for media_files table
- [~] Write migration for subscriptions table
- [~] Write migration for payment_methods table
- [~] Write migration for payments table
- [~] Write migration for audit_logs table
- [~] Write migration for consent_records table
- [~] Create database indexes as specified in design
- [~] Test database connection and migrations

### 1.3 Express Server Setup
- [~] Install Express.js and related middleware
- [~] Create Express app configuration
- [~] Set up CORS with whitelist
- [~] Configure helmet for security headers
- [~] Configure body parsers (JSON, urlencoded)
- [~] Set up request logging middleware (morgan)
- [~] Implement error handling middleware
- [~] Create health check endpoint (GET /health)
- [~] Test basic server startup and health endpoint

---

## Phase 2: Authentication System

### 2.1 Password Hashing and Validation
- [~] Install bcrypt package
- [~] Implement password hashing function with cost factor 12
- [~] Implement password verification function
- [~] Implement password validation function (8+ chars, uppercase, lowercase, number)
- [~] Write unit tests for password validation
- [~] Write property-based tests for password validation (Property 1)

### 2.2 CPF Validation
- [~] Implement CPF formatting removal function
- [~] Implement CPF check digit calculation algorithm
- [~] Implement full CPF validation function
- [~] Implement CPF encryption function (AES-256-GCM)
- [~] Implement CPF decryption function
- [~] Write unit tests for CPF validation with known valid/invalid CPFs
- [~] Write property-based tests for CPF validator (Property 9)

### 2.3 JWT Token Management
- [~] Install jsonwebtoken package
- [~] Implement JWT token generation function (7-day expiration)
- [~] Implement JWT token verification function
- [~] Implement JWT middleware for protected routes
- [~] Implement token refresh logic (auto-refresh within 24h)
- [~] Write unit tests for JWT functions
- [~] Write property-based tests for JWT user_id extraction (Property 2)


### 2.4 User Registration Endpoint
- [~] Create user repository with database queries
- [~] Implement user service with registration logic
- [~] Create registration input validation middleware
- [~] Implement POST /api/auth/register endpoint
- [~] Validate full_name (minimum 2 words)
- [~] Validate and encrypt CPF
- [~] Validate email uniqueness
- [~] Validate username uniqueness (3-20 chars, alphanumeric + _ -)
- [~] Hash password before storing
- [~] Generate email verification token with 24h expiration
- [~] Store user with status "pending_verification"
- [~] Trigger verification email (integration in Phase 3)
- [~] Return 201 Created with user data (excluding password)
- [~] Handle duplicate email error (409 Conflict)
- [~] Handle duplicate username error (409 Conflict)
- [~] Handle duplicate CPF error (409 Conflict)
- [~] Write integration tests for registration endpoint

### 2.5 Email Verification System
- [~] Create email_tokens repository
- [~] Implement token generation function (crypto.randomBytes)
- [~] Implement token validation function
- [~] Create GET /api/auth/verify-email endpoint
- [~] Validate token exists and not expired
- [~] Update user status to "active"
- [~] Set trial_start_date and trial_end_date (now + 72 hours)
- [~] Set subscription status to "trial"
- [~] Mark token as used
- [~] Return success response or redirect to login
- [~] Create POST /api/auth/resend-verification endpoint
- [~] Implement rate limiting (max 3 per hour per user)
- [~] Write integration tests for email verification
- [~] Write property-based tests for trial period calculation (Property 10)

### 2.6 Login Endpoint
- [~] Implement login service
- [~] Create POST /api/auth/login endpoint
- [~] Accept email OR username as identifier
- [~] Determine if input is email (contains @) or username
- [~] Query user by email or username
- [~] Verify password using bcrypt comparison
- [~] Check user status is "active"
- [~] Generate JWT token
- [~] Log successful login to audit_logs
- [~] Return 200 OK with token and user data
- [~] Return generic error for invalid credentials (don't reveal which field)
- [~] Implement rate limiting (5 attempts per 15 minutes)
- [~] Log failed login attempts to audit_logs
- [~] Write integration tests for login endpoint
- [~] Test login with email
- [~] Test login with username
- [~] Test failed login attempts

### 2.7 Password Reset Flow
- [~] Create POST /api/auth/reset-password endpoint
- [~] Validate email exists
- [~] Generate password reset token with 1h expiration
- [~] Store token in email_tokens table
- [~] Trigger password reset email (integration in Phase 3)
- [~] Implement rate limiting (3 requests per hour per email)
- [~] Create POST /api/auth/confirm-reset-password endpoint
- [~] Validate reset token
- [~] Validate new password meets requirements
- [~] Hash and update password
- [~] Invalidate reset token
- [~] Return success response
- [~] Write integration tests for password reset flow

### 2.8 Session Management
- [~] Create GET /api/auth/me endpoint (requires JWT)
- [~] Return authenticated user data
- [~] Create POST /api/auth/logout endpoint
- [~] Implement client-side token clearing (frontend task)
- [~] Write integration tests for session endpoints

---

## Phase 3: Email Service Integration

### 3.1 Email Service Setup
- [~] Install nodemailer package
- [~] Configure SMTP connection (SendGrid, Mailgun, or custom SMTP)
- [~] Create email service module
- [~] Create email templates directory
- [~] Design HTML email template base layout

### 3.2 Email Templates
- [~] Create verification email template
- [~] Create password reset email template
- [~] Create trial expiring notification template (24h before expiration)
- [~] Create subscription confirmation email template
- [~] Create payment success email template
- [~] Create payment failed email template
- [~] Create account deletion confirmation template

### 3.3 Email Service Implementation
- [ ] Implement sendVerificationEmail function
- [~] Implement sendPasswordResetEmail function
- [~] Implement sendTrialExpiringEmail function
- [~] Implement sendSubscriptionConfirmationEmail function
- [~] Implement sendPaymentSuccessEmail function
- [~] Implement sendPaymentFailedEmail function
- [~] Implement sendAccountDeletionEmail function
- [~] Integrate email service with auth endpoints
- [~] Test all email sends in development (use Mailtrap or similar)
- [~] Write unit tests for email service

---

## Phase 4: Notes API Implementation

### 4.1 Note Repository and Service
- [~] Create notes repository with CRUD operations
- [~] Create links repository
- [~] Create media_files repository
- [~] Implement note service with business logic
- [~] Implement data isolation enforcement in all queries
- [~] Write unit tests for note service
- [~] Write property-based tests for data isolation (Property 3)

### 4.2 Note CRUD Endpoints
- [~] Create note input validation middleware
- [~] Implement POST /api/notes endpoint (create note)
- [~] Validate note fields (title, content, tags, links, date)
- [~] Attach user_id from JWT token
- [~] Return 201 Created with note data
- [~] Implement GET /api/notes endpoint (list all user notes)
- [~] Support pagination (page, limit query params)
- [~] Support date filtering (date_from, date_to)
- [~] Implement GET /api/notes/:id endpoint (get single note)
- [~] Verify user owns the note (authorization check)
- [~] Include links and media in response
- [~] Implement PUT /api/notes/:id endpoint (update note)
- [~] Verify user owns the note
- [~] Update timestamps
- [~] Implement DELETE /api/notes/:id endpoint (delete note)
- [ ] Verify user owns the note
- [~] Cascade delete links and media files
- [~] Write integration tests for all note CRUD operations
- [~] Write property-based tests for note validation (Property 4)

### 4.3 Note Search Endpoint
- [~] Implement GET /api/notes/search endpoint
- [~] Support query parameter for full-text search
- [~] Support tags filtering (comma-separated list)
- [~] Support date range filtering
- [~] Implement pagination
- [~] Support sorting (by relevance or date)
- [~] Return total count with results
- [~] Use PostgreSQL full-text search (to_tsvector)
- [~] Ensure data isolation in search results
- [ ] Write integration tests for search
- [~] Write property-based tests for date range filtering (Property 7)

### 4.4 Note by Date Endpoint
- [~] Implement GET /api/notes/by-date/:date endpoint
- [~] Return all notes for specific date for authenticated user
- [~] Include links and media
- [~] Write integration tests

---

## Phase 5: File Upload System

### 5.1 File Upload Infrastructure
- [~] Install multer package for file uploads
- [~] Configure multer for memory storage (buffer)
- [~] Implement file type validation middleware
- [~] Implement file size validation middleware
- [~] Create file storage service (abstraction for local/S3)
- [~] Implement local file storage for development
- [~] Create uploads directory structure
- [~] Write property-based tests for file type validation (Property 5)

### 5.2 Storage Quota Management
- [~] Implement getUserStorageUsage function
- [~] Implement checkStorageQuota function (100MB limit)
- [~] Create GET /api/users/me/storage endpoint
- [~] Return current usage and remaining quota
- [~] Write unit tests for storage calculations
- [~] Write property-based tests for quota enforcement (Property 6)

### 5.3 File Upload Endpoints
- [~] Implement POST /api/notes/:id/files endpoint
- [~] Accept multipart/form-data with file field
- [~] Validate file type (jpg, png, gif, webp, pdf, docx, txt, zip)
- [~] Validate file size (max 10MB per file)
- [~] Check user storage quota
- [ ] Verify user owns the note
- [~] Generate unique filename
- [~] Save file to storage
- [~] Store metadata in media_files table
- [~] Return 201 Created with file metadata
- [~] Return 413 Payload Too Large if quota exceeded
- [~] Write integration tests for file upload

### 5.4 Audio Upload Endpoint
- [~] Implement POST /api/notes/:id/audio endpoint
- [~] Validate audio type (webm, mp3, wav, m4a)
- [~] Validate audio size (max 5MB)
- [~] Check storage quota
- [~] Save to storage with file_type='audio'
- [ ] Write integration tests

### 5.5 Video Upload Endpoint
- [~] Implement POST /api/notes/:id/video endpoint
- [~] Validate video type (webm, mp4)
- [~] Validate video size (max 50MB)
- [ ] Check storage quota
- [~] Save to storage with file_type='video'
- [ ] Write integration tests

### 5.6 File Access Endpoints
- [~] Implement GET /api/files/:id endpoint
- [~] Verify user owns the file (via note ownership)
- [~] Generate signed URL for file access (if using S3)
- [~] Return file URL or redirect to file
- [~] Implement DELETE /api/files/:id endpoint
- [~] Verify user owns the file
- [~] Delete file from storage
- [~] Delete metadata from database
- [~] Update user storage usage
- [ ] Write integration tests

### 5.7 S3 Integration (Production)
- [~] Install aws-sdk package
- [~] Implement S3 upload function
- [~] Implement S3 signed URL generation
- [~] Implement S3 delete function
- [~] Add S3 configuration to environment variables
- [~] Test S3 operations with test bucket
- [~] Configure storage service to use S3 in production

---

## Phase 6: Subscription and Payment System

### 6.1 Trial Period Management
- [~] Implement checkTrialStatus function
- [~] Create subscription service
- [~] Implement middleware to check subscription status on protected routes
- [~] Block access when trial expired and no active subscription
- [~] Allow data export even when expired
- [~] Create cron job to check trial expirations daily
- [~] Send trial expiring emails (24h before)
- [~] Update subscription status to "expired" when trial ends
- [~] Write unit tests for trial status logic
- [~] Write property-based tests for trial status transitions (Property 11)

### 6.2 Payment Gateway Integration
- [~] Choose primary payment gateway (Stripe recommended)
- [~] Install stripe package (or pagseguro-nodejs-sdk / mercadopago)
- [~] Configure gateway API keys
- [~] Create payment service module
- [~] Implement payment method tokenization
- [~] Test payment operations in sandbox/test mode


### 6.3 Payment Method Endpoints
- [~] Create payment_methods repository
- [~] Implement POST /api/subscription/payment-method endpoint
- [~] Accept payment token from gateway
- [~] Store payment method securely (only gateway token, not full card)
- [~] Extract last4, expiry month/year for display
- [~] Mark as default payment method
- [~] Return 201 Created with payment method data
- [~] Implement GET /api/subscription/payment-methods endpoint
- [~] Return all payment methods for user
- [~] Implement DELETE /api/subscription/payment-method/:id endpoint
- [~] Verify user owns payment method
- [~] Delete from database
- [~] Write integration tests with test card tokens

### 6.4 Subscription Endpoints
- [~] Create subscriptions repository
- [~] Define subscription plans (monthly: R$29.90, annual: R$299.00)
- [~] Implement POST /api/subscription/subscribe endpoint
- [~] Accept plan_id (monthly or annual)
- [~] Verify user has payment method
- [~] Process initial payment through gateway
- [~] Create subscription record with status "active"
- [~] Calculate end_date and renewal_date based on plan
- [~] Send subscription confirmation email
- [~] Return 201 Created with subscription data
- [~] Handle payment failure with appropriate error
- [~] Implement GET /api/subscription endpoint
- [~] Return current subscription for user
- [~] Include payment method information
- [~] Implement POST /api/subscription/cancel endpoint
- [~] Update subscription status to "cancelled"
- [~] Set cancellation_date
- [~] Calculate access_until_date (end of current billing period)
- [~] Send cancellation confirmation email
- [~] Write integration tests for subscription flow

### 6.5 Payment History Endpoint
- [~] Create payments repository
- [~] Implement GET /api/subscription/history endpoint
- [~] Return all payments for user
- [~] Include subscription information
- [~] Support pagination
- [~] Order by created_at DESC
- [ ] Write integration tests

### 6.6 Automatic Renewal System
- [~] Implement processRenewal function
- [~] Calculate renewal amount based on plan
- [~] Attempt payment through gateway
- [~] Handle successful payment: extend subscription, update renewal_date
- [~] Create payment record
- [~] Send payment success email
- [~] Handle failed payment: schedule retry
- [~] Implement exponential backoff retry (0h, 24h, 72h)
- [~] After 3 failed retries, expire subscription
- [~] Send payment failed email
- [~] Create cron job to check renewals daily
- [~] Write unit tests for renewal logic
- [~] Write property-based tests for renewal date calculation (Property 12)

### 6.7 Webhook Handling (Payment Gateway)
- [~] Create POST /api/webhooks/stripe (or equivalent for chosen gateway)
- [~] Verify webhook signature
- [~] Handle payment success event
- [~] Handle payment failure event
- [~] Handle subscription cancellation event
- [~] Update database accordingly
- [~] Write integration tests with mock webhook payloads

---

## Phase 7: Data Export and LGPD Compliance

### 7.1 Data Export Functionality
- [~] Implement data export service
- [~] Create GET /api/export endpoint (requires authentication)
- [~] Gather all user data: profile, notes, links, media metadata
- [~] Generate signed URLs for all media files
- [~] Format as JSON with clear structure
- [~] Include consent records and audit log
- [~] Set appropriate response headers for download
- [~] Log export event to audit_logs
- [~] Write integration tests for export
- [~] Write property-based tests for export-import round-trip (Property 8)

### 7.2 Account Deletion
- [~] Implement account deletion service
- [~] Create DELETE /api/users/me endpoint
- [~] Require password confirmation in request body
- [~] Verify password is correct
- [~] Generate account deletion confirmation token (7-day window)
- [~] Send confirmation email with cancellation link
- [~] Mark account for deletion (don't delete immediately)
- [~] Create GET /api/auth/cancel-deletion endpoint
- [~] Validate cancellation token
- [~] Restore account if within 7-day window
- [~] Create cron job to process pending deletions after 7 days
- [~] Delete all user data: notes, links, media files, subscriptions, payments
- [~] Delete files from storage
- [~] Log deletion event to audit_logs (keep audit log even after user deletion)
- [~] Write integration tests for deletion flow

### 7.3 Consent Management
- [~] Create consent_records repository
- [~] Implement consent recording on registration
- [~] Store snapshot of privacy policy at time of consent
- [~] Store IP address and user agent
- [~] Create GET /api/users/me/consents endpoint
- [~] Return all consent records for user
- [ ] Write integration tests

### 7.4 Audit Logging
- [~] Implement audit logging middleware
- [~] Log user login events
- [~] Log failed login attempts
- [~] Log data export events
- [~] Log account deletion events
- [~] Log consent events
- [ ] Store IP address and user agent
- [~] Create GET /api/users/me/audit-log endpoint (admin or user can view own)
- [ ] Support date range filtering
- [ ] Support pagination
- [ ] Write integration tests

### 7.5 Privacy Policy and Terms
- [~] Draft privacy policy content (legal review recommended)
- [~] Draft terms of service content
- [~] Create static pages for privacy policy and terms
- [~] Add consent checkboxes to registration form
- [~] Link to privacy policy and terms in UI
- [~] Version privacy policy and terms (store version with consent)

---

## Phase 8: Frontend Modifications

### 8.1 Authentication UI
- [~] Create login page HTML/CSS
- [~] Implement login form submission
- [~] Display error messages from API
- [~] Store JWT token in httpOnly cookie (set by backend) or localStorage
- [~] Create registration page HTML/CSS
- [~] Add full_name, CPF, email, username, password fields
- [~] Implement client-side validation for all fields
- [~] Implement CPF input formatting (XXX.XXX.XXX-XX)
- [~] Display registration success message
- [~] Create email verification confirmation page
- [~] Display verification success/failure
- [~] Create password reset request page
- [~] Create password reset confirmation page
- [~] Implement logout functionality (clear token, redirect to login)

### 8.2 User Profile UI
- [~] Create user profile page
- [~] Display user information (name, email, username)
- [~] Display subscription status and trial countdown
- [~] Display storage usage with visual indicator
- [~] Create "Edit Profile" functionality
- [~] Create "Change Password" functionality
- [~] Add "Export Data" button
- [~] Add "Delete Account" button with confirmation modal

### 8.3 API Client Integration
- [~] Create API client module
- [~] Implement request interceptor to add JWT token to headers
- [~] Implement response interceptor to handle 401 (redirect to login)
- [~] Implement response interceptor to handle 403 (show subscription expired message)
- [~] Replace IndexedDB calls with API calls in existing code
- [~] Update note creation to POST /api/notes
- [~] Update note fetching to GET /api/notes
- [~] Update note updating to PUT /api/notes/:id
- [~] Update note deletion to DELETE /api/notes/:id
- [~] Update search to use GET /api/notes/search

### 8.4 File Upload UI Integration
- [~] Update file upload handler to POST /api/notes/:id/files
- [~] Display upload progress
- [~] Handle upload errors (size limit, quota exceeded)
- [~] Update audio recording to POST /api/notes/:id/audio
- [~] Update video recording to POST /api/notes/:id/video (if implemented)
- [~] Display storage quota in UI
- [~] Warn user when approaching storage limit

### 8.5 Offline Support and Sync
- [~] Implement online/offline detection
- [~] Display offline indicator in UI
- [~] Store pending changes in IndexedDB when offline
- [~] Implement sync service
- [~] Sync pending changes when connection restored
- [~] Display sync status (syncing, synced, failed)
- [~] Implement conflict resolution (last-write-wins)
- [~] Implement exponential backoff retry for failed syncs
- [~] Test offline functionality thoroughly

### 8.6 Data Migration Tool
- [~] Create migration UI prompt (shown on first login)
- [~] Implement migration service
- [~] Read all notes from IndexedDB
- [~] Batch notes in groups of 50
- [~] Send batches to POST /api/notes/batch (create this endpoint)
- [~] Display migration progress bar
- [~] Handle migration errors gracefully
- [~] Clear IndexedDB on successful migration
- [~] Allow user to skip migration
- [~] Test migration with various data sizes

### 8.7 Subscription UI
- [~] Create subscription management page
- [~] Display current plan and renewal date
- [~] Display trial countdown if in trial period
- [~] Create payment method registration form
- [~] Integrate with Stripe Elements (or equivalent for chosen gateway)
- [~] Display plan selection (monthly vs annual)
- [~] Implement subscribe button
- [~] Display payment history table
- [~] Implement cancel subscription button with confirmation
- [~] Display subscription expired message when appropriate
- [~] Show "Upgrade" prompt when trial is expiring

---

## Phase 9: Testing

### 9.1 Unit Tests
- [~] Set up Jest or Mocha test framework
- [~] Configure test database
- [ ] Write unit tests for password validation
- [~] Write unit tests for CPF validation
- [ ] Write unit tests for JWT functions
- [~] Write unit tests for storage quota calculations
- [~] Write unit tests for trial period logic
- [~] Write unit tests for renewal date calculations
- [ ] Write unit tests for email service
- [~] Achieve 80%+ code coverage for services

### 9.2 Property-Based Tests
- [~] Set up fast-check library
- [~] Write Property 1: Password validation (100 iterations)
- [~] Write Property 2: Password verification (100 iterations)
- [~] Write Property 3: Data isolation (100 iterations)
- [~] Write Property 4: Note field validation (100 iterations)
- [~] Write Property 5: File type validation (100 iterations)
- [~] Write Property 6: Storage quota enforcement (100 iterations)
- [~] Write Property 7: Date range search filtering (100 iterations)
- [~] Write Property 8: Export-import round-trip (100 iterations)
- [~] Write Property 9: CPF validation (100 iterations)
- [~] Write Property 10: Trial period calculation (100 iterations)
- [~] Write Property 11: Trial status transition (100 iterations)
- [~] Write Property 12: Subscription renewal date calculation (100 iterations)
- [~] Tag all tests with format: "Feature: multi-user-authentication, Property X: ..."

### 9.3 Integration Tests
- [ ] Write integration tests for registration endpoint
- [ ] Write integration tests for login endpoint
- [ ] Write integration tests for email verification
- [~] Write integration tests for password reset
- [~] Write integration tests for note CRUD operations
- [~] Write integration tests for search endpoint
- [ ] Write integration tests for file upload
- [ ] Write integration tests for subscription flow
- [~] Write integration tests for payment processing (with test gateway)
- [~] Write integration tests for data export
- [~] Write integration tests for account deletion
- [~] Run all integration tests against test database

### 9.4 End-to-End Tests
- [~] Set up Playwright or Cypress
- [~] Write E2E test for complete registration flow
- [~] Write E2E test for login and note creation
- [~] Write E2E test for file upload
- [~] Write E2E test for password reset
- [~] Write E2E test for data export
- [~] Write E2E test for subscription flow
- [~] Run E2E tests against staging environment

### 9.5 Security Tests
- [~] Test SQL injection attempts on all endpoints
- [~] Test XSS attempts in note content
- [~] Test JWT token tampering
- [~] Test rate limiting on login endpoint
- [~] Test rate limiting on API endpoints
- [~] Test file upload malicious payloads
- [~] Run npm audit and fix vulnerabilities
- [~] Consider OWASP ZAP scan

### 9.6 Performance Tests
- [~] Set up Artillery or k6
- [~] Write load test for GET /api/notes (measure response time)
- [~] Write load test for POST /api/notes
- [~] Write load test for search endpoint
- [~] Test with 50 concurrent users
- [~] Test with 100 concurrent users
- [~] Verify p95 response times meet targets
- [~] Use EXPLAIN ANALYZE to optimize slow queries

---

## Phase 10: Deployment and Monitoring

### 10.1 Production Environment Setup
- [~] Choose hosting provider (AWS, DigitalOcean, Azure, etc.)
- [~] Provision PostgreSQL database instance
- [~] Configure database backups (daily, 30-day retention)
- [~] Provision Redis instance for caching (optional but recommended)
- [~] Set up S3 bucket or equivalent for file storage
- [~] Configure CDN for static assets and media files
- [~] Set up load balancer (if multiple servers)
- [~] Configure SSL certificate (Let's Encrypt)
- [~] Set up domain and DNS records

### 10.2 Application Deployment
- [~] Create production build script
- [~] Set up environment variables on production server
- [~] Deploy backend application
- [~] Run database migrations on production database
- [~] Test health endpoint
- [~] Deploy frontend application
- [~] Configure reverse proxy (nginx) for SSL termination
- [~] Test full application flow on production

### 10.3 Monitoring Setup
- [~] Set up error tracking (Sentry, Rollbar)
- [~] Configure error alerts (email or Slack)
- [~] Set up application monitoring (New Relic, Datadog)
- [~] Configure performance alerts
- [~] Set up uptime monitoring (Pingdom, UptimeRobot)
- [~] Create monitoring dashboard
- [~] Set up log aggregation (if using multiple servers)

### 10.4 Logging Configuration
- [~] Configure Winston for production logging
- [~] Set up log rotation
- [~] Configure structured JSON logging
- [~] Ensure sensitive data is not logged (passwords, tokens, CPF)
- [~] Set up log retention policy (30 days for application logs, 1 year for audit logs)

### 10.5 Backup and Recovery
- [~] Verify automated database backups
- [~] Test database restore procedure
- [~] Configure S3 versioning and cross-region replication
- [~] Document disaster recovery procedures
- [~] Test recovery process

### 10.6 CI/CD Pipeline
- [~] Set up GitHub Actions or GitLab CI
- [~] Configure automated testing on pull requests
- [~] Configure automated deployment to staging on merge to develop
- [~] Configure automated deployment to production on merge to main
- [~] Implement deployment rollback procedure
- [~] Document deployment process

---

## Phase 11: User Migration and Launch

### 11.1 Beta Testing
- [~] Recruit beta testers from existing users
- [~] Provide migration guide and support
- [~] Monitor error rates and user feedback
- [~] Fix critical bugs
- [~] Iterate based on feedback

### 11.2 Documentation
- [~] Write user guide for new system
- [~] Document migration process from old system
- [~] Create FAQ for common issues
- [~] Document API endpoints for potential integrations
- [~] Create video tutorials (optional)

### 11.3 Production Launch
- [~] Announce new multi-user system to all users
- [~] Send migration instructions via email
- [~] Provide support during migration period
- [~] Monitor system performance and errors closely
- [~] Run old and new systems in parallel for transition period (if possible)
- [~] Deprecate old system after successful migration
- [~] Celebrate launch! 🎉

---

## Summary

**Total Phases:** 11  
**Estimated Duration:** 3-6 months (depending on team size and hours per week)

**Critical Path:**
1. Phases 1-2: Foundation (database, authentication)
2. Phases 3-4: Core functionality (email, notes API)
3. Phase 5: File uploads
4. Phase 6: Subscription system
5. Phase 7: LGPD compliance
6. Phase 8: Frontend integration
7. Phases 9-10: Testing and deployment
8. Phase 11: User migration and launch

**Key Milestones:**
- ✅ Backend authentication working
- ✅ Notes API with data isolation working
- ✅ File uploads working
- ✅ Subscription and payment working
- ✅ All property-based tests passing
- ✅ Frontend integrated with backend
- ✅ Deployed to production
- ✅ Users migrated successfully
