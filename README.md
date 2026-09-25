# ShohojRin _(Working Title)_

> **A Trust-Based Verification & Loan Orchestration Platform for
> Inclusive Microcredit**

---

# Overview

ShohojRin is a trust-based loan orchestration platform that helps
connect underserved borrowers with lending institutions by providing a
reusable verification and trust assessment infrastructure.

The platform is **not** a bank, microfinance institution (MFI), or
payment gateway. Instead, it assists partner organizations by
simplifying borrower verification, improving transparency, maintaining
audit trails, and streamlining the loan application workflow.

Its primary objective is to reduce verification effort while enabling
lenders to make faster and more informed lending decisions.

The intended beneficiaries include:

- University students
- Fresh graduates
- Freelancers
- Small business owners
- Lower-middle and middle-income individuals with limited or no formal
  credit history

ShohojRin does **not** approve or reject loans. It provides structured
and trustworthy information to support lending decisions made by partner
institutions.

---

# Problem Statement

Traditional lending institutions generally depend on conventional
indicators such as:

- Salary certificates
- Banking history
- Existing credit records
- Manual verification
- Physical documentation
- Multiple in-person visits

While these processes work reasonably well for salaried professionals,
they often disadvantage:

- Students
- First-time borrowers
- Freelancers
- Informal workers
- Small entrepreneurs

Although many of these individuals are trustworthy borrowers, they
frequently lack the conventional evidence required by financial
institutions.

Consequently:

- Small loan approvals become slow.
- Verification costs remain disproportionately high.
- Fraud risks increase.
- Borrowers experience unnecessary delays in accessing funds.

---

# Proposed Solution

ShohojRin introduces a reusable trust and verification infrastructure.

Instead of repeating the entire verification process for every loan
application, the platform maintains a borrower profile containing
verified information and a transparent trust score based on reliability
rather than privilege.

When users submit future applications, previously verified information
can be reused, reducing verification effort while maintaining
accountability and transparency.

---

# Vision

Create a transparent digital trust layer that helps financial
institutions evaluate underserved borrowers without replacing existing
banking systems.

---

# Mission

Reduce verification friction while maintaining:

- Accountability
- Transparency
- Auditability
- Fairness
- Extensibility

---

# Project Scope

## Included

- Authentication (Borrower, Lender/Investor, Admin, Partner Agent)
- Borrower profile management (Personal, Financial, Employment, Education)
- Investor & Lender profile management (KYC, Risk preferences, Funding capacity)
- Identity and document verification
- Explainable Trust score generation & historical tracking
- Loan application workflow
- Intelligent borrower-to-lender matching (by category, risk, and funding capacity)
- Direct lender funding & automated loan generation
- Partner evaluation & rule-based decisioning
- Rule-based fraud detection
- Immutable audit logging
- Repayment schedule & ledger tracking (stored-procedure powered)
- Notification system (In-app, SMS, Email)
- Administrative and Lender/Investor dashboards

## Not Included

ShohojRin does **not** attempt to:

- Operate as a licensed bank
- Provide loan capital directly from platform reserves
- Replace financial institutions
- Guarantee loan approval
- Eliminate default risk

---

# Core System Workflow

```text
Borrower / Lender
    │
Authentication & Role Resolution
    │
Profile Management & KYC
    │
Verification (Identity, Student, Income, Guarantor)
    │
Trust Assessment (Explainable Score + Historical Snapshot)
    │
Loan Application Submission
    │
Automated Lender Matching & Partner Evaluation
    │
Lender Funding / Partner Decision
    │
Automated Loan Offer & Disbursement
    │
Repayment Processing (Stored Procedure Transaction)
    │
Trust Score Recalculation & History Log
    │
Analytics & Portfolio Monitoring
```

---

# Monorepo Architecture

The repository is structured as an npm monorepo workspace:

- **`apps/frontend`**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, and Recharts. Implements role-aware dashboards for Borrowers, Lenders, and Admins.
- **`apps/backend`**: Express.js 5, TypeScript, Node-Postgres (`pg` Pool). Features raw parameterized SQL, PostgreSQL stored procedures, functions, transactions, and row-level locking.
- **`packages/shared`**: Shared TypeScript types, utility interfaces, and Zod schemas used across client and server.

---

# Functional Modules

## 1. Authentication & Session Management

Responsible for:

- User registration (with username, email, phone)
- Multi-role support (`borrower`, `lender`, `admin`, `partner_agent`)
- Secure password hashing with bcrypt (12 rounds)
- Server-side session management (`login_sessions`) with SHA-256 hashed refresh tokens
- HttpOnly cookie-based session handling (`shohojrin_session`)

## 2. Profile Management

Stores comprehensive borrower and investor profiles:

- **Borrowers**: Personal details, financial profile (monthly income, savings, source), employment information, address, and educational institution.
- **Lenders / Investors**: Investor display name, company, KYC status, funding capacity, preferred loan categories, and risk tolerance (`conservative`, `moderate`, `aggressive`).

## 3. Verification Module

Handles:

- Identity verification (NID)
- Student verification (Student ID, enrollment year, institution verification)
- Document validation
- Guarantor verification

The module supports multiple verification attempts while preserving historical records.

## 4. Trust Engine

Generates an explainable trust score (0–100) based on borrower reliability.

Positive signals include:

- Verified identity
- Verified educational institution
- Consistent on-time repayment history
- Stable account tenure and financial capacity

Negative signals include:

- Duplicate identity
- Forged or mismatched documents
- Repeated defaults or overdue installments
- Suspicious account activity

The score is snapshot-based and never overwritten. Each recalculation creates a new immutable record with explainable factor breakdowns.

## 5. Loan Engine & Lifecycle

Responsible for:

- Creating loan applications with reference codes
- Managing application statuses (`draft`, `submitted`, `under_review`, `approved`, `rejected`, `disbursed`, etc.)
- Tracking the complete loan lifecycle from application to completion
- Automating loan creation, loan offer generation, and initial disbursement upon full funding

## 6. Lender Matching & Investor Engine

Connects borrowers directly with individual or institutional lenders:

- Automatically matches submitted loan applications to active lenders based on `preferred_categories` and funding capacity
- Generates priority-ranked matching records (`lender_application_matches`) and instant in-app notifications
- Provides an **Opportunities Feed** for lenders with transparent borrower trust metrics
- Supports direct funding commitments (`funding_commitments`) and application review/rejection

## 7. Partner Engine

Represents partner lending organizations (banks, NGOs, MFIs).

Each partner defines:

- Minimum trust score
- Maximum loan amount
- Supported loan categories & purposes
- Repayment duration and interest rates

The platform evaluates whether an application satisfies a partner's published requirements.

## 8. Repayment Module

Handles loan repayment tracking with strict database-level transactional guarantees:

- Installment schedules generated via `generate_repayment_schedule` stored procedure
- Idempotent payment processing via `process_repayment` stored procedure with row-level locking (`FOR UPDATE`)
- Automatic schedule status updates (`paid`, `partially_paid`, `overdue`)
- Automatic loan completion status updates
- Automated trigger for borrower trust score recalculation on completed payments

## 9. Fraud Detection

The initial implementation uses rule-based detection.

Example indicators:

- Duplicate identities
- Multiple active accounts
- Repeated verification failures
- Suspicious submission behavior
- Inconsistent documentation

Flagged cases are reviewed by administrators.

## 10. Audit Module

Every important system action generates an audit record.

Examples:

- Verification approval/rejection
- Trust score recalculation
- Loan approval
- Repayment
- Fraud flag
- Profile modification

## 11. Notification Module

Supports:

- Email
- SMS
- In-app notifications

Examples include:

- Verification completion
- Repayment reminders
- Overdue alerts
- Loan decisions

## 12. Dashboard & Analytics

Provides role-specific dashboards:

- **Borrower Dashboard**: Real-time application status, active loan repayment schedules, trust score history with factor breakdown
- **Lender / Investor Dashboard**: Portfolio statistics, funded loan tracking, real-time borrower opportunities feed with trust signals
- **Admin Dashboard**: Verification success rate, loan approval rate, default rate, repayment performance, fraud statistics, and a live database showcase

---

# Loan Lifecycle

```text
Draft
  │
Submitted
  │
Verification
  │
Trust Assessment
  │
Partner Evaluation
  │
Approved / Rejected
  │
Disbursement
  │
Active
  │
Repayment
  │
Completed

or

Overdue
  │
Delinquent
  │
Defaulted
```

---

# Fairness Principles

The trust score should prioritize reliability rather than privilege.

The system should avoid heavily relying on:

- GPA
- Competitive programming achievements
- Hackathon participation
- Club leadership
- Elite extracurricular activities

Need assessment and trust assessment should remain separate concepts.

---

# Security Considerations

- Passwords are securely hashed.
- Authentication is required for sensitive operations.
- Sessions can be revoked.
- Important actions are logged.
- Uploaded documents remain protected.
- Access is role-based where appropriate.

---

# Technology Stack

**Frontend**

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Lucide React
- Recharts (Data Visualizations)

**Backend**

- Node.js
- Express.js 5
- TypeScript
- Zod (Runtime validation & shared schemas)

**Database & Persistence**

- PostgreSQL 15+
- Node-Postgres (`pg` Pool) with raw parameterized SQL (No ORM)
- Database Stored Procedures (`process_repayment`, `generate_repayment_schedule`, `mark_overdue_schedules`)
- User-defined PostgreSQL Functions (`calculate_loan_remaining_balance`, `get_trust_inputs`)
- Database Triggers (Append-only immutability, automated timestamps, investor profile creation)

**Authentication & Security**

- Secure HttpOnly session cookies (`shohojrin_session`)
- Bcrypt password hashing (12 rounds)
- Server-side session store (`login_sessions`) with SHA-256 hashed refresh tokens and instant revocation
- Role-based authorization middleware (`requireAuth`, `requireRole`, `requireAdmin`, `requireOwnership`)

**Storage**

- Local Storage / Cloud Object Storage (for uploaded verification documents)

**Charts & Visualizations**

- Recharts

---

# Database Design Goals

The database should satisfy Third Normal Form (3NF) while maintaining:

- Minimal redundancy
- Strong referential integrity
- Transactional consistency
- Extensibility
- Reusable relationships

Business logic should remain separate from the database whenever
appropriate.

---

# Project Deliverables

- PostgreSQL Database Schema
- ER Diagram
- REST API
- Authentication System
- Verification Module
- Trust Engine
- Fraud Detection Module
- Audit Logging
- Loan Workflow
- Partner Simulation Layer
- Notification Service
- Administrative Dashboard

---

# Future Enhancements

The architecture should support future additions such as:

- Scholarship management
- Tuition financing
- Device financing
- Alumni-backed funding
- SME microcredit
- OCR-based document verification
- AI-assisted fraud detection
- National identity integration
- Employment verification
- Credit bureau integration

---

# Final Statement

ShohojRin is **not** intended to replace financial institutions.

Instead, it provides a reusable trust and verification infrastructure
that helps lending partners process small-loan applications more
efficiently, transparently, and fairly.

Its primary innovation lies in improving the quality, explainability,
and efficiency of the information available before lending decisions are
made.
