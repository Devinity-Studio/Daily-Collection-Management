# Daily Collection Management (DCM)
# MVP Development Roadmap & Progress Tracker

**Version:** 1.0  
**Date:** 2 September 2026  
**Status:** Ready for Development  
**Based on:**  
- MVP & Service Model Specification v1.0  
- MVP Technical Specification v1.0  

---

## 1. ภาพรวมโครงการ (Project Overview)

**ชื่อโครงการ:** Daily Collection Management (DCM)  
**รูปแบบ:** Multi-Tenant SaaS  
**โมเดลธุรกิจ:** Monthly Subscription (เริ่มต้น 5,000 บาท/เดือน)  
**เป้าหมาย MVP:**  
สามารถให้บริการลูกค้าหลายรายได้จริง โดยมีระบบ Subscription + Manual Payment Confirmation + Daily Collection ครบวงจร

### Core Pillars ของ MVP
1. **Multi-Tenant Architecture** + Tenant Isolation
2. **Subscription & Billing Management**
3. **Daily Collection Management**

### Technology Stack (ยืนยันแล้ว)
| Layer       | Technology              |
|-------------|-------------------------|
| Frontend    | Next.js + TypeScript + Tailwind CSS |
| Backend     | NestJS + TypeScript     |
| Database    | PostgreSQL              |
| ORM         | Prisma                  |
| Auth        | JWT + Refresh Token + bcrypt/argon2 |
| Infra (MVP) | Docker + VPS/Cloud + Vercel (Frontend) |

---

## 2. High-Level Roadmap (ภาพรวมระยะเวลา)

| Phase          | Sprint(s)     | ระยะเวลาโดยประมาณ | เป้าหมายหลัก                                      | สถานะ     |
|----------------|---------------|-------------------|---------------------------------------------------|-----------|
| **Setup**      | Sprint 0      | 1 สัปดาห์         | Project Skeleton + Environment                    | ⬜ Not Started |
| **Foundation** | Sprint 1-2    | 4 สัปดาห์         | Auth + Multi-Tenant + User/Tenant Management      | ⬜ Not Started |
| **Billing**    | Sprint 3-4    | 4 สัปดาห์         | Subscription + Invoice + Payment Confirmation     | ⬜ Not Started |
| **Core Business** | Sprint 5-6 | 4 สัปดาห์         | Customer + Daily Collection                       | ⬜ Not Started |
| **Insight**    | Sprint 7      | 2 สัปดาห์         | Dashboard + Reports                               | ⬜ Not Started |
| **Release**    | Sprint 8      | 2 สัปดาห์         | Testing + Security + Production Deploy            | ⬜ Not Started |

**รวมระยะเวลาโดยประมาณ:** 15 – 17 สัปดาห์  
**เป้าหมาย Launch Pilot:** สามารถทดลองกับลูกค้าจริงได้หลัง Sprint 8

---

## 3. Detailed Sprint Roadmap

### Sprint 0 — Project Setup (3–5 วัน)
**เป้าหมาย:** โครงสร้างโปรเจกต์พร้อมเริ่มพัฒนา

**Backend**
- [ ] สร้าง Repository + Monorepo หรือ Separate repos
- [ ] Setup NestJS + TypeScript
- [ ] Setup PostgreSQL + Prisma
- [ ] Environment Config (.env, ConfigModule)
- [ ] Docker Compose (App + DB)
- [ ] Basic Health Check Endpoint
- [ ] CI/CD พื้นฐาน (optional)

**Frontend**
- [ ] Setup Next.js (App Router) + TypeScript
- [ ] Setup Tailwind CSS + shadcn/ui (แนะนำ)
- [ ] Base Layout (Auth Layout + Dashboard Layout)
- [ ] Folder Structure ตาม Technical Spec

**Deliverable**
- Project Skeleton ที่รันได้ทั้ง Frontend และ Backend
- Database Migration เริ่มต้น (tenants, users)

**Definition of Done**
- `docker-compose up` แล้วระบบรันได้
- Login page แสดงผลได้ (ยังไม่ต้องทำงาน)

---

### Sprint 1 — Authentication & Multi-Tenant Core (2 สัปดาห์)
**เป้าหมาย:** Login ได้ + แยก Tenant ได้จริง

**Backend**
- [ ] Schema: `tenants`, `users`
- [ ] Auth Module (Login, Logout, Refresh Token, Me)
- [ ] JWT Strategy + Guards
- [ ] Role-based Guard (SUPER_ADMIN, TENANT_ADMIN, TENANT_USER)
- [ ] Tenant Guard (ดึง tenant_id จาก JWT)
- [ ] Password Hashing (argon2 แนะนำ)
- [ ] Seed Data (SUPER_ADMIN + ตัวอย่าง Tenant)

**Frontend**
- [ ] Login Page
- [ ] Protected Routes
- [ ] Auth Context / Zustand Store
- [ ] Role-based Navigation
- [ ] Redirect ตาม Role หลัง Login

**Deliverable**
- SUPER_ADMIN และ TENANT user Login ได้
- Tenant Isolation ทำงาน (query ต้องมี tenant_id)

---

### Sprint 2 — Tenant & User Management (2 สัปดาห์)
**เป้าหมาย:** SUPER_ADMIN จัดการ Tenant ได้ / TENANT_ADMIN จัดการ User ได้

**Backend**
- [ ] Tenant CRUD + Suspend / Activate
- [ ] User CRUD (ภายใน Tenant)
- [ ] Pagination + Search + Filter
- [ ] Audit Log พื้นฐาน (Login, Create Tenant, Create User)

**Frontend**
- **Admin**
  - [ ] Tenant List + Filter + Search
  - [ ] Create / Edit Tenant
  - [ ] Tenant Detail (Tabs: Overview, Users, Subscription...)
- **Tenant**
  - [ ] User List
  - [ ] Create / Edit / Disable User

**Deliverable**
- SUPER_ADMIN สร้าง Tenant ใหม่ได้
- TENANT_ADMIN สร้าง User ภายในองค์กรได้

---

### Sprint 3 — Subscription & Billing Core (2 สัปดาห์)
**เป้าหมาย:** ระบบควบคุมสิทธิ์การใช้งานตาม Subscription ได้

**Backend**
- [ ] Schema: `plans`, `subscriptions`, `invoices`
- [ ] Plan Management
- [ ] Subscription CRUD + Status Management
- [ ] Subscription Check Middleware / Guard
- [ ] Daily Cron Job ตรวจสอบ Expiry
- [ ] Invoice Generation (Manual / Auto เมื่อสร้าง Subscription)

**Frontend**
- [ ] Subscription Page (Tenant เห็นสถานะปัจจุบัน)
- [ ] Admin Subscription Management
- [ ] Invoice List

**Deliverable**
- ระบบบล็อกการใช้งานเมื่อ Subscription = EXPIRED
- อนุญาตเฉพาะหน้า Payment / Subscription เมื่อหมดอายุ

---

### Sprint 4 — Payment Flow (2 สัปดาห์)
**เป้าหมาย:** ลูกค้าแจ้งชำระ → Admin ยืนยัน → ต่ออายุ Subscription ได้

**Backend**
- [ ] Schema: `payments`
- [ ] Submit Payment (PENDING)
- [ ] Confirm Payment (Transaction: Payment → Invoice → Subscription + Audit)
- [ ] Reject Payment
- [ ] Renewal Logic (ต่อจากวันหมดอายุเดิม หรือเริ่มใหม่ตาม Policy)
- [ ] Audit Log ครบสำหรับ Payment

**Frontend**
- **Tenant**
  - [ ] Billing / Payment Page (แสดงยอด + QR Code + บัญชีธนาคาร)
  - [ ] Submit Payment Reference
- **Admin**
  - [ ] Pending Payments List
  - [ ] Confirm / Reject Payment
  - [ ] Payment History

**Deliverable**
- Flow ชำระเงิน Manual ครบวงจร
- หลัง Confirm แล้ว Subscription ต่ออายุและ ACTIVE ทันที

---

### Sprint 5 — Customer Management (2 สัปดาห์)
**เป้าหมาย:** Tenant จัดการลูกค้าของตัวเองได้

**Backend**
- [ ] Schema: `customers`
- [ ] Customer CRUD + Soft Delete / Disable
- [ ] Search + Pagination + Filter by Status
- [ ] Tenant Isolation เข้มงวด

**Frontend**
- [ ] Customer List (Search, Filter, Pagination)
- [ ] Create / Edit Customer
- [ ] Customer Detail + Collection History (เตรียมไว้)

**Deliverable**
- TENANT_ADMIN / TENANT_USER จัดการลูกค้าได้ครบ

---

### Sprint 6 — Daily Collection (2 สัปดาห์)
**เป้าหมาย:** บันทึกยอดเก็บเงินรายวันได้จริง

**Backend**
- [ ] Schema: `collections`
- [ ] Collection CRUD
- [ ] Validation (Amount > 0, Date, Customer ต้องเป็นของ Tenant)
- [ ] Soft Delete แนะนำ
- [ ] Audit Log ทุกการเปลี่ยนแปลง

**Frontend**
- [ ] Collection List (Date / Customer / Collector / Method Filter)
- [ ] Create Collection Form
- [ ] Edit / View / Delete Collection
- [ ] Quick Add จาก Dashboard (optional)

**Deliverable**
- สามารถบันทึกยอดเก็บเงินรายวันได้ครบตาม Business Requirement

---

### Sprint 7 — Dashboard & Reports (2 สัปดาห์)
**เป้าหมาย:** เห็นยอดสรุปและรายงานได้ทันที

**Backend**
- [ ] Tenant Dashboard API (Today + Month + Subscription Status)
- [ ] Admin Dashboard API (Tenants, Revenue, Pending Payments)
- [ ] Daily Report API
- [ ] Monthly Report API
- [ ] Aggregation Queries ที่ Optimize (ใช้ Index)

**Frontend**
- [ ] Tenant Dashboard (Cards: ยอดวันนี้, ยอดเดือนนี้, Subscription)
- [ ] Admin Dashboard
- [ ] Daily Report Page
- [ ] Monthly Report Page
- [ ] Payment Method Breakdown + Collector Breakdown

**Deliverable**
- Dashboard และรายงานหลักใช้งานได้

---

### Sprint 8 — Testing, Security & Production (2 สัปดาห์)
**เป้าหมาย:** MVP พร้อมทดลองกับลูกค้าจริง

**Testing**
- [ ] Unit Tests (Service Layer สำคัญ)
- [ ] API Integration Tests
- [ ] Permission & Tenant Isolation Tests
- [ ] Payment Transaction Tests
- [ ] E2E Flow Tests (Playwright / Cypress)

**Security**
- [ ] Security Review (OWASP basics)
- [ ] Rate Limiting
- [ ] Input Validation ครบ
- [ ] CORS + Helmet
- [ ] JWT Expiration & Refresh ถูกต้อง

**Deployment**
- [ ] Production Environment
- [ ] Database Backup Strategy
- [ ] Monitoring + Error Tracking (Sentry แนะนำ)
- [ ] Health Checks
- [ ] Documentation (README + API Docs)

**Deliverable**
- MVP Ready for Production Pilot
- Checklist จาก Technical Spec Section 42 ครบทุกข้อ

---

## 4. Progress Tracker (สำหรับติดตามร่วมกัน)

ใช้ตารางนี้ในการอัปเดตสถานะทุก Sprint Review

### Overall Progress

| Sprint | Feature Group                  | Status          | Progress | Owner     | Notes |
|--------|--------------------------------|-----------------|----------|-----------|-------|
| 0      | Project Setup                  | ⬜ Not Started  | 0%       | -         |       |
| 1      | Authentication & Multi-Tenant  | ⬜ Not Started  | 0%       | -         |       |
| 2      | Tenant & User Management       | ⬜ Not Started  | 0%       | -         |       |
| 3      | Subscription & Billing         | ⬜ Not Started  | 0%       | -         |       |
| 4      | Payment Flow                   | ⬜ Not Started  | 0%       | -         |       |
| 5      | Customer Management            | ⬜ Not Started  | 0%       | -         |       |
| 6      | Daily Collection               | ⬜ Not Started  | 0%       | -         |       |
| 7      | Dashboard & Reports            | ⬜ Not Started  | 0%       | -         |       |
| 8      | Testing & Production           | ⬜ Not Started  | 0%       | -         |       |

**Legend**
- ⬜ Not Started
- 🟦 In Progress
- ✅ Completed
- ⚠️ Blocked
- 🔄 In Review

### Key Milestones

| Milestone                              | Target Date       | Status     | Actual Date |
|----------------------------------------|-------------------|------------|-------------|
| Project Skeleton Ready                 | End of Sprint 0   | ⬜         | -           |
| Login + Tenant Isolation Working       | End of Sprint 1   | ⬜         | -           |
| SUPER_ADMIN สามารถสร้าง Tenant ได้     | End of Sprint 2   | ⬜         | -           |
| Subscription Enforcement Working       | End of Sprint 3   | ⬜         | -           |
| Payment Confirmation + Renewal Working | End of Sprint 4   | ⬜         | -           |
| Daily Collection ใช้งานได้             | End of Sprint 6   | ⬜         | -           |
| Dashboard & Reports Complete           | End of Sprint 7   | ⬜         | -           |
| MVP Ready for Pilot                    | End of Sprint 8   | ⬜         | -           |

---

## 5. Critical Path & Dependencies

```
Sprint 0 (Setup)
    ↓
Sprint 1 (Auth + Tenant Core)  ← สำคัญที่สุด ต้องแข็งแรง
    ↓
Sprint 2 (Tenant/User Mgmt)
    ↓
Sprint 3 (Subscription)  ← ขึ้นกับ Sprint 1-2
    ↓
Sprint 4 (Payment)       ← ขึ้นกับ Sprint 3
    ↓
Sprint 5 (Customers)     ← สามารถทำคู่ขนานกับ Sprint 3-4 ได้บางส่วน
    ↓
Sprint 6 (Collection)    ← ขึ้นกับ Sprint 5
    ↓
Sprint 7 (Reports)       ← ขึ้นกับ Sprint 6
    ↓
Sprint 8 (Release)
```

**ข้อควรระวัง**
- Tenant Isolation ต้องถูกต้องตั้งแต่ Sprint 1 มิฉะนั้นจะแก้ยากภายหลัง
- Payment Confirmation ต้องใช้ Database Transaction เสมอ
- Subscription Renewal Logic ต้องตกลง Policy ให้ชัดเจนก่อน Sprint 4

---

## 6. Recommended Working Agreements (สำหรับพัฒนาร่วมกัน)

1. **Branch Strategy**
   - `main` → Production
   - `develop` → Integration
   - Feature branches: `feature/sprint-X-feature-name`

2. **Pull Request Rules**
   - ต้องมีอย่างน้อย 1 Reviewer
   - ต้องผ่าน CI (lint + test)
   - ต้องอัปเดต Progress Tracker ในเอกสารนี้

3. **Daily Standup (แนะนำ)**
   - ทำอะไรไปเมื่อวาน
   - จะทำอะไรวันนี้
   - มี Blocker อะไรไหม

4. **Definition of Done (DoD) ร่วม**
   - Code ผ่าน Lint + Type Check
   - มี Unit/Integration Test สำหรับ Logic สำคัญ
   - Tenant Isolation ถูกทดสอบ
   - มี Audit Log (กรณีที่ต้องการ)
   - Frontend ตรงตาม Screen Spec พื้นฐาน
   - อัปเดต Progress Tracker

5. **Communication**
   - ใช้เอกสารนี้เป็น Single Source of Truth สำหรับ Progress
   - Decision สำคัญให้บันทึกในส่วน Decision Log ด้านล่าง

---

## 7. Decision Log

| Date       | Decision                                      | Made By     | Notes |
|------------|-----------------------------------------------|-------------|-------|
| 2026-09-02 | ใช้ NestJS + Prisma + PostgreSQL              | Spec        | -     |
| 2026-09-02 | Manual Payment Confirmation สำหรับ MVP        | Spec        | -     |
| 2026-09-02 | Subscription ต่อจากวันหมดอายุเดิม (Policy)    | Spec        | ต้องยืนยันอีกครั้งใน Sprint 3-4 |
|            |                                               |             |       |

---

## 8. Risk Register (เบื้องต้น)

| Risk                                      | Impact | Probability | Mitigation                                      |
|-------------------------------------------|--------|-------------|-------------------------------------------------|
| Tenant Isolation รั่ว                     | High   | Medium      | เขียน Test ครอบคลุม + Code Review เข้มงวด      |
| Payment Transaction ไม่ Atomic            | High   | Low         | บังคับใช้ Prisma Transaction เสมอ               |
| Scope Creep (อยากเพิ่ม Feature)           | Medium | High        | ยึด MVP Scope จากเอกสาร Section 17-18 อย่างเคร่งครัด |
| Subscription Date Calculation ผิด         | Medium | Medium      | เขียน Unit Test ครอบคลุมทุก Policy              |
| Performance ของ Report เมื่อข้อมูลเยอะ    | Medium | Medium      | สร้าง Index ตาม Spec + ใช้ Aggregation ดี       |

---

## 9. Next Immediate Actions (เริ่มวันนี้)

1. [ ] ยืนยัน Technology Stack และ Team Capacity
2. [ ] สร้าง Repository + ตั้งค่า Access
3. [ ] เริ่ม Sprint 0 (Project Setup)
4. [ ] ตกลง Working Agreement และ Meeting Cadence
5. [ ] แต่งตั้ง Product Owner / Tech Lead สำหรับโปรเจกต์นี้

---

## 10. เอกสารอ้างอิง

- `MVP & Service Model Specification.md`
- `MVP Technical Specification.md`

**เอกสารที่แนะนำให้ทำต่อ (ตาม Technical Spec)**
1. Database_ERD.md
2. API_Specification_OpenAPI.yaml
3. UI_UX_Screen_Specification.md
4. Business_Rules.md
5. User_Acceptance_Test.md
6. Deployment_Architecture.md
7. Sprint_Backlog.md (ละเอียดกว่านี้)
8. README.md

---

**หมายเหตุ:**  
เอกสารนี้เป็น Living Document  
ให้ทีมอัปเดตสถานะ Progress Tracker ทุกครั้งที่มีการเปลี่ยนแปลงสำคัญ  
และใช้เป็นหลักในการวางแผน Sprint Planning / Review

---

*สร้างเมื่อ: 2 September 2026*  
*สำหรับทีมพัฒนา Daily Collection Management MVP*
