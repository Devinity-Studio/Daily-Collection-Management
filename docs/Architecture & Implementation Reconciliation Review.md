# DCM — Architecture & Implementation Reconciliation Review

**Version:** 1.0  
**Date:** 4 September 2026  
**Status:** Review / Pre-MVP Gate  
**Reviewer:** ChatGPT — Architecture & Product Review  
**Scope:** Reconcile the intended DCM architecture in `docs/` with the implementation currently present in the repository.

---

## 0. Executive Conclusion

DCM currently has a substantially more mature **conceptual architecture and product philosophy** than its implemented application/data layer.

The documentation already identifies several important P0 architecture corrections: tenant membership must be many-to-many, SUPER_ADMIN must not have default tenant-business access, financial data must be modeled as obligations/accounts and immutable payments, and destructive deletion must be avoided.

However, the repository currently does **not yet contain the application schema needed to implement that architecture**. The migrations directory currently contains only the Better Auth migration `0001_auth.sql`; the repository therefore cannot yet provide the documented customer, tenant, account, installment, collection/payment, subscription, invoice, membership, or audit domains through its migration layer.

This explains a critical distinction:

> **The architecture is being designed, but the operational DCM system is not yet at the point where the documented business system can actually run end-to-end.**

No production feature implementation should be treated as complete until the architecture and implementation are reconciled.

---

# 1. Findings

## F-01 — Application database schema is not implemented yet

**Severity: P0 — Blocking**

The current `migrations/` tree contains `auth/0001_auth.sql`, which creates only Better Auth identity/session tables (`user`, `session`, `account`, `verification`). There is currently no corresponding migration set for the DCM business domains.

Required business domains documented elsewhere include:

- tenants
- tenant_memberships
- plans
- subscriptions
- invoices
- platform_payments
- customers
- documents
- accounts / debts
- installments / obligations
- appointments
- collection_payments
- payment_allocations
- reversals
- audit_logs
- roles / customer portal identity where required

**Decision:** Do not attempt to patch individual UI/API symptoms before establishing the authoritative application schema.

---

## F-02 — The documented technical stack and the implemented stack diverge

**Severity: P0 — Blocking architectural decision**

`MVP Technical Specification.md` describes a proposed stack centered on Next.js, NestJS/Express, Prisma, JWT/refresh tokens, and PostgreSQL.

The actual repository package configuration uses React + Vite + TanStack Router/Start, Better Auth, Kysely, PostgreSQL tooling, and PGLite-related dependencies.

This is not automatically wrong. The implemented stack can be valid and may be preferable for the current project. The problem is that the documentation currently describes one implementation architecture while the repository is built around another.

**Decision required:** Make the actual repository stack authoritative for implementation unless there is an explicit decision to migrate stacks.

**Recommended direction:** Keep the existing React/Vite/TanStack + Better Auth + Kysely direction unless testing proves it inadequate. Update the technical specification to describe the stack we actually intend to maintain.

---

## F-03 — Payment terminology has been split correctly in the ERD, but not fully reconciled in the Technical Specification

**Severity: P0 — Data-model clarity**

The ERD distinguishes:

- `platform_payments` — payment of SaaS subscription invoices
- `collection_payments` — payment received from a tenant's customer/debtor

This is the correct conceptual separation.

However, the Technical Specification still contains a `payments` table under the subscription/invoice domain, while its architecture review also introduces payments as the financial collection domain.

Using one generic `payments` name for two materially different financial domains creates a high risk of incorrect joins, permissions, reports, and audit logic.

**Decision:** Keep the explicit names:

```text
platform_payments
collection_payments
```

and reserve the word `payment` as a conceptual term rather than as an ambiguous physical table name.

---

## F-04 — Tenant isolation rule is stale in the Technical Specification

**Severity: P0**

The architecture review correctly changes User ↔ Tenant to many-to-many through `tenant_memberships`.

But the Technical Specification still contains the old conceptual query pattern:

```sql
WHERE tenant_id = current_user.tenant_id
```

That is incompatible with the new membership model.

The authoritative rule should instead be conceptually:

```text
Authenticated User
      ↓
Active Tenant Membership
      ↓
Current Tenant Context
      ↓
Tenant-scoped query
```

Every tenant-scoped query must derive its tenant context from an authorized membership/session context, never from an obsolete `users.tenant_id` field.

---

## F-05 — Better Auth identity schema must be explicitly separated from DCM domain user concepts

**Severity: P0**

The current Better Auth migration creates a table named `user` with a string `id`, while the DCM architecture documents a domain-level `users` concept with fields such as platform role and status.

This should not be solved by casually duplicating authentication identities.

Recommended conceptual boundary:

```text
Better Auth
    ↓
Identity / Session
    ↓
Application User Context
    ↓
Tenant Membership / Platform Role
    ↓
DCM Business Authorization
```

The implementation must explicitly decide whether the Better Auth `user` table is the canonical identity table and application-specific fields are added to it, or whether a separate profile/domain table references Better Auth's user id.

**Recommendation:** Prefer a clear one-to-one application profile/domain extension over maintaining two independent user identities.

---

## F-06 — Financial model needs one canonical vocabulary

**Severity: P1 → P0 if implementation begins without resolution**

The documents use several related terms:

- debt
- obligation
- account
- installment
- collection
- payment

These can all be valid, but they represent different levels of the financial model.

Recommended canonical hierarchy:

```text
Customer
   ↓
Account / Obligation
   ↓
Installments / Due Obligations
   ↓
Collection Payment
   ↓
Payment Allocation
```

If DCM supports multiple business models, `account` can represent the long-lived financial relationship while `obligation` represents an amount that becomes due. A payment is an event of money received and must not itself be treated as the debt.

This vocabulary should be frozen before schema implementation.

---

# 2. Product Principle Gate

The architecture review's central principle is accepted as an architectural constraint:

> **DCM is not a system for chasing debtors. It is a system for managing debt obligations and payment information accurately, audibly, transparently, and conveniently.**

This principle must affect UX as well as database design.

The system should optimize for:

1. understanding what is owed
2. understanding what has been paid
3. understanding what remains
4. recording evidence of payment
5. making correction/reversal safe
6. reducing administrative work
7. providing transparency
8. avoiding unnecessary pressure on customers

A feature that technically works but pushes the product toward coercive collection behavior should be reviewed against this gate.

---

# 3. Important UX Principle — User Convenience Over Enforcement

The product should not force users into a rigid workflow merely because the software designer finds that workflow easier to implement.

The preferred interaction model is:

```text
System prepares information
        ↓
User reads / understands
        ↓
User adjusts or corrects
        ↓
User confirms
        ↓
System saves the accepted state
        ↓
System records traceability where appropriate
```

This is consistent with the broader Dev8Studio BRM principle that AI may interpret and suggest, while the human remains the owner of intended behavior.

For financial operations, the system should therefore distinguish carefully between:

- suggestion
- draft
- confirmation
- committed financial record
- correction/reversal

The system should not silently turn an AI interpretation or automated inference into a financial fact.

---

# 4. BRM Implication for DCM

DCM should become a practical test case for Dev8Studio's Bidirectional Requirement Modeling approach.

For example, instead of beginning with:

```text
Create table collection_payments
```

the requirement should begin at the user level:

```text
I need to record money received from a customer
and know exactly which obligation that payment covers.
```

The system can then progressively model:

```text
User Intent
   ↓
Payment Requirement
   ↓
Workflow
   ↓
Account / Obligation
   ↓
Payment
   ↓
Allocation
   ↓
Audit
   ↓
Implementation
```

This makes DCM an appropriate internal proving ground for BRM rather than merely another CRUD application.

---

# 5. Recommended Implementation Order

Do not start by adding more dashboard features.

Recommended sequence:

### Phase A — Reconcile the contract

1. Freeze canonical domain vocabulary.
2. Freeze actual technology stack.
3. Freeze authentication/application-user boundary.
4. Freeze tenant isolation model.
5. Freeze payment domain separation.

### Phase B — Build the database foundation

1. Better Auth integration contract.
2. tenants.
3. tenant_memberships.
4. application roles/permissions.
5. customers.
6. accounts / obligations.
7. installments.
8. collection_payments.
9. payment_allocations.
10. reversals.
11. audit_logs.
12. subscription/billing tables.

### Phase C — Prove one complete vertical slice

Build exactly one usable journey:

```text
Sign in
  ↓
Select Tenant
  ↓
Open Customer
  ↓
View Account / Obligation
  ↓
Record Payment
  ↓
Allocate Payment
  ↓
Recalculate Balance
  ↓
View Audit Evidence
```

Do not expand horizontally until this path works reliably.

### Phase D — Add operational UX

Only after the financial vertical slice works:

- dashboard
- daily collection
- appointments
- reports
- notifications
- subscription UI
- customer portal

---

# 6. Definition of “DCM Actually Works”

The project should not be considered operational merely because:

- the Vercel deployment loads
- the dashboard renders
- authentication succeeds
- mock/sample data appears

The first meaningful definition of working should be:

> A real authenticated user can enter a tenant, manage a real customer, record a real financial obligation, record a payment against it, see the resulting balance, and later prove what happened through an audit trail.

The complete vertical slice must work without relying on hard-coded demo data.

---

# 7. Review Status

| Area | Status | Assessment |
|---|---|---|
| Product philosophy | 🟢 | Strong and clearly documented |
| BRM concept | 🟢 | Strong foundational concept |
| High-level domain model | 🟢 | Good direction |
| ERD conceptual model | 🟢/🟡 | Strong, but vocabulary should be frozen |
| Technical specification | 🟡 | Contains stale/inconsistent implementation assumptions |
| Authentication foundation | 🟡 | Better Auth exists, domain authorization not yet reconciled |
| Application database schema | 🔴 | Not implemented in migration layer |
| Tenant isolation | 🔴 | Architecture defined, implementation not proven |
| Financial vertical slice | 🔴 | Not yet proven |
| Auditability | 🔴 | Designed conceptually, implementation not yet proven |
| Production readiness | 🔴 | Not ready |

---

# 8. Immediate Next Gate

Before writing substantial new DCM features, perform a **Repository Reality Audit** against this document.

The audit should answer only these questions:

1. Can the application start cleanly?
2. Can a user authenticate?
3. Where is the authenticated user stored?
4. Where is tenant context stored/resolved?
5. What database is actually used in development?
6. What database is actually used in production?
7. Which application tables actually exist?
8. Which API/server functions actually exist?
9. Which screens use real data versus demo/local state?
10. Can one complete customer → obligation → payment → balance flow be executed?
11. Does tenant isolation actually prevent cross-tenant access?
12. Does the deployed Vercel application use the same assumptions as local development?

Only after these answers are known should implementation work be prioritized.

---

## Final Architectural Position

The project should proceed from **reconciliation → foundation → vertical slice → expansion**, not from dashboard → feature accumulation.

The most important thing to preserve is the distinction between:

```text
What we intended
        ≠
What the documentation says
        ≠
What the code currently does
        ≠
What the deployed system actually proves
```

All four must eventually converge.

That convergence is the real MVP gate for DCM.
