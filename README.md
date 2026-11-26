# EcoBite: Surplus Food Rescue & Redistribution Network

**Course:** IT342 - Systems Integration and Architecture 1  
**Project Development Increment 2:** User Account Management and Password Recovery
**Author:** Valendez, Denzel Bajenting  
**Version:** 2.0 (Increment 2 Delivery)

---

## 1. Project Overview
Commercial food establishments discard tons of edible surplus food daily, while local charitable organizations struggle to maintain consistent meal supplies. **EcoBite** is a web-based surplus food rescue platform connecting local businesses (restaurants, cafes, grocery stores) with verified charities, shelters, and food banks.

Increment 1 establishes the foundational security, user management, and role-based access architecture. Increment 2 completes the account-management flow:
- Secure multi-role user registration (Donors and Recipients).
- Administrative verification gate for charity accounts (**FR-001.2**).
- Stateless JWT sessions with token revocation on logout.
- Dedicated dashboards with live database integration for all three system roles (**DONOR**, **RECIPIENT**, **ADMIN**).
- Authenticated users can view and update only their own profile details.
- Users can change their password; every existing session is invalidated afterward.
- Users can request a single-use, time-limited password-reset link delivered through SMTP/Mailpit.

---

## 2. Technology Stack

| Layer | Technology | Version | Description |
|---|---|---|---|
| **Frontend** | ReactJS | 18.x | Single Page Application built with Vite 5 |
| **Styling** | Tailwind CSS | 4.x (`@tailwindcss/vite`) | Mobile-first modern eco-green theme |
| **Routing & Client** | React Router & Axios | 7.x & 1.x | Client-side routing, auth guards, interceptors |
| **Backend** | Java Spring Boot | 3.3.5 / Java 17+ | Layered architecture (Controller, Service, Repository) |
| **Security** | Spring Security 6 & JJWT | 0.12.6 | BCrypt (cost factor 10), HS256 JWT, RBAC |
| **Database** | PostgreSQL | 16+ | Relational schema mapped with Spring Data JPA / Hibernate |

---

## 3. Prerequisites
- **Java Development Kit (JDK):** Version 17 or higher (`java -version`)
- **Node.js & npm:** Node.js v20+ and npm v10+ (`node -v`, `npm -v`)
- **Database:** PostgreSQL 16+ installed locally or running via Docker

---

## 4. Step-by-Step Setup and Run

### 4.1. Database Setup
Ensure PostgreSQL is running on port `5432` with a database named `ecobite_db`.

**Option A — Local PostgreSQL (psql / CLI):**
```sql
CREATE DATABASE ecobite_db;
```

**Option B — Docker Compose:**
```bash
cd backend
docker compose up -d
```

### 4.2. Backend Setup & Run
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
   *Verify that `.env` contains valid credentials:*
   ```properties
   DB_URL=jdbc:postgresql://127.0.0.1:5432/ecobite_db
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   JWT_SECRET=ecobite_super_secret_jwt_key_it342_2026_at_least_32_chars
   JWT_EXPIRATION_MINUTES=60
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ADMIN_NAME=EcoBite System Admin
   ADMIN_EMAIL=admin@ecobite.org
   ADMIN_PASSWORD=Admin123!
   ```
3. Run the Spring Boot application using the committed Maven wrapper:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   *The backend will start on `http://localhost:8080`.*

### 4.3. Frontend Setup & Run
1. In a new terminal window, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Copy the environment configuration:
   ```bash
   copy .env.example .env
   ```
   *Confirm `VITE_API_BASE_URL=http://localhost:8080`.*
3. Install dependencies and start the Vite dev server:
   ```bash
   npm install
   npm run dev
   ```
   *The frontend will launch at `http://localhost:5173`.*

### 4.4. Local Password-Reset Email
The bundled Docker Compose file also starts Mailpit, a local SMTP inbox. After requesting a password reset, open `http://localhost:8025` to view the email and follow its reset link. Mailpit is intended for local development only; configure a real SMTP provider before deployment.

---

## 5. Seeded Administrator Account Explanation
Under Section 3.1 of the approved SRS (**FR-001.1**), public registration is restricted strictly to Donors and Recipients. System administrators cannot self-register through public endpoints to prevent privilege escalation.

To facilitate initial platform operations and evaluation, an initial Admin account is automatically bootstrapped into PostgreSQL upon startup if no administrator currently exists:
- **Email:** `admin@ecobite.org`
- **Default Password:** `Admin123!` (defined in `ADMIN_PASSWORD` in `.env`)
- **Hashing:** Encrypted using `BCryptPasswordEncoder` identically to public users.
- **Login Flow:** Uses the standard `POST /api/auth/login` endpoint through Spring Security's `AuthenticationManager`.

---

## 6. End-to-End Demo Walkthrough
Follow this 2-minute scenario to verify all Increment 1 requirements:

1. **Register a Food Donor:**
   - Open `http://localhost:5173/register` in your browser.
   - Select **Food Donor**. Enter Business Name: `"Cebu Artisan Bakery"`, Email: `"donor@cebubakery.com"`, Password: `"Password123"`, Contact: `"09171234567"`, Address: `"123 Mango Ave, Cebu City"`.
   - Submit registration. You are redirected to `/login` with a green success notification.
   - Sign in. You are routed to `/donor/dashboard`, showing the business profile, contact number normalized to `+639171234567`, and status `ACTIVE`.

2. **Register a Charity Recipient (FR-001.2 Gate):**
   - Click **Logout**. Navigate to `/register`.
   - Select **Charity / Recipient**. Enter Organization: `"Hope Care Shelter"`, Email: `"charity@hopecare.org"`, Password: `"Password123"`, Contact: `"09189876543"`, Address: `"456 Colon St, Cebu City"`.
   - Submit registration.
   - Sign in with the new recipient credentials.
   - You are routed to `/recipient/dashboard`. Notice the prominent warning banner:
     > **"Awaiting admin approval. You can't claim food until your account is approved."**
   - Claiming actions remain disabled.

3. **Admin Verification of Recipient:**
   - Click **Logout**. Sign in using the seeded Admin account:
     - Email: `admin@ecobite.org`
     - Password: `Admin123!`
   - You are routed to `/admin/dashboard`. Metrics display real-time user counts, and `"Hope Care Shelter"` appears in the verification queue.
   - Navigate to `/admin/recipients` (or click **Approve** directly on the dashboard table).
   - Click **Approve**. Confirm the action. A confirmation toast appears, and the charity moves to the **Approved Charities** tab.

4. **Confirm Recipient Approval:**
   - Click **Logout**. Sign in again as `"charity@hopecare.org"`.
   - You are routed to `/recipient/dashboard`. The warning banner is gone, replaced with:
     > **"Account Approved & Verified. Your charitable organization is approved and will be eligible to claim food when the claiming module is released."**

5. **Manage Your Profile and Password (Increment 2):**
   - Sign in with any account and open **Profile** in the navigation.
   - Update the account contact details. The application updates only the currently authenticated account; roles and recipient verification cannot be changed from this page.
   - Change the password using the current password. All existing sessions are invalidated and the user must sign in again.

6. **Reset a Forgotten Password (Increment 2):**
   - On the sign-in page, choose **Forgot your password?** and enter an account email.
   - Open Mailpit at `http://localhost:8025`, open the reset email, and follow the one-time link.
   - Set a new password. The link expires after the configured `RESET_TOKEN_EXPIRATION_MINUTES` (15 minutes by default), cannot be reused, and invalidates all prior sessions.

---

## 7. API Endpoints Table

| Method | Endpoint | Access Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public (Unauthenticated) | Registers a new Donor or Recipient (auto-hashes password with BCrypt) |
| `POST` | `/api/auth/login` | Public (Unauthenticated) | Authenticates credentials; returns `{ token, tokenType, expiresIn, user }` |
| `POST` | `/api/auth/logout` | Authenticated (Any role) | Revokes current JWT's `jti` in database table `revoked_tokens` |
| `GET` | `/api/auth/me` | Authenticated (Any role) | Retrieves authenticated user profile from token |
| `GET` | `/api/users/{userId}` | Authenticated owner only | Retrieves a profile only when `{userId}` is the current user's ID |
| `PUT` | `/api/users/{userId}` | Authenticated owner only | Updates the current user's name, email, contact details, address, and optional coordinates |
| `PUT` | `/api/auth/change-password` | Authenticated (Any role) | Validates the current password, changes it, and invalidates all active sessions |
| `POST` | `/api/auth/forgot-password` | Public | Sends a single-use reset link when the email belongs to an account; response never reveals account existence |
| `POST` | `/api/auth/reset-password` | Public | Validates a reset token and sets a new password, invalidating all active sessions |
| `GET` | `/api/donor/dashboard` | `DONOR` only | Retrieves donor profile and active account status |
| `GET` | `/api/recipient/dashboard` | `RECIPIENT` only | Retrieves recipient profile and current verification status |
| `GET` | `/api/admin/dashboard` | `ADMIN` only | Returns real aggregate metrics (total users, donors, recipients, pending, approved) |
| `GET` | `/api/admin/recipients` | `ADMIN` only | Lists recipients filtered by `status=pending\|approved\|all` |
| `PATCH` | `/api/admin/recipients/{userId}/verify` | `ADMIN` only | Sets `is_verified=true` for designated recipient (404 if not Recipient) |
| `PATCH` | `/api/admin/recipients/{userId}/revoke` | `ADMIN` only | Sets `is_verified=false` for designated recipient |

---

## 8. Role-Permission Matrix

| Action / Capability | Anonymous | DONOR | RECIPIENT | ADMIN |
|---|:---:|:---:|:---:|:---:|
| Register as Donor / Recipient |  | ❌ | ❌ | ❌ |
| Login / Acquire JWT |  |  |  |  |
| Access `/api/donor/dashboard` | ❌ (401) |  (200) | ❌ (403) | ❌ (403) |
| Access `/api/recipient/dashboard` | ❌ (401) | ❌ (403) |  (200) | ❌ (403) |
| Access `/api/admin/**` | ❌ (401) | ❌ (403) | ❌ (403) |  (200) |
| Verify / Revoke Recipients | ❌ (401) | ❌ (403) | ❌ (403) |  (200) |
| Logout / Invalidate Token | ❌ (401) |  (200) |  (200) |  (200) |

---

## 9. Project Structure

```
IT342-FinalProject/
├── .gitignore                      # Git ignore rules for secrets, node_modules, target, logs
├── README.md                       # Comprehensive system documentation & evaluation guide
├── scripts/
│   └── verify-all.ps1              # Automated Section 6 verification test script
├── backend/
│   ├── .env.example                # Backend environment variable template
│   ├── docker-compose.yml          # Container configuration for PostgreSQL
│   ├── mvnw / mvnw.cmd             # Committed Maven wrapper binaries
│   ├── pom.xml                     # Maven project configuration (Spring Boot 3.3.5)
│   └── src/
│       └── main/
│           ├── java/com/ecobite/
│           │   ├── EcobiteApplication.java
│           │   ├── config/
│           │   │   └── SecurityConfig.java
│           │   ├── controller/
│           │   │   ├── AdminController.java
│           │   │   ├── AuthController.java
│           │   │   ├── DonorController.java
│           │   │   └── RecipientController.java
│           │   ├── dto/
│           │   │   ├── AuthResponse.java
│           │   │   ├── DashboardAdminResponse.java
│           │   │   ├── DashboardDonorResponse.java
│           │   │   ├── DashboardRecipientResponse.java
│           │   │   ├── ErrorResponse.java
│           │   │   ├── LoginRequest.java
│           │   │   ├── RegisterRequest.java
│           │   │   └── UserResponse.java
│           │   ├── entity/
│           │   │   ├── RevokedToken.java
│           │   │   ├── Role.java
│           │   │   └── User.java
│           │   ├── exception/
│           │   │   ├── DuplicateEmailException.java
│           │   │   ├── GlobalExceptionHandler.java
│           │   │   ├── InvalidRequestException.java
│           │   │   └── ResourceNotFoundException.java
│           │   ├── repository/
│           │   │   ├── RevokedTokenRepository.java
│           │   │   └── UserRepository.java
│           │   ├── security/
│           │   │   ├── CustomAccessDeniedHandler.java
│           │   │   ├── CustomAuthenticationEntryPoint.java
│           │   │   ├── CustomUserDetails.java
│           │   │   ├── CustomUserDetailsService.java
│           │   │   ├── JwtAuthenticationFilter.java
│           │   │   └── JwtTokenProvider.java
│           │   └── service/
│           │       ├── AdminBootstrapService.java
│           │       ├── TokenRevocationService.java
│           │       └── UserService.java
│           └── resources/
│               └── application.yml
└── frontend/
    ├── .env.example                # Frontend environment variable template
    ├── package.json                # React, Vite, Tailwind CSS, Axios dependencies
    ├── vite.config.js              # Vite 5 + @tailwindcss/vite configuration
    └── src/
        ├── api/
        │   └── axios.js            # Axios client with JWT bearer & 401 interceptors
        ├── components/
        │   ├── Navbar.jsx          # Mobile-responsive navigation with leaf branding
        │   └── ProtectedRoute.jsx  # ProtectedRoute and RoleRoute guards
        ├── config/
        │   └── navigation.js       # Unified role navigation configuration
        ├── context/
        │   └── AuthContext.jsx     # Authentication context & session manager
        ├── pages/
        │   ├── AdminDashboard.jsx
        │   ├── AdminRecipientsPage.jsx
        │   ├── DonorDashboard.jsx
        │   ├── LoginPage.jsx
        │   ├── NotFoundPage.jsx
        │   ├── RecipientDashboard.jsx
        │   ├── RegisterPage.jsx
        │   └── UnauthorizedPage.jsx
        ├── App.jsx                 # Route definitions and layout
        ├── index.css               # Tailwind CSS v4 directives
        └── main.jsx
```

---

## 10. SRS Traceability

| Requirement | Description | Implementation Realization |
|---|---|---|
| **FR-001.1** | Users register as either Donor or Recipient | Handled in `RegisterPage.jsx` and `UserService.register()`. Role `ADMIN` is rejected. Donors are marked `is_verified=true`; Recipients are marked `is_verified=false`. |
| **FR-001.2** | Recipient accounts require Admin approval before claiming food | Recipient dashboard checks `is_verified`. If false, warning banner is displayed and claim features are locked. Admins approve via `AdminController.verifyRecipient()`. |
| **Security NFR** | BCrypt password encryption, JWT sessions, strict RBAC | Passwords hashed using Spring Security's `BCryptPasswordEncoder`. JWT issued with HS256 algorithm and UUID `jti`. Role restrictions enforced in `SecurityConfig` and method security (`@PreAuthorize`). |
| **Account Management** | Users can maintain their own account details without privilege changes | `UserController` and `UserService` enforce self-ownership for profile reads and updates. The update DTO excludes roles, verification flags, IDs, and password hashes. |
| **Password Recovery** | Password reset must be secure and time-limited | Reset tokens are generated with `SecureRandom`, stored only as SHA-256 hashes, expire after 15 minutes by default, are single-use, and invalidate all prior JWTs after a successful reset. |
| **Usability NFR** | Mobile-responsive design | Built using Tailwind CSS, responsive grid layouts, and collapsing mobile navigation tested down to 375px mobile viewport width. |
| **Maintainability** | Layered backend architecture | Separated into Controller, Service, and Repository layers with zero logic leakage. Java records used for immutable DTOs without Lombok dependencies. |
| **Class Diagram Mapping** | Realization of SRS `UserController` and `UserRepository` | The SRS conceptual `UserController` is realized cleanly as `AuthController` (register, login, logout, me) and `AdminController` (verify, revoke, list recipients) backed by `UserService` and `UserRepository`. |

---

## 11. Security Implementation Notes
- **BCrypt Hashing:** Passwords are never stored in plaintext. They are encrypted using `BCryptPasswordEncoder` with an adaptive work factor of 10. No password or hash is ever returned in responses or exposed in application logs.
- **Database Token Revocation for Logout:** Although JWTs are stateless, calling `POST /api/auth/logout` records the token's unique ID (`jti`) and expiration into the `revoked_tokens` table. The `JwtAuthenticationFilter` checks this table, rendering the logged-out token immediately invalid (401 Unauthorized) upon subsequent requests. A background `@Scheduled` task cleans up expired tokens every 5 minutes.
- **Password Change and Reset:** A successful password change or reset updates the BCrypt hash and records a user-wide invalidation timestamp. The JWT filter rejects every token issued at or before that timestamp, signing out all active devices. Reset links use a cryptographically random token; only its SHA-256 hash is stored, and the raw token exists only in the emailed URL.
- **Why CSRF is Disabled:** The application uses stateless JWT bearer authentication where tokens are stored in client-side memory/sessionStorage and transmitted explicitly in the `Authorization: Bearer <token>` HTTP header. Because credentials are not automatically transmitted via browser cookies, Cross-Site Request Forgery (CSRF) is impossible by design, allowing CSRF protection to be safely disabled.
- **CORS Configuration:** Spring Security strictly restricts Cross-Origin Resource Sharing to origins defined in `CORS_ALLOWED_ORIGINS` (default `http://localhost:5173`), permitting the necessary REST verbs (`GET`, `POST`, `PATCH`, `PUT`, `DELETE`, `OPTIONS`) and exposing the `Authorization` header.

---

## 12. Troubleshooting
- **Database Connection Refused:** Verify PostgreSQL is running on port 5432 (`netstat -ano | findstr 5432`) and credentials match `backend/.env`.
- **401 Unauthorized on Fresh Session:** Ensure `JWT_SECRET` in `backend/.env` is at least 32 characters long.
- **Password Reset Email Not Appearing:** Start the local Mailpit service and confirm `MAIL_HOST=localhost`, `MAIL_PORT=1025`; then check `http://localhost:8025`.
- **Node/Vite Version Mismatch:** Use Node.js 20+; Vite 5 is configured with `@tailwindcss/vite` for maximum compatibility.

---

## 13. Scope Boundaries ("Not Yet Implemented")
The following modules belong to future project increments and are intentionally excluded from Increment 2:
- Food Listings module (creating, editing, and viewing surplus inventory).
- Food Claiming module (reserving food donations).
- Twilio API SMS notifications.
- Google Maps directions and geolocation routing.
- Impact analytics and reporting.
- Email confirmation links.
