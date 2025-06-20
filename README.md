# Auth Dashboard – Frontend Solution

This project is the **frontend implementation** for the SaaS authentication system described in the technical assessment. It uses **React 18** and **Redux Toolkit Query** to manage JWT-based authentication with secure cookie handling.

## 🚀 Features

### Authentication
- ✅ Email/Password Registration & Login
- ✅ JWT Access & Refresh Token Authentication
- ✅ Protected Routes with Automatic Redirects
- ✅ Persistent Sessions with Secure Cookie Storage
- ✅ Automatic Token Refresh on 401 Responses
- ✅ CSRF Protection via SameSite Cookies

### Security
- 🔒 No token storage in `localStorage` or `sessionStorage`
- 🔒 HttpOnly Cookies for refresh tokens
- 🔒 Secure cookie flags in production
- 🔒 CORS and credential handling
- 🔒 XSS Protection Headers

### User Experience
- ⚡ Optimistic UI Updates
- 🔄 Loading States & Error Handling
- 📱 Responsive Design
- 🔄 Automatic Session Management

## 📋 Requirements

- Node.js 18+
- Next.js 14+
- Backend API (see API Requirements below)

## ⚙️ Configuration

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
3. Create a `.env.local` file in the root directory:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:5222
   ```

## 🚀 Getting Started

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔌 API Requirements

The frontend expects the following backend endpoints:

### Authentication
- `POST /auth/register` – User registration
  ```typescript
  interface RegisterRequest {
    email: string;
    password: string;
    name: string;
  }
  ```

- `POST /auth/login` – User login
  ```typescript
  interface LoginRequest {
    email: string;
    password: string;
  }
  ```

- `POST /auth/refresh` – Refresh access token
- `POST /auth/logout` – Invalidate refresh token

### User
- `GET /api/profile` – Get current user profile

## Features

✅ JWT access tokens stored in Redux (in-memory only)
✅ Refresh tokens handled securely via httpOnly cookies
✅ Automatic token refresh on 401 responses
✅ Protected routes with authentication checks
✅ Graceful logout if refresh fails or is revoked
✅ CORS and credential handling
✅ No usage of `localStorage` to prevent XSS token theft

## Usage

1. Start your backend server and ensure it exposes the endpoints listed above.
2. Update `NEXT_PUBLIC_API_URL` in `.env.local` to match your backend.
3. Run the frontend with `npm run dev` or `yarn dev`.

---

Let me know if you also need a `README.md` for the backend part or want to include setup instructions for a specific stack (like Node/Express or NestJS).