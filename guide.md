# SCHEMA_GUIDE.md

# ShohojRin Database Design Guide

> This document serves as the database design specification for ShohojRin.
>
> It explains **why each entity exists**, **why it should be separated into its own table**, **its relationships**, and **how the final ERD should be derived**.
>
> The goal is **not simply to create many tables**, but to build a database that is normalized, scalable, extensible and reflects real-world business workflows.

---

# Database Design Philosophy

The database should prioritize:

- Third Normal Form (3NF)
- Extensibility
- Data Integrity
- Auditability
- Explainability
- Separation of Concerns

Every table should represent **one business entity**.

Business workflows should be represented through relationships rather than duplicated fields.

---

# Core Design Principles

## 1. Never Store Derived Data Unless Necessary

Example:

DO NOT store:

```
Outstanding Balance
```

if it can be calculated from repayments.

Only store derived values if:

- performance requires it
- historical snapshots are needed

---

## 2. Separate Workflow From Identity

Example:

A borrower exists.

Verification is **not** a property.

Verification is a **process**.

Therefore:

```
Users

!=

Verification Requests
```

---

## 3. Historical Records Must Never Be Lost

Never overwrite:

- trust score
- verification history
- loan status history

Instead create historical records.

---

## 4. Audit Everything Important

Sensitive actions should generate immutable audit records.

Nothing important should disappear.

---

# ENTITY GROUPS

The database consists of the following groups.

1. Authentication
2. User Information
3. Verification
4. Trust Engine
5. Loan Management
6. Partner Integration
7. Repayment
8. Fraud
9. Audit
10. Notification

---

# AUTHENTICATION

## Users

Purpose

Stores authentication identity.

Should ONLY contain:

- login information
- credentials
- system role
- account status

Do NOT place:

- education
- address
- income
- institution

inside this table.

Reason

Authentication changes independently from profile information.

Keeping them separate improves normalization.

Relationship

```
User

1 ----- 1

User Profile

1 ----- N

Loan Applications

1 ----- N

Verification Requests

1 ----- N

Audit Logs

1 ----- N

Notifications
```

---

## Login Sessions

Purpose

Stores active sessions.

Reason

Allows:

- logout
- multiple devices
- session revocation

instead of relying solely on JWT expiration.

---

# USER INFORMATION

## User Profile

Purpose

Contains borrower information.

Examples

- date of birth
- address
- occupation
- family income
- institution

Reason

Avoids bloated Users table.

Allows future profile types.

---

## Institution

Purpose

Stores universities, colleges and institutions.

Reason

Thousands of users may belong to one institution.

Instead of:

```
BUET
BUET
BUET
BUET
```

store once.

Relationship

```
Institution

1 ------ N

Users
```

---

# VERIFICATION

Verification is a workflow.

Not a boolean.

---

## Verification Request

Purpose

Represents one verification process.

Reason

Users may:

- verify
- reverify
- update documents
- appeal rejection

A single boolean cannot represent this history.

Relationship

```
User

1 ----- N

Verification Requests
```

---

## Verification Documents

Purpose

Stores uploaded documents.

Examples

- NID
- Student ID
- Tuition Receipt
- Utility Bill

Reason

One request contains multiple documents.

Keeping them separate supports:

- OCR
- document replacement
- future AI validation

Relationship

```
Verification Request

1 ----- N

Documents
```

---

## Reference / Guarantor

Purpose

Stores guarantor information.

Reason

One borrower may change guarantors.

Future versions may support multiple guarantors.

---

# TRUST ENGINE

The trust engine is the primary innovation.

---

## Trust Score

Purpose

Stores calculated trust score.

Reason

Trust score changes.

It should not overwrite history.

Historical versions allow:

- trend analysis
- explainability
- auditing

Relationship

```
User

1 ----- N

Trust Scores
```

---

## Trust Score Factors

Purpose

Explains WHY a score exists.

Example

Identity Verified

+20

Previous Repayment

+15

Duplicate Identity

-50

Reason

Evaluators must understand:

WHY did this borrower receive 72?

Not simply:

Score = 72.

Relationship

```
Trust Score

1 ----- N

Factors
```

---

# LOAN MANAGEMENT

Loan Application

Loan

Repayment

are NOT the same entity.

---

## Loan Application

Purpose

Represents a request.

Reason

A request may be:

Rejected

Withdrawn

Pending

Approved

without ever becoming a loan.

Relationship

```
User

1 ----- N

Applications
```

---

## Loan Offer

Purpose

Represents partner offer.

Reason

Approval and loan terms are different.

Partner may approve:

30,000

instead of requested:

50,000

Should not modify original application.

---

## Loan

Purpose

Represents active approved loan.

Reason

Loan exists only after approval.

Applications exist before.

Separating them simplifies workflow.

---

## Loan Disbursement

Purpose

Represents movement of money.

Reason

Loan approval

!=

Money transferred

Future:

One loan may have:

multiple disbursements.

---

# REPAYMENT

---

## Repayment Schedule

Purpose

Stores expected installments.

Reason

Expected payments differ from actual payments.

Relationship

```
Loan

1 ----- N

Schedules
```

---

## Repayment

Purpose

Stores actual payment.

Reason

Partial payments.

Failed payments.

Late payments.

Need history.

Never overwrite.

Relationship

```
Schedule

1 ----- N

Repayments
```

---

# PARTNER ENGINE

The platform is not a lender.

Partners are.

---

## Funding Partner

Purpose

Represents:

Bank

NGO

MFI

Alumni Fund

Reason

Future partners should require no schema redesign.

---

## Partner Rules

Purpose

Each partner defines:

Minimum Score

Maximum Loan

Eligible Purposes

Reason

Rules should not be hardcoded.

---

## Partner Decision

Purpose

Stores partner evaluation.

Reason

Application

!=

Decision

Partner may:

Approve

Reject

Manual Review

Need history.

---

# FRAUD

Fraud is event-based.

---

## Fraud Flag

Purpose

Represents suspicious activity.

Examples

Duplicate Identity

Repeated Failed Verification

Multiple Accounts

Document Mismatch

Reason

Should remain reviewable.

Never automatically delete.

Relationship

```
User

1 ----- N

Fraud Flags
```

---

# AUDIT

The audit module is mandatory.

---

## Audit Log

Purpose

Records every sensitive operation.

Examples

Verification Approved

Loan Approved

Trust Updated

Profile Modified

Reason

Transparency.

Compliance.

Debugging.

Historical reconstruction.

Fields should include:

Who

When

What

Before

After

IP

Device

---

# NOTIFICATION

---

## Notification

Purpose

Stores outgoing notifications.

Examples

Repayment Reminder

Verification Complete

Loan Approved

Reason

Supports retries.

Supports analytics.

Supports multiple channels.

---

# RELATIONSHIPS

```
Institution

1 ----- N

Users

Users

1 ----- 1

Profile

Users

1 ----- N

Verification Requests

Verification Request

1 ----- N

Documents

Users

1 ----- N

Applications

Application

1 ----- 0..1

Loan Offer

Application

1 ----- 0..1

Loan

Loan

1 ----- N

Repayment Schedule

Repayment Schedule

1 ----- N

Repayment

Users

1 ----- N

Trust Scores

Trust Score

1 ----- N

Trust Factors

Users

1 ----- N

Fraud Flags

Users

1 ----- N

Audit Logs

Partner

1 ----- N

Partner Rules

Partner

1 ----- N

Partner Decisions
```

---

# NORMALIZATION REQUIREMENTS

The final schema should satisfy Third Normal Form.

Avoid:

Repeated university names

Repeated document types

Repeated partner names

Repeated statuses

Instead normalize.

---

# EXPECTED ENUMS

Examples

Loan Status

```
Draft

Submitted

Under Review

Approved

Rejected

Disbursed

Active

Completed

Overdue

Defaulted
```

Verification Status

```
Pending

Approved

Rejected

Needs Review
```

Trust Band

```
Low

Medium

High
```

Fraud Severity

```
Low

Medium

High

Critical
```

---

# REQUIRED TRIGGERS

Examples

After Verification Approval

Recalculate trust score.

---

After Repayment

Update installment.

---

After Loan Approval

Generate repayment schedule.

---

After Fraud Flag

Notify admin.

---

After Overdue

Decrease trust score.

Generate notification.

---

# REQUIRED VIEWS

Examples

Verified Borrowers

High Risk Borrowers

Overdue Loans

Partner Statistics

Loan Summary

Trust Summary

Repayment Performance

Institution Statistics

---

# REQUIRED STORED PROCEDURES / FUNCTIONS

calculateTrustScore()

evaluateLoanEligibility()

generateRepaymentSchedule()

recordAudit()

flagFraud()

updateLoanStatus()

calculateOutstandingBalance()

partnerEligibilityCheck()

---

# DESIGN GOALS

The completed ERD should demonstrate:

✔ Proper normalization

✔ Clear business workflows

✔ Historical traceability

✔ Extensibility

✔ Referential integrity

✔ Explainable trust scoring

✔ Event-driven audit logging

✔ Modular partner integration

✔ Minimal redundancy

✔ Production-inspired architecture

The final schema should be suitable for a modern PostgreSQL-backed financial workflow system and should be extensible without requiring structural redesign.