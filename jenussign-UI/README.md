# JenusSign - eIDAS AES-Compliant Digital Signing Platform

## 🏢 Overview

JenusSign is a modern, enterprise-grade digital signing platform designed for insurance companies to securely collect **eIDAS Advanced Electronic Signatures (AES)** from customers on insurance proposal documents.

### Key Features

- ✅ **eIDAS AES Compliant** - Meets all 7 requirements for Advanced Electronic Signatures
- 🔐 **Dual Portal Architecture** - Separate portals for customers and agents/admins
- 🔒 **Azure Key Vault Integration** - HSM-backed corporate eSeal
- ⏰ **Trusted Timestamping** - RFC 3161 compliance via freetsa.org
- 📊 **Complete Audit Trail** - 10+ years retention with full evidence package
- 🎨 **Modern UI/UX** - Built with React, Tailwind CSS, and Framer Motion

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Demo Credentials

**Agent/Admin Portal (`/portal/login`):**
- Email: `admin@insurance.com` / Password: `admin123`
- Email: `agent@insurance.com` / Password: `agent123`
- 2FA OTP: `123456`

**Customer Portal (`/customer/login`):**
- Email: Any email address
- OTP: `123456`

## 📁 Project Structure

```
jenussign-frontend/
├── src/
│   ├── api/                    # API client services
│   ├── modules/
│   │   ├── customer-portal/    # Customer-facing portal
│   │   └── noncustomer-portal/ # Agent/Admin portal
│   ├── shared/                 # Shared components & utilities
│   ├── routes/                 # Routing configuration
│   └── main.jsx                # Entry point
├── public/                     # Static assets
└── package.json                # Dependencies
```

## 🎯 Features

### Customer Portal
- Passwordless email OTP login
- View proposals dashboard
- Complete signing journey (Identity → OTP → Review → Sign → Complete)

### Non-Customer Portal
- Email + password with 2FA login
- Customer management
- Proposal creation and tracking
- Document upload
- Audit trail viewing
- Settings management (Admin only)

## 🔐 eIDAS AES Compliance

Implements all 7 requirements:
1. ✅ Unique link to signatory
2. ✅ Capable of identifying signatory
3. ✅ Signature creation data under sole control
4. ✅ Sole control of signatory
5. ✅ Integrity protection / tamper detection
6. ✅ Trusted timestamp (RFC 3161)
7. ✅ Audit trail & validation evidence

## 🚀 Production Build

```bash
npm run build
npm run preview
```

## 📝 License

This project is proprietary software. All rights reserved.
