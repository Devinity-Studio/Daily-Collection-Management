# Daily Collection Management (DCM)
# Sprint Backlog (Detailed Task Breakdown)

**Version:** 3.0  
**Date:** 3 September 2026  
**อ้างอิงจาก:** DCM_MVP_Roadmap_and_Progress.md + Technical Specification v2.0 + DCM Architecture v2.0  

**วิธีใช้:**  
- อัปเดตสถานะในคอลัมน์ Status ทุกครั้งที่ทำเสร็จ  
- ใช้ใน Sprint Planning / Daily Standup  
- Legend: ⬜ Todo | 🟦 In Progress | ✅ Done | ⚠️ Blocked | 🔄 Review

> **⚠️ Architecture v2.0 Applied** — อัปเดต schema ตาม DCM Architecture v2.0
> อ่านรายละเอียดที่ `docs/DCM Architecture v2.0 — Domain Model & Data Architecture.md`

## Current Implementation Snapshot

| Area | Status | Evidence / Remaining work |
|------|--------|---------------------------|
| Project setup and repository | ✅ Done | React/TanStack/Vite project, scripts, migrations and remote `origin/main` are present |
| Dashboard and reports | 🟦 In Progress | Dashboard, charts and report routes exist; production runtime still needs verification |
| Customers and collections | 🟦 In Progress | Main pages and server operations exist; isolation and validation tests remain |
| Subscription and paywall | 🟦 In Progress | Status/paywall flow exists; full manual payment confirmation is not complete |
| Authentication | ⚠️ Blocked in production | Local code is wired for Better Auth; Vercel currently returns HTTP 500 and requires complete auth env |
| Production release | 🟦 In Progress | Build and migration pass; must redeploy and verify the Vercel Function HTTP 500 is resolved |

> ลำดับงานถัดไปคือแก้ production runtime และยืนยัน auth/database contract ให้ผ่านก่อนเพิ่มฟีเจอร์ใหม่

---

## Sprint 1.5 — P0 Schema Migration (Architecture v2.0)

**Goal:** ใช้ schema changes จาก DCM Architecture v2.0 ก่อนเริ่ม Sprint 5
**Reference:** `docs/DCM Architecture v2.0 — Domain Model & Data Architecture.md`
**Priority:** ⚠️ MUST COMPLETE BEFORE MVP

> **⚠️ สำคัญ:** Sprint นี้ต้องทำก่อน Sprint 5 เท่านั้น
> เพราะ Sprint 5-8 ต้องใช้ schema ใหม่ทั้งหมด

### Database Migration — User & Auth
| ID      | Task                                                         | Priority | Estimate | Status | Owner | Notes |
|---------|--------------------------------------------------------------|----------|----------|--------|-------|-------|
| SM-B01  | Migration: สร้าง `tenant_memberships` table                  | Critical | 2h       | ⬜     |       | Arch §2.3 |
| SM-B02  | Migration: ลบ `users.tenant_id` + เพิ่ม `users.platform_role`| Critical | 2h       | ⬜     |       | Arch §2.2 |
| SM-B03  | Migration: สร้าง `roles` table                               | High     | 1h       | ⬜     |       | Arch §3 |
| SM-B04  | Migration: สร้าง `customer_users` table (schema only)         | Medium   | 1h       | ⬜     |       | Arch §3 |

### Database Migration — Customer Domain
| ID      | Task                                                         | Priority | Estimate | Status | Owner | Notes |
|---------|--------------------------------------------------------------|----------|----------|--------|-------|-------|
| SM-B05  | Migration: อัปเดต `customers` table (เพิ่ม address fields)    | Critical | 1.5h     | ⬜     |       | Arch §2.4 |
| SM-B06  | Migration: สร้าง `documents` table                            | Critical | 1.5h     | ⬜     |       | Arch §2.7 |

### Database Migration — Account/Loan Domain
| ID      | Task                                                         | Priority | Estimate | Status | Owner | Notes |
|---------|--------------------------------------------------------------|----------|----------|--------|-------|-------|
| SM-B07  | Migration: สร้าง `accounts` table (แทน debts)                | Critical | 2h       | ⬜     |       | Arch §2.5 |
| SM-B08  | Migration: สร้าง `installments` table (แทน obligations)      | Critical | 1.5h     | ⬜     |       | Arch §2.6 |

### Database Migration — Appointment Domain
| ID      | Task                                                         | Priority | Estimate | Status | Owner | Notes |
|---------|--------------------------------------------------------------|----------|----------|--------|-------|-------|
| SM-B09  | Migration: สร้าง `appointment_locations` table                | High     | 1h       | ⬜     |       | Arch §2.9 |
| SM-B10  | Migration: สร้าง `appointments` table                         | High     | 1.5h     | ⬜     |       | Arch §2.8 |

### Database Migration — Payment Domain
| ID      | Task                                                         | Priority | Estimate | Status | Owner | Notes |
|---------|--------------------------------------------------------------|----------|----------|--------|-------|-------|
| SM-B11  | Migration: สร้าง `collection_payments` table (แทน payments)   | Critical | 1.5h     | ⬜     |       | Arch §2.10 |
| SM-B12  | Migration: สร้าง `payment_allocations` table                  | Critical | 1h       | ⬜     |       | Arch §2.11 |
| SM-B13  | Migration: สร้าง `reversals` table                            | Critical | 1h       | ⬜     |       | Arch §2.12 |
| SM-B14  | Migration: เพิ่ม `reason` field ใน `audit_logs`               | High     | 0.5h     | ⬜     |       | Arch §2.13 |

### Database Migration — Seed Data
| ID      | Task                                                         | Priority | Estimate | Status | Owner | Notes |
|---------|--------------------------------------------------------------|----------|----------|--------|-------|-------|
| SM-B15  | Seed: สร้าง default roles (TENANT_ADMIN, TENANT_USER)        | High     | 1h       | ⬜     |       |       |
| SM-B16  | Seed: สร้าง default SUPER_ADMIN user                         | High     | 0.5h     | ⬜     |       |       |
| SM-B17  | Seed: สร้าง default plan (Standard 5,000 THB/month)          | Medium   | 0.5h     | ⬜     |       |       |

### Auth & Permission Updates
| ID      | Task                                                         | Priority | Estimate | Status | Owner | Notes |
|---------|--------------------------------------------------------------|----------|----------|--------|-------|-------|
| SM-A01  | Update JWT: encode membershipId + tenantId + role            | Critical | 3h       | ⬜     |       | Arch §2.3 |
| SM-A02  | Update Tenant Guard: resolve จาก membership ไม่ใช่ user     | Critical | 2h       | ⬜     |       | Arch §2.3 |
| SM-A03  | Update Permission Guard: ใช้ membership role                 | Critical | 2h       | ⬜     |       | Arch §7.1 |
| SM-A04  | Block SUPER_ADMIN access: customers/accounts/payments/reports| Critical | 2h       | ⬜     |       | Arch §7.1 |
| SM-A05  | Update Login Response: return memberships list               | High     | 1.5h     | ⬜     |       |       |
| SM-A06  | Create Membership API: invite/remove member                  | High     | 3h       | ⬜     |       |       |

### Financial Record Updates
| ID      | Task                                                         | Priority | Estimate | Status | Owner | Notes |
|---------|--------------------------------------------------------------|----------|----------|--------|-------|-------|
| SM-F01  | Create Reversal API: reverse payment with reason             | Critical | 3h       | ⬜     |       | Arch §2.12 |
| SM-F02  | Create Payment Allocation API: allocate to installments      | Critical | 3h       | ⬜     |       | Arch §2.11 |
| SM-F03  | Create Outstanding Balance query/view                        | Critical | 2h       | ⬜     |       | Arch §6.2 |
| SM-F04  | Block DELETE endpoint: collection_payments                   | Critical | 1h       | ⬜     |       | Arch §2.10 |
| SM-F05  | Update Audit Log: record reason for all financial actions    | High     | 1.5h     | ⬜     |       | Arch §2.13 |
| SM-F06  | Create indexes for new tables                                | High     | 2h       | ⬜     |       | ERD §5 |

### Testing
| ID      | Task                                                         | Priority | Estimate | Status | Owner | Notes |
|---------|--------------------------------------------------------------|----------|----------|--------|-------|-------|
| SM-T01  | Test: User can belong to multiple tenants                     | High     | 2h       | ⬜     |       | Arch §2.3 |
| SM-T02  | Test: SUPER_ADMIN cannot access tenant business data         | Critical | 2h       | ⬜     |       | Arch §7.1 |
| SM-T03  | Test: Outstanding Balance calculation correct                | Critical | 2h       | ⬜     |       | Arch §6.2 |
| SM-T04  | Test: Reversal flow works end-to-end                         | Critical | 2h       | ⬜     |       | Arch §2.12 |
| SM-T05  | Test: Payment allocation updates balance correctly           | Critical | 2h       | ⬜     |       | Arch §2.11 |
| SM-T06  | Test: Tenant Isolation across all new tables                 | Critical | 3h       | ⬜     |       | Arch §8 |

**Definition of Done (Sprint 1.5)**
- [ ] All P0 migrations created and applied
- [ ] JWT encodes membershipId + tenantId + role
- [ ] Tenant Guard resolves from membership
- [ ] SUPER_ADMIN blocked from tenant business data
- [ ] Reversal API works with reason field
- [ ] Outstanding Balance calculation returns correct values
- [ ] All P0 tests pass
- [ ] `npm run build` and `npm run typecheck` pass

---

## Sprint 0 — Project Setup (3–5 วัน)

**Goal:** โครงสร้างโปรเจกต์พร้อมเริ่มพัฒนา

### Backend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S0-B01 | สร้าง Git Repository + .gitignore         | High     | 0.5h     | ⬜     |       |       |
| S0-B02 | Setup NestJS project (TypeScript)         | High     | 1h       | ⬜     |       |       |
| S0-B03 | Setup PostgreSQL + Docker Compose         | High     | 1.5h     | ⬜     |       | App + DB |
| S0-B04 | Setup Prisma + เชื่อมต่อ Database         | High     | 1h       | ⬜     |       |       |
| S0-B05 | สร้าง ConfigModule + Environment Variables| High     | 1h       | ⬜     |       |       |
| S0-B06 | สร้าง Health Check Endpoint (`/health`)   | Medium   | 0.5h     | ⬜     |       |       |
| S0-B07 | ตั้งค่า ESLint + Prettier                 | Medium   | 0.5h     | ⬜     |       |       |
| S0-B08 | สร้าง Folder Structure ตาม Spec           | Medium   | 0.5h     | ⬜     |       |       |

### Frontend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S0-F01 | Setup Next.js (App Router) + TypeScript   | High     | 1h       | ⬜     |       |       |
| S0-F02 | Setup Tailwind CSS + shadcn/ui            | High     | 1.5h     | ⬜     |       | แนะนำ |
| S0-F03 | สร้าง Base Layout (Auth + Dashboard)      | High     | 2h       | ⬜     |       |       |
| S0-F04 | ตั้งค่า Folder Structure                  | Medium   | 0.5h     | ⬜     |       |       |
| S0-F05 | ตั้งค่า ESLint + Prettier                 | Medium   | 0.5h     | ⬜     |       |       |

### DevOps / Common
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S0-D01 | เขียน README.md พื้นฐาน                   | Medium   | 1h       | ⬜     |       |       |
| S0-D02 | ตั้งค่า CI พื้นฐาน (lint + typecheck)     | Low      | 1h       | ⬜     |       | optional |

**Definition of Done (Sprint 0)**
- [ ] `docker-compose up` แล้ว Backend + DB รันได้
- [ ] Frontend รันได้และแสดง Login Page เปล่า ๆ
- [ ] Prisma สามารถ generate และ migrate ได้

---

## Sprint 1 — Authentication & Multi-Tenant Core (2 สัปดาห์)

**Goal:** Login ได้ + แยก Tenant ได้จริง

### Backend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S1-B01 | สร้าง Prisma Schema: tenants, users       | High     | 2h       | ⬜     |       | ตาม Database_ERD |
| S1-B02 | Migration + Seed SUPER_ADMIN              | High     | 1.5h     | ⬜     |       |       |
| S1-B03 | Auth Module: Login (JWT + Refresh)        | High     | 4h       | ⬜     |       |       |
| S1-B04 | Auth Module: Logout + Refresh Token       | High     | 2h       | ⬜     |       |       |
| S1-B05 | Auth Module: GET /auth/me                 | High     | 1h       | ⬜     |       |       |
| S1-B06 | Password Hashing (argon2)                 | High     | 1h       | ⬜     |       |       |
| S1-B07 | JWT Strategy + Auth Guard                 | High     | 2h       | ⬜     |       |       |
| S1-B08 | Role Guard (SUPER_ADMIN / TENANT_*)       | High     | 2h       | ⬜     |       |       |
| S1-B09 | Tenant Guard (extract tenant_id from JWT) | High     | 2h       | ⬜     |       | สำคัญมาก |
| S1-B10 | Seed ตัวอย่าง Tenant + TENANT_ADMIN       | Medium   | 1h       | ⬜     |       |       |
| S1-B11 | Unit Test Auth Service พื้นฐาน            | Medium   | 2h       | ⬜     |       |       |

### Frontend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S1-F01 | Login Page (UI + Form Validation)         | High     | 3h       | ⬜     |       |       |
| S1-F02 | Auth Store / Context (Zustand แนะนำ)      | High     | 2h       | ⬜     |       |       |
| S1-F03 | API Client + Interceptor (Token)          | High     | 2h       | ⬜     |       |       |
| S1-F04 | Protected Routes + Role-based Redirect    | High     | 2h       | ⬜     |       |       |
| S1-F05 | Dashboard Layout + Sidebar ตาม Role       | High     | 3h       | ⬜     |       |       |
| S1-F06 | Logout Functionality                      | Medium   | 1h       | ⬜     |       |       |

**Definition of Done (Sprint 1)**
- [ ] SUPER_ADMIN และ TENANT user Login ได้
- [ ] JWT + Refresh Token ทำงานถูกต้อง
- [ ] Tenant Isolation ทำงาน (query ต้องมี tenant_id)
- [ ] Role-based Navigation แสดงผลถูกต้อง

---

## Sprint 2 — Tenant & User Management (2 สัปดาห์)

**Goal:** SUPER_ADMIN จัดการ Tenant ได้ / TENANT_ADMIN จัดการ User ได้

### Backend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S2-B01 | Tenant Module: CRUD                       | High     | 3h       | ⬜     |       |       |
| S2-B02 | Tenant: Suspend / Activate                | High     | 1.5h     | ⬜     |       |       |
| S2-B03 | Tenant: Pagination + Search + Filter      | High     | 2h       | ⬜     |       |       |
| S2-B04 | User Module: CRUD (ภายใน Tenant)          | High     | 3h       | ⬜     |       |       |
| S2-B05 | User: Disable / Enable                    | High     | 1h       | ⬜     |       |       |
| S2-B06 | User: Pagination + Search                 | Medium   | 1.5h     | ⬜     |       |       |
| S2-B07 | Audit Log พื้นฐาน (Create Tenant/User)    | Medium   | 2h       | ⬜     |       |       |
| S2-B08 | Permission Matrix ตรวจสอบ                 | High     | 1h       | ⬜     |       |       |

### Frontend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S2-F01 | Admin: Tenant List (Search + Filter)      | High     | 3h       | ⬜     |       |       |
| S2-F02 | Admin: Create / Edit Tenant Form          | High     | 3h       | ⬜     |       |       |
| S2-F03 | Admin: Tenant Detail Page (Tabs)          | High     | 3h       | ⬜     |       | Overview, Users... |
| S2-F04 | Admin: Suspend / Activate Button          | Medium   | 1h       | ⬜     |       |       |
| S2-F05 | Tenant: User List                         | High     | 2.5h     | ⬜     |       |       |
| S2-F06 | Tenant: Create / Edit User Form           | High     | 2.5h     | ⬜     |       |       |
| S2-F07 | Tenant: Disable User                      | Medium   | 1h       | ⬜     |       |       |

**Definition of Done (Sprint 2)**
- [ ] SUPER_ADMIN สร้าง Tenant ใหม่ได้
- [ ] TENANT_ADMIN สร้าง / แก้ไข User ได้
- [ ] Tenant Isolation ยังคงทำงานถูกต้อง

---

## Sprint 3 — Subscription & Billing Core (2 สัปดาห์)

**Goal:** ระบบควบคุมสิทธิ์การใช้งานตาม Subscription ได้

### Backend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S3-B01 | Prisma Schema: plans, subscriptions, invoices | High  | 2h       | ⬜     |       |       |
| S3-B02 | Plan Module: CRUD                         | High     | 2h       | ⬜     |       | Seed Standard Plan |
| S3-B03 | Subscription Module: Create + Status      | High     | 3h       | ⬜     |       |       |
| S3-B04 | Subscription: GET current                 | High     | 1.5h     | ⬜     |       |       |
| S3-B05 | Subscription Check Guard / Middleware     | High     | 3h       | ⬜     |       | สำคัญมาก |
| S3-B06 | Invoice Module: Create + List             | High     | 2.5h     | ⬜     |       |       |
| S3-B07 | Daily Cron Job ตรวจสอบ Expiry             | High     | 2h       | ⬜     |       | 00:05 |
| S3-B08 | Expiry Notification Logic (In-App)        | Medium   | 2h       | ⬜     |       | 7/3/1 วัน |

### Frontend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S3-F01 | Tenant: Subscription Status Page          | High     | 3h       | ⬜     |       |       |
| S3-F02 | Admin: Subscription List + Filter         | High     | 3h       | ⬜     |       |       |
| S3-F03 | Admin: Manual Create / Renew Subscription | High     | 2.5h     | ⬜     |       |       |
| S3-F04 | Invoice List (ทั้ง Admin และ Tenant)      | Medium   | 2h       | ⬜     |       |       |
| S3-F05 | Block UI เมื่อ Subscription หมดอายุ       | High     | 2h       | ⬜     |       | Redirect ไป Payment |

**Definition of Done (Sprint 3)**
- [ ] ระบบบล็อก Business Operation เมื่อ EXPIRED
- [ ] อนุญาตเฉพาะหน้า Subscription / Payment เมื่อหมดอายุ
- [ ] Cron Job เปลี่ยนสถานะเป็น EXPIRED ได้

---

## Sprint 4 — Payment Flow (2 สัปดาห์)

**Goal:** ลูกค้าแจ้งชำระ → Admin ยืนยัน → ต่ออายุ Subscription ได้

### Backend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S4-B01 | Prisma Schema: payments                   | High     | 1h       | ⬜     |       |       |
| S4-B02 | Submit Payment (PENDING)                  | High     | 2.5h     | ⬜     |       |       |
| S4-B03 | Confirm Payment (Transaction)             | High     | 4h       | ⬜     |       | Atomic |
| S4-B04 | Reject Payment                            | High     | 1.5h     | ⬜     |       |       |
| S4-B05 | Renewal Logic (ต่อจากวันหมดอายุเดิม)     | High     | 3h       | ⬜     |       | ตกลง Policy |
| S4-B06 | Get Pending Payments (Admin)              | High     | 1.5h     | ⬜     |       |       |
| S4-B07 | Audit Log สำหรับ Payment ทั้งหมด          | High     | 1.5h     | ⬜     |       |       |
| S4-B08 | Unit Test Payment Confirmation Flow       | High     | 2h       | ⬜     |       |       |

### Frontend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S4-F01 | Tenant: Payment Page (ยอด + QR + บัญชี)   | High     | 4h       | ⬜     |       |       |
| S4-F02 | Tenant: Submit Payment Reference Form     | High     | 2h       | ⬜     |       |       |
| S4-F03 | Admin: Pending Payments List              | High     | 2.5h     | ⬜     |       |       |
| S4-F04 | Admin: Confirm / Reject Payment UI        | High     | 2h       | ⬜     |       |       |
| S4-F05 | Payment History (ทั้งสองฝั่ง)             | Medium   | 2h       | ⬜     |       |       |

**Definition of Done (Sprint 4)**
- [ ] Flow ชำระเงิน Manual ครบวงจร
- [ ] หลัง Confirm แล้ว Subscription ต่ออายุและ ACTIVE ทันที
- [ ] Transaction ทำงานถูกต้อง (Rollback ได้ถ้า error)

---

## Sprint 5 — Customer & Account/Loan Management (2 สัปดาห์)

**Goal:** Tenant จัดการลูกค้า เอกสาร และบัญชีสินเชื่อได้
**⚠️ ต้องทำ Sprint 1.5 (P0 Schema Migration) ก่อน**
**Reference:** DCM Architecture v2.0 §2.4-2.7

### Backend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S5-B01 | Customer CRUD (using new schema)          | High     | 3h       | ⬜     |       | Arch §2.4 |
| S5-B02 | Disable Customer (soft delete)            | High     | 1h       | ⬜     |       |       |
| S5-B03 | Document CRUD (upload, list, verify)      | High     | 3h       | ⬜     |       | Arch §2.7 |
| S5-B04 | Account/Loan CRUD                         | High     | 3h       | ⬜     |       | Arch §2.5 |
| S5-B05 | Auto-create Installments on Account create| High     | 2h       | ⬜     |       | Arch §2.6 |
| S5-B06 | Search + Pagination + Filter by Status    | High     | 2h       | ⬜     |       |       |
| S5-B07 | Tenant Isolation Test                     | High     | 1.5h     | ⬜     |       |       |

### Frontend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S5-F01 | Customer List (Search, Filter, Pagination)| High     | 3h       | ⬜     |       |       |
| S5-F02 | Create Customer Form                      | High     | 2h       | ⬜     |       |       |
| S5-F03 | Edit Customer Form                        | High     | 1.5h     | ⬜     |       |       |
| S5-F04 | Customer Detail Page (tabs: Info, Docs, Accounts)| High | 3h    | ⬜     |       |       |
| S5-F05 | Document Upload / List / Verify UI        | High     | 2.5h     | ⬜     |       |       |
| S5-F06 | Account/Loan List + Detail                | High     | 3h       | ⬜     |       |       |
| S5-F07 | Create Account Form (with installment schedule)| High | 3h    | ⬜     |       |       |

**Definition of Done (Sprint 5)**
- [ ] TENANT_ADMIN / TENANT_USER จัดการลูกค้าได้ครบ
- [ ] Document upload/list/verify ทำงานได้
- [ ] Account/Loan CRUD ทำงานได้
- [ ] Installments auto-created when account is created
- [ ] Tenant Isolation ผ่านการทดสอบ

---

## Sprint 6 — Appointments & Collection Payments (2 สัปดาห์)

**Goal:** บันทึกนัดหมายและการรับชำระเงินได้จริง
**⚠️ ต้องทำ Sprint 1.5 + Sprint 5 ก่อน**
**Reference:** DCM Architecture v2.0 §2.8-2.12

### Backend — Appointments
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S6-B01 | Appointment Location CRUD                 | High     | 2h       | ⬜     |       | Arch §2.9 |
| S6-B02 | Appointment CRUD (schedule, assign, outcome)| High    | 3h       | ⬜     |       | Arch §2.8 |
| S6-B03 | Appointment Status Flow (schedule → complete)| High   | 2h       | ⬜     |       |       |

### Backend — Collection Payments
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S6-B04 | Collection Payment CRUD                   | High     | 3h       | ⬜     |       | Arch §2.10 |
| S6-B05 | Payment Allocation to Installments        | High     | 3h       | ⬜     |       | Arch §2.11 |
| S6-B06 | Validation (Amount, Date, Account, Customer)| High   | 1.5h     | ⬜     |       |       |
| S6-B07 | Reversal API (with reason, approval)      | High     | 3h       | ⬜     |       | Arch §2.12 |
| S6-B08 | Audit Log ทุกการเปลี่ยนแปลง              | High     | 1.5h     | ⬜     |       | Arch §2.13 |
| S6-B09 | Filter: Date / Customer / Method / Status | High     | 2h       | ⬜     |       |       |
| S6-B10 | Outstanding Balance auto-update           | High     | 2h       | ⬜     |       | Arch §6.2 |

### Frontend — Appointments
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S6-F01 | Appointment List + Calendar View          | High     | 3.5h     | ⬜     |       |       |
| S6-F02 | Create/Edit Appointment Form              | High     | 3h       | ⬜     |       |       |
| S6-F03 | Appointment Detail + Outcome Recording    | High     | 2h       | ⬜     |       |       |

### Frontend — Collection Payments
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S6-F04 | Payment List + Filters                    | High     | 3.5h     | ⬜     |       |       |
| S6-F05 | Create Payment Form (select account, allocate)| High | 3.5h    | ⬜     |       |       |
| S6-F06 | View Payment Detail                       | High     | 2h       | ⬜     |       |       |
| S6-F07 | Request Reversal (with reason)            | High     | 2h       | ⬜     |       | Arch §2.12 |

**Definition of Done (Sprint 6)**
- [ ] Appointment scheduling and outcome recording works
- [ ] Collection Payment CRUD works
- [ ] Payment Allocation to Installments works correctly
- [ ] Reversal flow works end-to-end
- [ ] Outstanding Balance auto-updates on payment/reversal
- [ ] Audit Log records all actions
- [ ] No DELETE endpoint for collection_payments
- [ ] Tenant Isolation passes for all new tables

---

## Sprint 7 — Dashboard & Reports (2 สัปดาห์)

**Goal:** เห็นยอดสรุปและรายงานได้ทันที

### Backend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S7-B01 | Tenant Dashboard API                      | High     | 3h       | ⬜     |       | Today + Month + Sub |
| S7-B02 | Admin Dashboard API                       | High     | 2.5h     | ⬜     |       | Tenants, Revenue... |
| S7-B03 | Daily Report API                          | High     | 2.5h     | ⬜     |       |       |
| S7-B04 | Monthly Report API                        | High     | 2.5h     | ⬜     |       |       |
| S7-B05 | Optimize Aggregation Queries + Index      | High     | 2h       | ⬜     |       |       |
| S7-B06 | Payment Method + Collector Breakdown      | Medium   | 1.5h     | ⬜     |       |       |

### Frontend
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S7-F01 | Tenant Dashboard (Cards)                  | High     | 3h       | ⬜     |       |       |
| S7-F02 | Admin Dashboard                           | High     | 3h       | ⬜     |       |       |
| S7-F03 | Daily Report Page                         | High     | 2.5h     | ⬜     |       |       |
| S7-F04 | Monthly Report Page                       | High     | 2.5h     | ⬜     |       |       |
| S7-F05 | Charts (optional แต่แนะนำ)                | Medium   | 2h       | ⬜     |       | recharts |

**Definition of Done (Sprint 7)**
- [ ] Dashboard และรายงานหลักใช้งานได้
- [ ] ข้อมูลถูกต้องตาม Filter

---

## Sprint 8 — Testing, Security & Production (2 สัปดาห์)

**Goal:** MVP พร้อมทดลองกับลูกค้าจริง

### Testing
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S8-T01 | Unit Tests (Service Layer สำคัญ)          | High     | 4h       | ⬜     |       |       |
| S8-T02 | API Integration Tests                     | High     | 4h       | ⬜     |       |       |
| S8-T03 | Permission & Tenant Isolation Tests       | High     | 3h       | ⬜     |       | สำคัญมาก |
| S8-T04 | Payment Transaction Tests                 | High     | 2h       | ⬜     |       |       |
| S8-T05 | E2E Flow Tests (Playwright)               | Medium   | 4h       | ⬜     |       |       |

### Security
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S8-S01 | Security Review (OWASP basics)            | High     | 2h       | ⬜     |       |       |
| S8-S02 | Rate Limiting                             | High     | 1.5h     | ⬜     |       |       |
| S8-S03 | Input Validation ครบทุก Endpoint          | High     | 2h       | ⬜     |       |       |
| S8-S04 | CORS + Helmet                             | High     | 1h       | ⬜     |       |       |
| S8-S05 | JWT Expiration & Refresh ตรวจสอบ          | High     | 1h       | ⬜     |       |       |

### Deployment
| ID     | Task                                      | Priority | Estimate | Status | Owner | Notes |
|--------|-------------------------------------------|----------|----------|--------|-------|-------|
| S8-D01 | Production Environment Setup              | High     | 3h       | ⬜     |       |       |
| S8-D02 | Database Backup Strategy                  | High     | 1.5h     | ⬜     |       |       |
| S8-D03 | Monitoring + Error Tracking (Sentry)      | High     | 2h       | ⬜     |       |       |
| S8-D04 | Health Checks + Logging                   | Medium   | 1.5h     | ⬜     |       |       |
| S8-D05 | อัปเดต README + API Docs                  | Medium   | 2h       | ⬜     |       |       |
| S8-D06 | Final Checklist จาก Technical Spec §42    | High     | 2h       | ⬜     |       |       |

**Definition of Done (Sprint 8)**
- [ ] MVP Ready for Production Pilot
- [ ] Checklist Section 42 ครบทุกข้อ
- [ ] สามารถทดลองกับลูกค้าจริงได้

---

## สรุปจำนวน Task โดยประมาณ

| Sprint | Backend Tasks | Frontend Tasks | อื่น ๆ | รวมโดยประมาณ |
|--------|---------------|----------------|--------|--------------|
| 1.5 (P0) | 32           | -              | -      | 32           |
| 0      | 8             | 5              | 2      | 15           |
| 1      | 11            | 6              | -      | 17           |
| 2      | 8             | 7              | -      | 15           |
| 3      | 8             | 5              | -      | 13           |
| 4      | 8             | 5              | -      | 13           |
| 5      | 7             | 7              | -      | 14           |
| 6      | 10            | 7              | -      | 17           |
| 7      | 6             | 5              | -      | 11           |
| 8      | -             | -              | 16     | 16           |
| **รวม**| **98**        | **47**         | **18** | **163**      |

---

## หมายเหตุการใช้งาน

1. **Estimate** เป็นชั่วโมงโดยประมาณสำหรับ 1 คน — ปรับตามทีมจริง
2. ควรทำ **Tenant Isolation Test** ในทุก Sprint ที่เกี่ยวข้องกับข้อมูล
3. **Payment Confirmation** ต้องใช้ Database Transaction เสมอ
4. อัปเดตสถานะในเอกสารนี้ทุกวันหรือทุก Sprint Review
5. หากมี Task ใหม่ที่เกิดขึ้นระหว่าง Sprint ให้เพิ่มในตารางและระบุว่าเป็น Scope Creep
6. **Architecture v2.0** แยก Customer ออกจาก Account/Loan — ไม่ใช่ debts/obligations อีกต่อไป
7. **collection_payments** แทนที่ payments สำหรับข้อมูลการรับชำระ (Tenant domain)
8. **platform_payments** สำหรับ Subscription billing (SUPER_ADMIN domain) — คนละ table กัน

---

*สร้างเมื่อ: 3 September 2026*  
*อัปเดต: 3 September 2026 (Architecture v2.0)*  
*สำหรับทีมพัฒนา Daily Collection Management MVP*
