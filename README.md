# ShohojRin *(Working Title)*

> **A Trust-Based Verification & Loan Orchestration Platform for
> Inclusive Microcredit**

------------------------------------------------------------------------

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

-   University students
-   Fresh graduates
-   Freelancers
-   Small business owners
-   Lower-middle and middle-income individuals with limited or no formal
    credit history

ShohojRin does **not** approve or reject loans. It provides structured
and trustworthy information to support lending decisions made by partner
institutions.

------------------------------------------------------------------------

# Problem Statement

Traditional lending institutions generally depend on conventional
indicators such as:

-   Salary certificates
-   Banking history
-   Existing credit records
-   Manual verification
-   Physical documentation
-   Multiple in-person visits

While these processes work reasonably well for salaried professionals,
they often disadvantage:

-   Students
-   First-time borrowers
-   Freelancers
-   Informal workers
-   Small entrepreneurs

Although many of these individuals are trustworthy borrowers, they
frequently lack the conventional evidence required by financial
institutions.

Consequently:

-   Small loan approvals become slow.
-   Verification costs remain disproportionately high.
-   Fraud risks increase.
-   Borrowers experience unnecessary delays in accessing funds.

------------------------------------------------------------------------

# Proposed Solution

ShohojRin introduces a reusable trust and verification infrastructure.

Instead of repeating the entire verification process for every loan
application, the platform maintains a borrower profile containing
verified information and a transparent trust score based on reliability
rather than privilege.

When users submit future applications, previously verified information
can be reused, reducing verification effort while maintaining
accountability and transparency.

------------------------------------------------------------------------

# Vision

Create a transparent digital trust layer that helps financial
institutions evaluate underserved borrowers without replacing existing
banking systems.

------------------------------------------------------------------------

# Mission

Reduce verification friction while maintaining:

-   Accountability
-   Transparency
-   Auditability
-   Fairness
-   Extensibility

------------------------------------------------------------------------

# Project Scope

## Included

-   Authentication
-   Borrower profile management
-   Identity and document verification
-   Trust score generation
-   Loan application workflow
-   Partner evaluation
-   Fraud detection
-   Audit logging
-   Repayment tracking
-   Notification system
-   Administrative dashboard

## Not Included

ShohojRin does **not** attempt to:

-   Operate as a licensed bank
-   Provide loan capital
-   Replace financial institutions
-   Guarantee loan approval
-   Eliminate default risk

------------------------------------------------------------------------

# Core System Workflow

``` text
Borrower
    │
Authentication
    │
Profile Management
    │
Verification
    │
Trust Assessment
    │
Loan Application
    │
Partner Evaluation
    │
Partner Decision
    │
Disbursement
    │
Repayment
    │
Trust Update
    │
Analytics
```

------------------------------------------------------------------------

# Functional Modules

## 1. Authentication

Responsible for:

-   User registration
-   Login
-   Password security
-   Session management

## 2. Profile Management

Stores borrower information, including:

-   Personal details
-   Education
-   Employment
-   Address
-   Institution

## 3. Verification Module

Handles:

-   Identity verification
-   Student verification
-   Document validation
-   Guarantor verification

The module supports multiple verification attempts while preserving
historical records.

## 4. Trust Engine

Generates an explainable trust score based on borrower reliability.

Positive signals include:

-   Verified identity
-   Verified institution
-   Consistent repayment history
-   Stable account history

Negative signals include:

-   Duplicate identity
-   Forged or mismatched documents
-   Repeated defaults
-   Suspicious account activity

The score is intended to assist lenders rather than make lending
decisions.

## 5. Loan Engine

Responsible for:

-   Creating loan applications
-   Managing application status
-   Tracking the loan lifecycle
-   Generating repayment schedules

## 6. Partner Engine

Represents partner lending organizations.

Each partner defines:

-   Minimum trust score
-   Maximum loan amount
-   Supported loan purposes
-   Repayment duration

The platform evaluates whether an application satisfies a partner's
published requirements.

## 7. Fraud Detection

The initial implementation uses rule-based detection.

Example indicators:

-   Duplicate identities
-   Multiple active accounts
-   Repeated verification failures
-   Suspicious submission behavior
-   Inconsistent documentation

Flagged cases are reviewed by administrators.

## 8. Audit Module

Every important system action generates an audit record.

Examples:

-   Verification approval/rejection
-   Trust score recalculation
-   Loan approval
-   Repayment
-   Fraud flag
-   Profile modification

## 9. Notification Module

Supports:

-   Email
-   SMS
-   In-app notifications

Examples include:

-   Verification completion
-   Repayment reminders
-   Overdue alerts
-   Loan decisions

## 10. Dashboard

Provides statistics including:

-   Verification success rate
-   Loan approval rate
-   Default rate
-   Repayment performance
-   Fraud statistics
-   Partner performance

------------------------------------------------------------------------

# Loan Lifecycle

``` text
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

------------------------------------------------------------------------

# Fairness Principles

The trust score should prioritize reliability rather than privilege.

The system should avoid heavily relying on:

-   GPA
-   Competitive programming achievements
-   Hackathon participation
-   Club leadership
-   Elite extracurricular activities

Need assessment and trust assessment should remain separate concepts.

------------------------------------------------------------------------

# Security Considerations

-   Passwords are securely hashed.
-   Authentication is required for sensitive operations.
-   Sessions can be revoked.
-   Important actions are logged.
-   Uploaded documents remain protected.
-   Access is role-based where appropriate.

------------------------------------------------------------------------

# Technology Stack

**Frontend**

-   React

**Backend**

-   Node.js
-   Express.js

**Database**

-   PostgreSQL

**ORM**

-   Prisma

**Authentication**

-   JWT
-   Refresh Tokens

**Storage**

-   Local Storage / Cloud Storage

**Charts**

-   Chart.js or Recharts

------------------------------------------------------------------------

# Database Design Goals

The database should satisfy Third Normal Form (3NF) while maintaining:

-   Minimal redundancy
-   Strong referential integrity
-   Transactional consistency
-   Extensibility
-   Reusable relationships

Business logic should remain separate from the database whenever
appropriate.

------------------------------------------------------------------------

# Project Deliverables

-   PostgreSQL Database Schema
-   ER Diagram
-   REST API
-   Authentication System
-   Verification Module
-   Trust Engine
-   Fraud Detection Module
-   Audit Logging
-   Loan Workflow
-   Partner Simulation Layer
-   Notification Service
-   Administrative Dashboard

------------------------------------------------------------------------

# Future Enhancements

The architecture should support future additions such as:

-   Scholarship management
-   Tuition financing
-   Device financing
-   Alumni-backed funding
-   SME microcredit
-   OCR-based document verification
-   AI-assisted fraud detection
-   National identity integration
-   Employment verification
-   Credit bureau integration

------------------------------------------------------------------------

# Final Statement

ShohojRin is **not** intended to replace financial institutions.

Instead, it provides a reusable trust and verification infrastructure
that helps lending partners process small-loan applications more
efficiently, transparently, and fairly.

Its primary innovation lies in improving the quality, explainability,
and efficiency of the information available before lending decisions are
made.
