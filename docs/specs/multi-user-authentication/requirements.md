# Requirements Document

## Introduction

Este documento especifica os requisitos para transformar o AgendaDiaria de uma aplicação single-user com armazenamento local (IndexedDB) em um sistema multi-usuário com autenticação, backend API REST, e armazenamento persistente em banco de dados. O sistema permitirá que múltiplos usuários criem contas, façam login de forma segura, mantenham dados independentes e sincronizem informações entre dispositivos, mantendo conformidade com LGPD.

O sistema inclui funcionalidades avançadas de mídia (gravação de vídeos além de áudio), autenticação flexível (login via username ou email), cadastro completo com validação de CPF, período de degustação gratuito de 3 dias, e sistema de assinaturas com integração a gateway de pagamento para sustentabilidade do serviço.

## Glossary

- **User**: Pessoa física que cria uma conta no sistema
- **Authentication_Service**: Componente responsável por validar credenciais e gerenciar sessões
- **Authorization_Service**: Componente responsável por verificar permissões de acesso aos recursos
- **Note**: Entidade que representa uma anotação diária com título, conteúdo, tags, links, arquivos e áudios
- **API_Server**: Servidor backend que expõe endpoints REST para operações do sistema
- **Database**: Banco de dados persistente (PostgreSQL ou MongoDB) que armazena dados dos usuários
- **JWT_Token**: JSON Web Token usado para autenticação stateless
- **Session**: Período de autenticação válido de um usuário no sistema
- **Password_Hash**: Versão criptografada da senha do usuário usando bcrypt ou Argon2
- **Frontend_Client**: Aplicação web single-page que roda no navegador
- **Data_Isolation**: Garantia de que usuários só acessam seus próprios dados
- **Migration_Service**: Componente responsável por migrar dados de IndexedDB para o backend
- **Email_Service**: Componente responsável por enviar emails de verificação e recuperação de senha
- **Account**: Registro de usuário contendo email, senha hash, metadata e preferências
- **Username**: Identificador alfanumérico único escolhido pelo usuário para login e identificação
- **Full_Name**: Nome completo do usuário fornecido durante cadastro
- **CPF**: Cadastro de Pessoa Física - documento brasileiro de identificação fiscal com 11 dígitos
- **CPF_Validator**: Componente que verifica a validade matemática de um CPF usando algoritmo de dígitos verificadores
- **Video**: Arquivo de vídeo gravado pelo usuário e anexado a uma nota
- **Storage_Quota**: Limite máximo de armazenamento em bytes permitido para arquivos e mídias de um usuário
- **Trial_Period**: Período de degustação gratuita de 3 dias após confirmação de email
- **Subscription**: Assinatura ativa de um usuário que permite acesso contínuo ao sistema após trial period
- **Payment_Gateway**: Serviço externo de processamento de pagamentos (Stripe, PagSeguro, ou Mercado Pago)
- **Payment_Method**: Meio de pagamento cadastrado pelo usuário (cartão de crédito)
- **Subscription_Plan**: Plano de assinatura com periodicidade definida (mensal ou anual)
- **Subscription_Status**: Estado atual da assinatura (active, cancelled, expired, trial)
- **Payment_History**: Registro histórico de todas as transações de pagamento de um usuário

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to create an account with email and password, so that I can access the system and store my personal notes.

#### Acceptance Criteria

1. THE Frontend_Client SHALL provide a registration form with email and password fields
2. THE Frontend_Client SHALL validate that email format is valid before submission
3. THE Frontend_Client SHALL validate that password meets minimum security requirements (8+ characters, 1 uppercase, 1 lowercase, 1 number)
4. WHEN a user submits valid registration data, THE API_Server SHALL create a new Account with hashed password
5. THE API_Server SHALL reject registration if email already exists in the Database
6. WHEN registration succeeds, THE Email_Service SHALL send a verification email to the user's email address
7. THE API_Server SHALL store the Account with status "pending_verification" until email is verified
8. THE Frontend_Client SHALL display success message and redirect to login page after registration

### Requirement 2: Email Verification

**User Story:** As a registered user, I want to verify my email address, so that I can confirm my identity and activate my account.

#### Acceptance Criteria

1. WHEN a user registers, THE Email_Service SHALL generate a unique verification token with 24-hour expiration
2. THE Email_Service SHALL send an email containing a verification link with the token
3. WHEN a user clicks the verification link, THE API_Server SHALL validate the token
4. IF the token is valid and not expired, THE API_Server SHALL update Account status to "active"
5. IF the token is invalid or expired, THE API_Server SHALL return error message
6. THE Frontend_Client SHALL provide a "resend verification email" option
7. THE API_Server SHALL limit verification email resends to maximum 3 per hour per user

### Requirement 3: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I can access my personal notes.

#### Acceptance Criteria

1. THE Frontend_Client SHALL provide a login form with email and password fields
2. WHEN a user submits login credentials, THE Authentication_Service SHALL verify the email exists
3. THE Authentication_Service SHALL compare the provided password with the Password_Hash using secure comparison
4. IF credentials are valid and Account is active, THE Authentication_Service SHALL generate a JWT_Token with 7-day expiration
5. THE JWT_Token SHALL contain user ID, email, and issued timestamp
6. IF credentials are invalid, THE Authentication_Service SHALL return error without revealing if email or password is wrong
7. THE Authentication_Service SHALL implement rate limiting of 5 failed attempts per 15 minutes per IP address
8. THE Frontend_Client SHALL store the JWT_Token in memory and httpOnly secure cookie
9. WHEN login succeeds, THE Frontend_Client SHALL redirect to the main calendar view

### Requirement 4: Session Management

**User Story:** As a logged-in user, I want my session to remain valid across page refreshes, so that I don't have to login repeatedly.

#### Acceptance Criteria

1. THE Frontend_Client SHALL include JWT_Token in Authorization header for all API requests
2. THE API_Server SHALL validate JWT_Token signature and expiration on every protected endpoint
3. IF JWT_Token is expired, THE API_Server SHALL return 401 Unauthorized status
4. THE Frontend_Client SHALL detect 401 responses and redirect to login page
5. THE Frontend_Client SHALL provide a "logout" button that clears the JWT_Token
6. WHEN a user clicks logout, THE Frontend_Client SHALL clear the JWT_Token and redirect to login page
7. THE Frontend_Client SHALL implement automatic token refresh when token is within 24 hours of expiration

### Requirement 5: Password Reset

**User Story:** As a user who forgot my password, I want to reset it via email, so that I can regain access to my account.

#### Acceptance Criteria

1. THE Frontend_Client SHALL provide a "forgot password" link on the login page
2. WHEN a user requests password reset, THE Frontend_Client SHALL prompt for email address
3. THE API_Server SHALL generate a unique password reset token with 1-hour expiration
4. THE Email_Service SHALL send an email containing a password reset link with the token
5. WHEN a user clicks the reset link, THE Frontend_Client SHALL display a form to enter new password
6. THE Frontend_Client SHALL validate that new password meets security requirements
7. WHEN user submits new password, THE API_Server SHALL validate the token
8. IF token is valid, THE API_Server SHALL update Password_Hash and invalidate the token
9. THE API_Server SHALL limit password reset requests to maximum 3 per hour per email

### Requirement 6: Data Isolation and Authorization

**User Story:** As a user, I want my notes to be private and inaccessible to other users, so that my personal information remains confidential.

#### Acceptance Criteria

1. THE Database SHALL store user_id with every Note record
2. WHEN a user requests notes, THE Authorization_Service SHALL extract user_id from JWT_Token
3. THE API_Server SHALL filter all Note queries by authenticated user_id
4. THE API_Server SHALL reject any request attempting to access notes with different user_id
5. THE API_Server SHALL return 403 Forbidden for unauthorized access attempts
6. THE Database SHALL enforce foreign key constraints between Notes and Users
7. WHEN a user account is deleted, THE Database SHALL cascade delete all associated Notes

### Requirement 7: Note CRUD Operations via API

**User Story:** As a logged-in user, I want to create, read, update and delete my notes through the API, so that my data is stored persistently on the server.

#### Acceptance Criteria

1. THE API_Server SHALL provide POST /api/notes endpoint to create new notes
2. THE API_Server SHALL provide GET /api/notes endpoint to retrieve all notes for authenticated user
3. THE API_Server SHALL provide GET /api/notes/:id endpoint to retrieve a specific note
4. THE API_Server SHALL provide PUT /api/notes/:id endpoint to update an existing note
5. THE API_Server SHALL provide DELETE /api/notes/:id endpoint to delete a note
6. THE API_Server SHALL validate that all note fields conform to expected types and constraints
7. THE API_Server SHALL return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)
8. THE API_Server SHALL include timestamps (createdAt, updatedAt) in all note responses

### Requirement 8: Data Migration from IndexedDB

**User Story:** As an existing user with local data, I want to migrate my IndexedDB notes to the server, so that I don't lose my existing notes.

#### Acceptance Criteria

1. WHEN a user first logs in, THE Frontend_Client SHALL check if IndexedDB contains existing notes
2. IF local notes exist, THE Frontend_Client SHALL display a migration prompt to the user
3. WHEN user accepts migration, THE Migration_Service SHALL read all notes from IndexedDB
4. THE Migration_Service SHALL send notes to API_Server in batches of 50
5. THE API_Server SHALL validate and store each migrated note with the user's user_id
6. THE Frontend_Client SHALL display migration progress (e.g., "Migrating 45/120 notes...")
7. WHEN migration completes successfully, THE Frontend_Client SHALL clear IndexedDB data
8. IF migration fails, THE Frontend_Client SHALL preserve IndexedDB data and display error
9. THE Frontend_Client SHALL provide option to skip migration and keep data local only

### Requirement 9: File Upload and Storage

**User Story:** As a user, I want to upload files attached to my notes, so that I can store documents and images with my notes on the server.

#### Acceptance Criteria

1. THE API_Server SHALL provide POST /api/notes/:id/files endpoint for file uploads
2. THE API_Server SHALL accept files up to 10MB per file
3. THE API_Server SHALL validate file types against allowed list (images: jpg, png, gif, webp; documents: pdf, docx, txt; archives: zip)
4. THE API_Server SHALL store files in object storage or filesystem with unique filenames
5. THE API_Server SHALL store file metadata (filename, size, mimetype, url) in Database
6. THE API_Server SHALL enforce maximum 100MB total Storage_Quota per user
7. WHEN Storage_Quota is exceeded, THE API_Server SHALL return 413 Payload Too Large error
8. THE API_Server SHALL provide GET /api/files/:id endpoint with signed URL for file download
9. THE Authorization_Service SHALL verify user owns the note before allowing file access

### Requirement 10: Audio Recording Storage

**User Story:** As a user, I want to upload audio recordings attached to my notes, so that I can store voice memos with my notes on the server.

#### Acceptance Criteria

1. THE API_Server SHALL provide POST /api/notes/:id/audio endpoint for audio uploads
2. THE API_Server SHALL accept audio files in webm, mp3, wav, and m4a formats
3. THE API_Server SHALL enforce maximum 5MB per audio file
4. THE API_Server SHALL store audio files with the same mechanisms as file uploads
5. THE Frontend_Client SHALL record audio in browser and convert to webm format
6. THE Frontend_Client SHALL display audio duration before upload
7. THE API_Server SHALL validate audio file is valid format before storage
8. THE API_Server SHALL include audio files in user Storage_Quota calculation

### Requirement 11: Search and Filtering via API

**User Story:** As a user, I want to search my notes by date, text, and tags through the API, so that I can quickly find specific notes.

#### Acceptance Criteria

1. THE API_Server SHALL provide GET /api/notes/search endpoint with query parameters
2. THE API_Server SHALL support search by date range (date_from, date_to)
3. THE API_Server SHALL support full-text search in title and content (query parameter)
4. THE API_Server SHALL support filtering by tags (tags parameter accepting comma-separated list)
5. THE API_Server SHALL return results sorted by relevance or date (configurable via sort parameter)
6. THE API_Server SHALL implement pagination with page and limit parameters
7. THE API_Server SHALL return total count of results with paginated data
8. THE Authorization_Service SHALL ensure search only returns notes owned by authenticated user

### Requirement 12: Data Export

**User Story:** As a user, I want to export all my data in JSON format, so that I have a backup and can comply with LGPD data portability rights.

#### Acceptance Criteria

1. THE API_Server SHALL provide GET /api/export endpoint requiring authentication
2. WHEN a user requests export, THE API_Server SHALL retrieve all Notes, files metadata, and Account info for the user
3. THE API_Server SHALL generate a JSON file containing complete user data
4. THE API_Server SHALL include download URLs for all uploaded files and audio recordings
5. THE Frontend_Client SHALL trigger browser download of the JSON file
6. THE API_Server SHALL log all export requests with timestamp for audit purposes
7. THE export format SHALL be compatible with the import functionality

### Requirement 13: Account Deletion

**User Story:** As a user, I want to permanently delete my account and all associated data, so that I can exercise my LGPD right to erasure.

#### Acceptance Criteria

1. THE Frontend_Client SHALL provide an "Delete Account" option in account settings
2. WHEN user requests deletion, THE Frontend_Client SHALL display confirmation dialog with warning
3. THE Frontend_Client SHALL require user to enter password to confirm deletion
4. WHEN confirmed, THE API_Server SHALL verify password and mark Account for deletion
5. THE API_Server SHALL send confirmation email to user with 7-day cancellation window
6. IF user clicks cancellation link within 7 days, THE API_Server SHALL restore the Account
7. WHEN 7 days pass, THE API_Server SHALL permanently delete Account, all Notes, and all uploaded files
8. THE API_Server SHALL log deletion events for audit compliance

### Requirement 14: API Security

**User Story:** As a system administrator, I want the API to be protected against common attacks, so that user data remains secure.

#### Acceptance Criteria

1. THE API_Server SHALL implement HTTPS with valid TLS certificate for all endpoints
2. THE API_Server SHALL set secure HTTP headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
3. THE API_Server SHALL implement CORS with whitelist of allowed origins
4. THE API_Server SHALL validate and sanitize all user inputs to prevent injection attacks
5. THE API_Server SHALL implement rate limiting on all endpoints (100 requests per minute per user)
6. THE API_Server SHALL hash passwords using bcrypt or Argon2 with appropriate cost factor
7. THE API_Server SHALL generate JWT tokens with secure random secrets
8. THE API_Server SHALL log security events (failed logins, unauthorized access attempts)

### Requirement 15: Database Performance

**User Story:** As a user, I want API responses to be fast, so that I have a smooth experience using the application.

#### Acceptance Criteria

1. THE Database SHALL have indexes on user_id, date, and createdAt columns in notes table
2. THE API_Server SHALL respond to GET /api/notes requests within 200ms for typical user (100 notes)
3. THE API_Server SHALL respond to search queries within 500ms
4. THE API_Server SHALL implement connection pooling with minimum 5 and maximum 20 connections
5. THE API_Server SHALL implement query result caching for frequently accessed data
6. THE Database SHALL enforce constraints at schema level (not null, foreign keys, unique)

### Requirement 16: Frontend Authentication UI

**User Story:** As a user, I want a clear and intuitive authentication interface, so that I can easily register, login, and manage my account.

#### Acceptance Criteria

1. THE Frontend_Client SHALL display a login page as the default landing page for unauthenticated users
2. THE Frontend_Client SHALL provide visible links to "Register", "Forgot Password", and "Login" flows
3. THE Frontend_Client SHALL display real-time validation feedback on form fields
4. THE Frontend_Client SHALL display clear error messages for authentication failures
5. THE Frontend_Client SHALL show loading indicators during API requests
6. THE Frontend_Client SHALL display user email and account menu in header when authenticated
7. THE Frontend_Client SHALL maintain responsive design for mobile and desktop devices

### Requirement 17: Offline Support and Sync

**User Story:** As a user, I want to work offline and sync changes when connection is restored, so that I can use the app without constant internet access.

#### Acceptance Criteria

1. THE Frontend_Client SHALL detect online/offline status using browser APIs
2. WHEN offline, THE Frontend_Client SHALL store changes in IndexedDB as pending sync
3. THE Frontend_Client SHALL display offline indicator in the UI
4. WHEN connection is restored, THE Frontend_Client SHALL automatically sync pending changes to API_Server
5. THE API_Server SHALL handle conflict resolution using last-write-wins strategy with timestamp comparison
6. THE Frontend_Client SHALL display sync status (syncing, synced, sync failed)
7. IF sync fails, THE Frontend_Client SHALL retry with exponential backoff (1s, 2s, 4s, 8s, 16s)
8. THE Frontend_Client SHALL preserve offline changes until successfully synced

### Requirement 18: Parser for Import/Export Format

**User Story:** As a developer, I want robust parsing of export/import JSON files, so that data migration is reliable and error-free.

#### Acceptance Criteria

1. WHEN a valid JSON export file is provided, THE Parser SHALL parse it into Note objects
2. WHEN an invalid JSON file is provided, THE Parser SHALL return descriptive error message
3. THE Pretty_Printer SHALL format Note objects back into valid JSON export files
4. FOR ALL valid Note collections, exporting then importing then exporting SHALL produce equivalent JSON (round-trip property)
5. THE Parser SHALL validate all required fields are present (id, date, title, content)
6. THE Parser SHALL handle missing optional fields (tags, links, files, audioRecordings) by using empty arrays
7. THE Parser SHALL validate date fields are in ISO 8601 format (YYYY-MM-DD)
8. THE Parser SHALL reject files with schema version mismatches

### Requirement 19: API Error Handling

**User Story:** As a developer, I want consistent error responses from the API, so that I can handle errors predictably in the frontend.

#### Acceptance Criteria

1. THE API_Server SHALL return errors in consistent JSON format with "error" and "message" fields
2. THE API_Server SHALL return 400 Bad Request for invalid input with field-specific errors
3. THE API_Server SHALL return 401 Unauthorized for missing or invalid authentication
4. THE API_Server SHALL return 403 Forbidden for valid authentication but insufficient permissions
5. THE API_Server SHALL return 404 Not Found for resources that don't exist
6. THE API_Server SHALL return 429 Too Many Requests when rate limit is exceeded
7. THE API_Server SHALL return 500 Internal Server Error for unexpected errors
8. THE API_Server SHALL log all 500 errors with stack traces for debugging

### Requirement 20: LGPD Compliance

**User Story:** As a system operator, I want the system to comply with LGPD requirements, so that we meet legal obligations for user data protection.

#### Acceptance Criteria

1. THE System SHALL store only data explicitly provided by users (email, password, notes)
2. THE System SHALL provide data export functionality (Requirement 12)
3. THE System SHALL provide account deletion functionality (Requirement 13)
4. THE Frontend_Client SHALL display privacy policy explaining data collection, storage, and usage
5. THE System SHALL not share user data with third parties
6. THE System SHALL implement data encryption in transit (HTTPS) and at rest (database encryption)
7. THE System SHALL maintain audit logs of access, export, and deletion events for 1 year
8. THE Frontend_Client SHALL require explicit consent acceptance during registration

### Requirement 21: Video Recording Storage

**User Story:** As a user, I want to record and upload video files attached to my notes, so that I can store visual recordings with my notes on the server.

#### Acceptance Criteria

1. THE API_Server SHALL provide POST /api/notes/:id/video endpoint for video uploads
2. THE API_Server SHALL accept video files in webm and mp4 formats
3. THE API_Server SHALL enforce maximum 50MB per video file
4. THE API_Server SHALL validate video file format and integrity before storage
5. THE API_Server SHALL store video files with the same mechanisms as file and audio uploads
6. THE API_Server SHALL include video files in user Storage_Quota calculation
7. THE Frontend_Client SHALL record video using browser MediaRecorder API and convert to webm format
8. THE Frontend_Client SHALL display video duration and file size before upload
9. WHEN Storage_Quota is exceeded, THE API_Server SHALL return 413 Payload Too Large error with remaining quota information
10. THE Authorization_Service SHALL verify user owns the note before allowing video upload

### Requirement 22: Username-Based Authentication

**User Story:** As a user, I want to login using my username or email, so that I have flexibility in how I access my account.

#### Acceptance Criteria

1. THE Frontend_Client SHALL provide registration form with username field in addition to email and password
2. THE Frontend_Client SHALL validate that username contains only alphanumeric characters, hyphens, and underscores
3. THE Frontend_Client SHALL validate that username length is between 3 and 20 characters
4. THE API_Server SHALL enforce username uniqueness across all accounts in Database
5. WHEN a user submits registration with username, THE API_Server SHALL validate username is not already taken
6. THE API_Server SHALL reject registration if username already exists in Database
7. WHEN a user submits login credentials, THE Authentication_Service SHALL accept either email or username as identifier
8. THE Authentication_Service SHALL determine if input is email (contains @) or username, then query accordingly
9. THE Frontend_Client SHALL display appropriate error message if username is already taken during registration
10. THE API_Server SHALL include username in JWT_Token payload for user identification

### Requirement 23: Complete User Registration with CPF

**User Story:** As a new user, I want to provide my complete information including full name, CPF, email, username and password, so that I can create a verified account.

#### Acceptance Criteria

1. THE Frontend_Client SHALL provide registration form with fields: Full_Name, CPF, Email, Username, Password
2. THE Frontend_Client SHALL mark all fields (Full_Name, CPF, Email, Username, Password) as required
3. THE Frontend_Client SHALL validate CPF format as 11 digits (with or without formatting dots and dash)
4. THE Frontend_Client SHALL validate password meets security requirements (8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character)
5. WHEN a user submits registration, THE API_Server SHALL validate CPF using CPF_Validator algorithm
6. THE CPF_Validator SHALL calculate and verify both check digits according to Brazilian CPF algorithm
7. THE API_Server SHALL reject registration if CPF fails validation algorithm
8. THE API_Server SHALL enforce CPF uniqueness across all accounts (one CPF per account)
9. THE API_Server SHALL store CPF in encrypted format in Database
10. THE API_Server SHALL validate Full_Name contains at least first and last name (minimum 2 words)
11. WHEN registration succeeds, THE API_Server SHALL create Account with status "pending_verification" and trial_end_date set to 3 days from email verification

### Requirement 24: Three-Day Trial Period

**User Story:** As a new user, I want to have 3 days of free access after email confirmation, so that I can evaluate the system before committing to a subscription.

#### Acceptance Criteria

1. WHEN a user verifies email, THE API_Server SHALL set trial_end_date to current timestamp plus 3 days (72 hours)
2. THE API_Server SHALL set Subscription_Status to "trial" upon email verification
3. WHILE Subscription_Status is "trial" and current date is before trial_end_date, THE System SHALL allow full access to all features
4. THE API_Server SHALL check Subscription_Status and trial_end_date on every authenticated request
5. WHEN current date is within 24 hours of trial_end_date, THE Email_Service SHALL send notification email to user
6. WHEN current date exceeds trial_end_date and Subscription_Status is still "trial", THE API_Server SHALL update Subscription_Status to "expired"
7. WHEN Subscription_Status is "expired", THE API_Server SHALL block access to all features except data export and subscription management
8. THE Frontend_Client SHALL display trial remaining time in user interface header
9. THE Frontend_Client SHALL display subscription upgrade prompt when trial period has 1 day remaining
10. THE API_Server SHALL store trial_start_date and trial_end_date in Account record for audit purposes

### Requirement 25: Payment and Subscription System

**User Story:** As a user, I want to subscribe to a paid plan using credit card, so that I can continue using the system after the trial period ends.

#### Acceptance Criteria

1. THE API_Server SHALL integrate with at least one Payment_Gateway (Stripe, PagSeguro, or Mercado Pago)
2. THE API_Server SHALL provide POST /api/subscription/payment-method endpoint to register Payment_Method
3. THE API_Server SHALL store Payment_Method token from Payment_Gateway securely (never store full card numbers)
4. THE API_Server SHALL provide two Subscription_Plan options: monthly and annual
5. THE API_Server SHALL provide POST /api/subscription/subscribe endpoint accepting plan_id (monthly or annual)
6. WHEN a user subscribes, THE API_Server SHALL create Subscription record with Subscription_Status "active"
7. THE API_Server SHALL process initial payment through Payment_Gateway before activating subscription
8. THE API_Server SHALL schedule automatic renewal based on Subscription_Plan period
9. WHEN renewal date arrives, THE API_Server SHALL attempt automatic payment through Payment_Gateway
10. IF automatic payment succeeds, THE API_Server SHALL extend subscription period and update renewal_date
11. IF automatic payment fails, THE API_Server SHALL retry up to 3 times over 7 days
12. IF all payment retries fail, THE API_Server SHALL update Subscription_Status to "expired" and send notification email
13. THE API_Server SHALL provide GET /api/subscription/history endpoint returning Payment_History for authenticated user
14. THE API_Server SHALL provide POST /api/subscription/cancel endpoint to cancel subscription
15. WHEN a user cancels, THE API_Server SHALL update Subscription_Status to "cancelled" and set cancellation_date
16. WHEN Subscription_Status is "cancelled", THE System SHALL allow access until current billing period ends
17. WHEN Subscription_Status is "expired" or "cancelled" after billing period, THE System SHALL block feature access except data export
18. THE Frontend_Client SHALL provide subscription management interface showing current plan, renewal date, and payment history
19. THE API_Server SHALL enforce that users with inactive subscription can still export their data (LGPD compliance)
20. THE Payment_Gateway integration SHALL comply with PCI-DSS standards for payment security
