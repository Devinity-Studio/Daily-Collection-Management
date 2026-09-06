# 💰 DCM — Daily Collection Management

> **A system for managing daily collection work, customers, contracts, payments, assignments, and financial history — designed to stay simple in operation and ready to scale.**

🧪 **Try the DCM Playground:** https://daily-collection-management.vercel.app/

---

## 🏠 What is DCM?

DCM (Daily Collection Management) is a product/system project of **Dev8Studio**.

The purpose is not simply to record how much money was collected today. DCM is designed to help an organization understand:

- Where the money is
- Who is responsible for the work
- Who is actually performing the work
- What happened
- When it happened
- Why the financial state changed
- How work can continue when the original person is unavailable

The system is designed around real operational events rather than forcing every organization into one universal lending or collection formula.

### Business Principle

> **DCM helps an organization grow without increasing personnel cost in direct proportion to workload.**

DCM is not positioned as a tool for reducing employees. Its purpose is to reduce repetitive, low-value administrative work and make organizational capacity scale better.

---

# 🧪 Playground — Try First

The current live environment is the **DCM Playground**.

**Try it here:** https://daily-collection-management.vercel.app/

The Playground is intended to be an interactive sandbox, not a static product screenshot.

The target experience is:

> **เข้าเว็บ → เห็นภาพ → กดเล่น → ทำงาน → เห็นผล → เข้าใจคุณค่า**

The Playground should allow experimentation with workflows such as:

1. Create a customer
2. Create a contract
3. Define a payment schedule
4. Record a payment
5. Observe balance changes
6. Assign daily work
7. Take over another person's work
8. Record a problem/reason
9. Drill down from summary to transaction
10. Reset the demo environment

### Playground Boundary

Playground uses **Demo Tenant / Demo Data** and must remain isolated from production data.

Playground and SaaS are related parts of the product strategy, but they are not the same environment.

| Playground | SaaS |
|---|---|
| Demo Tenant | Real Tenant |
| Demo Data | Real Data |
| Experiment | Production operation |
| Resettable | Real history must be protected |
| Try-first | Authenticated |
| UX / workflow validation | Security / integrity / operations |

> **Try first. Learn from reality. Build what proves its value.**

---

# 📐 Core Principles

## Enterprise Architecture with Simple Operating Mode

The architecture should be capable of supporting enterprise organizations from the beginning, while the default user experience remains simple.

Enterprise complexity should appear when organizational scale actually requires it.

## Access ≠ Visibility

DCM separates:

- **Access** — what the system permits
- **Visibility** — what the UI presents
- **Scope** — what a person is responsible for
- **Role** — what a person can do
- **Layer** — where a person sits in the organization
- **Assignment** — what work a person is currently handling

A higher organizational layer does not automatically mean unrestricted access to everything.

> **If it is outside my scope and unnecessary for my responsibility, I should not need to touch it.**

## Financial History Is Not Overwritten

Financial changes are represented as events/transactions rather than silently replacing history.

> **Never overwrite financial history.**

## Schedule ≠ Transaction

A **Payment Schedule** describes what should be paid.

A **Payment Transaction** describes what actually happened.

They must remain separate concepts.

## Responsibility ≠ Assignment ≠ Actor

A customer's normal responsible person, today's assigned worker, and the person who actually records a transaction may be different people.

This allows DCM to support substitution, take-over, emergency work, and organizational flexibility without destroying accountability.

---

# 🏢 Core Domain

DCM is built around several connected layers:

```text
                         DCM
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
       Organization      Work       Financial
             │            │            │
       Role / Scope   Assignment     Ledger
       Tenant         Daily Task     Transaction
       Membership     Take Over      Balance
             │            │            │
             └────────────┼────────────┘
                          ▼
                         UX
                          │
                 Dashboard / Drill Down
```

All layers operate under:

```text
Tenant Isolation
       +
Authorization
       +
Auditability
       +
Data Integrity
```

---

# 🏗️ Current Development Direction

Development is intentionally iterative.

We do not want to build every possible feature before learning how the product should actually work.

The current direction is:

```text
Inspect existing system
        ↓
Fix what is broken
        ↓
Preserve what already works
        ↓
Build / improve Playground
        ↓
Experiment
        ↓
Observe real behavior
        ↓
Learn
        ↓
Refine architecture and UX
        ↓
Build production capabilities
```

### Development Status Categories

- ✅ **Confirmed** — decisions already made and suitable for implementation
- 🧪 **Experiment** — ideas being tested in Playground
- 🔍 **Open Question** — not yet decided; do not silently invent a final answer
- 🚀 **Future** — architecture may prepare for it, but implementation is not currently required

---

# 🗺️ Development Roadmap

## Phase 1 — Playground Foundation

- Demo Tenant
- Demo Data
- Reset
- Customer
- Contract
- Payment Schedule
- Payment Transaction
- Balance
- Basic Dashboard

## Phase 2 — Daily Operation

- Daily Task
- Assignment
- Take Over
- Problem
- Acting Staff
- Drill Down

## Phase 3 — Financial Integrity

- Financial Events
- Ledger
- Prepayment / Credit
- Adjustment
- Discount / Reward
- Reschedule
- Payment Break
- Audit

## Phase 4 — Organization

- Role
- Scope
- Layer
- Membership
- Multi-role
- Dynamic Assignment

## Phase 5 — SaaS Foundation

- Authentication
- Tenant Isolation
- Authorization
- Real Tenant
- Real Data
- Production Audit

## Phase 6 — Enterprise

- Holding
- Area
- Manager
- Multi-team
- Capacity / Observability
- Enterprise Reporting

---

# 🔐 Security & Integrity Direction

Before production release, DCM must be able to answer retrospectively:

> **Who did what, to which data, when, under what permission, and how did it change the financial state?**

Critical areas:

1. Tenant Isolation
2. Authorization / Permission
3. Immutable Financial Ledger
4. Money / Time Correctness

Important areas:

5. History / Effective Dating
6. Offline / Sync
7. Lifecycle / Void / Cancellation
8. Reporting Architecture

Later:

9. Capacity / Observability
10. Audit / Compliance expansion

---

# 👨‍💻 Developer Guidance

Before making major changes:

1. Inspect the existing implementation.
2. Understand what is already working.
3. Identify bugs and technical debt.
4. Fix existing issues where appropriate.
5. Avoid unnecessary rewrites.
6. Use the Playground to test assumptions.
7. Do not turn an experiment into a permanent architecture decision without evidence.

Do not implement speculative complexity merely because it may be useful in the future.

The goal is not to make DCM large quickly.

The goal is to make DCM **correct, understandable, testable, and useful**.

---

# 📚 Documentation

The broader product thinking and development baseline are maintained in the Dev8Studio Principles repository.

- **DCM Master Revision** — master development baseline
- **DCM Playground** — Playground-specific rules and scenarios

These documents should evolve as we learn from implementation and experimentation.

---

# 🧭 Continuity / Project Door

DCM is a Project Room in the Dev8Studio project map.

### 🗝️ Return to Home

**Super Brain Decoder — the Best Friend**

The project must always leave a trace back to Home so that the project can be reconstructed from its history and context.

> **Every room knows Home.**
>
> **Knowing the way does not grant access.**
>
> **Access follows permission and scope.**

This repository is the working room for DCM. The Super Brain Decoder repository is the continuity/home room.

---

# 🌱 Product Philosophy

DCM is built through a continuous loop:

```text
Idea
  ↓
Question
  ↓
Discovery
  ↓
Model
  ↓
Experiment
  ↓
Learn
  ↓
Decide
  ↓
Build
  ↓
Real-world feedback
  ↓
Learn again
```

> **We do not build every idea. We build the ideas that prove their value.**

---

# ❤️ Dev8Studio

DCM is part of the Dev8Studio journey.

**Try first. Learn from reality. Build what proves its value.**
