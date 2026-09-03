# Architecture Review — Align DCM with Product Principles

**Version:** 1.0
**Date:** 3 September 2026
**Status:** Action Required — ทบทวนก่อนเริ่ม Sprint 5
**Based on:** MVP Technical Specification v1.0, MVP & Service Model Specification v1.0

---

## 0. จุดประสงค์ของเอกสารนี้

เอกสารนี้ทบทวน Architecture ของ DCM เทียบกับ Product Principles และหลักการออกแบบระบบการเงินที่ดี พบว่ามีประเด็นสำคัญที่ต้องแก้ไขก่อน MVP ออกสู่ลูกค้าจริง

แบ่งเป็น 2 ระดับ:

- **P0 — MUST FIX BEFORE MVP** → ถ้าไม่แก้ ระบบจะมีปัญหาเชิงโครงสร้างที่แก้ยากในอนาคต
- **P1 — SHOULD FIX** → ควรทำใน MVP ถ้าเวลาพอ ไม่งั้นทำ Sprint ถัดไป

---

## Product Principle — สิ่งที่ทีมต้องเข้าใจตรงกัน

> **DCM ไม่ใช่ระบบที่ช่วยบริษัท "ไล่ล่าลูกหนี้"**
>
> DCM คือระบบที่ช่วยบริษัท **บริหารข้อมูลภาระหนี้และการรับชำระให้ถูกต้อง ตรวจสอบได้ และจัดการง่ายขึ้น**

ความแตกต่างนี้สำคัญมาก เพราะมันกำหนดว่า:

| DCM ไม่ใช่ | DCM คือ |
|------------|---------|
| ระบบติดตาม/ไล่ล่าลูกหนี้ | ระบบบันทึกและบริหารข้อมูลการรับชำระ |
| เน้น "ทวงหนี้" | เน้น "ความถูกต้อง ตรวจสอบได้ จัดการง่าย" |
| ข้อมูลเป็นอาวุธ | ข้อมูลเป็นหลักฐาน |
| สร้างแรงกดดันลูกหนี้ | สร้างความโปร่งใสให้ทุกฝ่าย |

**ผลต่อ Architecture:**

- ต้องออกแบบ Schema ให้รองรับการ audit ทุกรายการ ไม่ใช่แค่บันทึกยอด
- ต้องแยก "ข้อมูลลูกค้า" ออกจาก "สถานะหนี้" อย่างชัดเจน
- ต้องคำนวณ Outstanding Balance ได้จริง ไม่ใช่แค่ดูจาก amount ใน collection
- ต้องห้าม destructive delete ในข้อมูลทางการเงิน — ใช้ reversal แทน

---

# P0 — MUST FIX BEFORE MVP

## 1. User ↔ Tenant ต้องเป็น Many-to-Many ผ่าน Tenant Membership

### ปัญหาปัจจุบัน

Schema ปัจจุบันใน Technical Spec กำหนดให้ `users` table มี `tenant_id` เป็น FK โดยตรง:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID NULL,        -- ← ผูก 1 User กับ 1 Tenant เท่านั้น
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    ...
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

**ปัญหา:** ถ้ามีพนักงานคนหนึ่งทำงานให้ 2 บริษัท (เช่น บริษัทแม่-ลูก หรือ outsource) จะต้องสร้าง 2 accounts แยกกัน ซึ่งไม่สะท้อนความจริง

### สิ่งที่ต้องแก้

สร้าง `tenant_memberships` table เป็น junction table:

```sql
CREATE TABLE tenant_memberships (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,          -- TENANT_ADMIN, TENANT_USER
    status VARCHAR(30) DEFAULT 'ACTIVE', -- ACTIVE, INVITED, SUSPENDED
    invited_by UUID,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (invited_by) REFERENCES users(id),

    UNIQUE(tenant_id, user_id)
);
```

`users` table ต้อง **ลบ `tenant_id` ออก** เหลือแค่:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ผลกระทบต่อระบบ

| หัวข้อ | สิ่งที่ต้องแก้ |
|--------|----------------|
| Auth | JWT ต้อง encode membershipId + tenantId + role จาก membership แทน user.tenant_id |
| Tenant Guard | ต้อง resolve tenantId จาก membershipId ใน JWT ไม่ใช่จาก user record |
| All Queries | เปลี่ยนจาก `WHERE tenant_id = user.tenant_id` เป็น `WHERE tenant_id = user.current_membership.tenant_id` |
| User Management | TENANT_ADMIN ต้อง "invite" user เข้า membership ไม่ใช่ "สร้าง user ใหม่" |

### Definition of Done

- [ ] `tenant_memberships` table สร้างแล้ว
- [ ] `users.tenant_id` ลบออกแล้ว
- [ ] JWT encode membershipId + tenantId + role
- [ ] Tenant Guard resolve จาก membership
- [ ] User can belong to multiple tenants (test case)
- [ ] ทุก query ผ่าน membership ไม่ใช่ user.tenant_id

---

## 2. SUPER_ADMIN ต้องไม่มี Default Access ต่อข้อมูลลูกหนี้/ข้อมูลธุรกิจของ Tenant

### ปัญหาปัจจุบัน

Technical Spec กำหนด Permission Matrix ว่า SUPER_ADMIN มีสิทธิ์ "Yes" ในทุก API:

```
| API               | SUPER_ADMIN | TENANT_ADMIN | TENANT_USER |
| ----------------- | ----------- | ------------ | ----------- |
| Customer          | Yes         | Yes          | View/Create |
| Collection        | Yes         | Yes          | Yes         |
| Reports           | Yes         | Yes          | View        |
```

**ปัญหา:** SUPER_ADMIN เห็นข้อมูลลูกหนี้และข้อมูลธุรกิจของทุก Tenant ซึ่ง:

- ละเมิดความเป็นส่วนตัวของข้อมูลธุรกิจลูกค้า
- สร้างความเสี่ยงด้านข้อมูล ( SUPER_ADMIN คนเดียวเห็นทุกอย่าง)
- ไม่สอดคล้องกับ Product Principle — DCM คือระบบบริหารข้อมูลหนี้ ไม่ใช่ระบบให้ platform owner เข้าถึงข้อมูลหนี้ของลูกค้า

### สิ่งที่ต้องแก้

SUPER_ADMIN มีสิทธิ์:

- ✅ จัดการ Tenant (สร้าง/แก้ไข/ระงับ)
- ✅ จัดการ Subscription & Billing (invoice, payment confirmation)
- ✅ ดู System Dashboard (revenue, tenant count, health)
- ✅ ดู Audit Logs ของ platform (做什么操作)
- ❌ **ห้าม** เข้าถึงข้อมูลลูกหนี้ (customers) ของ Tenant โดยตรง
- ❌ **ห้าม** เข้าถึงข้อมูล Collection ของ Tenant โดยตรง
- ❌ **ห้าม** เข้าถึงข้อมูลธุรกิจ (reports, balances) ของ Tenant โดยตรง

### Permission Matrix ใหม่

| API               | SUPER_ADMIN | TENANT_ADMIN | TENANT_USER |
| ----------------- | ----------- | ------------ | ----------- |
| System Dashboard  | ✅ Yes      | ❌ No        | ❌ No       |
| Tenant Management | ✅ Yes      | ❌ No        | ❌ No       |
| Subscription      | ✅ Yes      | 👁 View      | 👁 View     |
| Payment Confirm   | ✅ Yes      | ❌ No        | ❌ No       |
| User Management   | ✅ Yes (via membership) | ✅ Yes (own tenant) | ⚠️ Limited |
| Customer          | ❌ **No**   | ✅ Yes       | 👁 View/Create |
| Collection        | ❌ **No**   | ✅ Yes       | ✅ Yes      |
| Reports           | ❌ **No**   | ✅ Yes       | 👁 View     |
| Audit Logs        | ✅ Platform only | 👁 Own tenant | ❌ No    |

### กรณีที่ SUPER_ADMIN จำเป็นต้องเข้าถึงข้อมูล Tenant

ถ้ามี case เร่งด่วน (เช่น ร้องเรียนจากลูกค้า) ให้ใช้ **Impersonation Mode** ที่:

- SUPER_ADMIN ต้องเลือก Tenant ที่ต้องการ impersonate
- ทุก action บันทึกใน Audit Log ว่า "SUPER_ADMIN impersonated Tenant X"
- ไม่ได้ให้สิทธิ์ read ตรง ๆ — ต้องผ่าน impersonation flow เท่านั้น

### Definition of Done

- [ ] Permission Matrix อัปเดตแล้ว
- [ ] SUPER_ADMIN API routes สำหรับ customer/collection/reports ถูก block
- [ ] Impersonation flow ออกแบบแล้ว (ถ้าจะทำใน MVP)
- [ ] Audit Log บันทึก impersonation

---

## 3. เพิ่ม Domain สำหรับ Debt / Account / Obligation

### ปัญหาปัจจุบัน

Schema ปัจจุบันมีแค่ `customers` และ `collections`:

```text
customers → collections (amount, date, payment_method)
```

**ปัญหา:** ไม่สามารถคำนวณ Outstanding Balance ได้จริง เพราะ:

- `collections` คือ "รายการรับชำระ" ไม่ใช่ "ภาระหนี้"
- ไม่มี concept ของ "ลูกหนี้เป็นหนี้เท่าไหร่" (Original Debt)
- ไม่มี concept ของ "ลูกหนี้จ่ายไปแล้วเท่าไหร่" (Paid to Date)
- ไม่มี way ที่จะรู้ว่า "ตอนนี้ค้างอยู่เท่าไหร่" (Outstanding Balance)

### สิ่งที่ต้องแก้ — เพิ่ม 3 Domain ใหม่

#### 3.1 Debts (ภาระหนี้)

```sql
CREATE TABLE debts (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    debt_code VARCHAR(100),           -- รหัสหนี้ เช่น "DEBT-2026-001"
    description TEXT,                 -- รายละเอียดหนี้ เช่น "ค่าสินค้าใบสั่งซื้อ #1234"
    original_amount DECIMAL(12,2) NOT NULL,  -- จำนวนเงินต้นหนี้
    currency VARCHAR(3) DEFAULT 'THB',
    debt_date DATE NOT NULL,          -- วันที่เกิดหนี้
    due_date DATE,                    -- วันครบกำหนดชำระ
    status VARCHAR(30) DEFAULT 'ACTIVE',  -- ACTIVE, PARTIAL, PAID, WRITTEN_OFF, DISPUTED
    notes TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 3.2 Payments (การรับชำระ — แทนที่ collections สำหรับ financial data)

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    debt_id UUID,                     -- ผูกกับหนี้ specific ( nullable สำหรับ partial allocation )
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),       -- CASH, BANK_TRANSFER, QR_CODE, OTHER
    reference_number VARCHAR(255),
    received_by UUID,                 -- ใครเป็นคนรับเงิน
    notes TEXT,
    status VARCHAR(30) DEFAULT 'CONFIRMED',  -- PENDING, CONFIRMED, REVERSED
    reversal_of UUID,                 -- ถ้าเป็น reversal ให้ reference รายการเดิม
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (debt_id) REFERENCES debts(id),
    FOREIGN KEY (received_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (reversal_of) REFERENCES payments(id)
);
```

#### 3.3 Obligations (ภาระผูกพัน — สำหรับ complex debt tracking)

```sql
CREATE TABLE obligations (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    debt_id UUID NOT NULL,
    obligation_type VARCHAR(50) NOT NULL,  -- PRINCIPAL, INTEREST, PENALTY, FEE
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE,
    status VARCHAR(30) DEFAULT 'PENDING',  -- PENDING, PARTIAL, PAID, WAIVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (debt_id) REFERENCES debts(id)
);
```

#### 3.4 Payment Allocations (การจัดสรรเงินรับ)

```sql
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    payment_id UUID NOT NULL,
    obligation_id UUID NOT NULL,
    allocated_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (obligation_id) REFERENCES obligations(id)
);
```

### วิธีคำนวณ Outstanding Balance

```sql
-- Outstanding Balance ของลูกหนี้รายหนึ่ง
SELECT
    c.id AS customer_id,
    c.name AS customer_name,
    COALESCE(SUM(d.original_amount), 0) AS total_debt,
    COALESCE(SUM(pa.allocated_amount), 0) AS total_paid,
    COALESCE(SUM(d.original_amount), 0) - COALESCE(SUM(pa.allocated_amount), 0) AS outstanding_balance
FROM customers c
LEFT JOIN debts d ON d.customer_id = c.id AND d.tenant_id = c.tenant_id
LEFT JOIN payment_allocations pa ON pa.obligation_id IN (
    SELECT id FROM obligations WHERE debt_id = d.id
) AND pa.tenant_id = c.tenant_id
WHERE c.tenant_id = :tenant_id
GROUP BY c.id, c.name;
```

### Definition of Done

- [ ] `debts` table สร้างแล้ว
- [ ] `payments` table สร้างแล้ว (แทนที่ or เสริม collections สำหรับ financial data)
- [ ] `obligations` table สร้างแล้ว
- [ ] `payment_allocations` table สร้างแล้ว
- [ ] Outstanding Balance query ทำงานได้จริง
- [ ] Dashboard แสดง outstanding balance per customer

---

## 4. Financial Collection ห้าม Destructive Delete — ใช้ Reversal/Correction + Immutable Audit Trail

### ปัญหาปัจจุบัน

Technical Spec กำหนด:

```text
## Delete Collection
DELETE /api/v1/collections/:id
> แนะนำให้ใช้ Soft Delete ในระบบ Production
```

**ปัญหา:** แม้จะ soft delete แต่:

- ข้อมูล financial record ไม่ควรถูก mark as "deleted" เพราะมันเป็นหลักฐานทางการเงิน
- ไม่มี way ที่จะรู้ว่า "รายการนี้ถูกลบเพราะอะไร"
- ไม่สามารถ reverse effect ของการ delete ได้

### สิ่งที่ต้องแก้ — Immutable Financial Records

#### หลักการ

1. **ห้าม DELETE** รายการทางการเงินใด ๆ ไม่ว่าจะ soft หรือ hard
2. **ใช้ Reversal** เมื่อต้องการ "ยกเลิกรายการ" — สร้างรายการใหม่ที่มี amount เป็นค่าลบ (หรือ status = REVERSED)
3. **ใช้ Correction** เมื่อต้องการ "แก้ไขรายการ" — สร้าง correction entry ที่ reference รายการเดิม
4. **ทุก action บันทึกใน Audit Log** พร้อม old_data, new_data, reason

#### ตาราง Reversals

```sql
CREATE TABLE reversals (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    original_payment_id UUID NOT NULL,
    reversed_by UUID NOT NULL,           -- user ที่ทำการ reversal
    reason TEXT NOT NULL,                -- เหตุผลที่ต้อง reversal (บังคับ)
    reversal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'APPROVED',  -- PENDING, APPROVED, REJECTED
    approved_by UUID,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (original_payment_id) REFERENCES payments(id),
    FOREIGN KEY (reversed_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

#### Audit Log — ขยายให้ครอบคลุม

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100),
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    reason TEXT,                         -- เพิ่ม reason field
    ip_address VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Action types ที่ต้องบันทึก:**

```text
CREATE_DEBT
UPDATE_DEBT
CREATE_PAYMENT
REVERSE_PAYMENT
CORRECT_PAYMENT
CREATE_ALLOCATION
UPDATE_CUSTOMER
UPDATE_DEBT_STATUS
SUPER_ADMIN_IMPERSONATE  -- ถ้ามี impersonation
```

#### Flow เมื่อต้อง "แก้ไข" รายการรับชำระ

```text
ต้องการแก้ไขรายการ Payment #1234
    │
    ▼
สร้าง Reversal Entry
    │  - original_payment_id = 1234
    │  - reason = "ลูกค้าจ่ายผิดยอด จำนวนจริงคือ 1,500 ไม่ใช่ 1,000"
    │  - reversed_by = current_user
    │
    ▼
Payment #1234 status เปลี่ยนเป็น REVERSED
    │
    ▼
สร้าง Payment ใหม่ (corrected)
    │  - reversal_of = 1234
    │  - amount = 1,500
    │
    ▼
Audit Log บันทึกทั้ง 2 รายการ
    │  - REVERSE_PAYMENT (old: amount=1000, new: status=REVERSED)
    │  - CREATE_PAYMENT (new: amount=1500, reversal_of=1234)
    │
    ▼
Recalculate Outstanding Balance
```

### Definition of Done

- [ ] `reversals` table สร้างแล้ว
- [ ] DELETE endpoint สำหรับ payments/collections ถูก **ลบออก** หรือ **block** ทั้งหมด
- [ ] Reversal API สร้างแล้ว (ต้องมี reason field บังคับ)
- [ ] Correction API สร้างแล้ว
- [ ] Audit Log บันทึกครบทุก financial action
- [ ] Outstanding Balance คำนวณหลัง reversal ได้ถูกต้อง

---

# P1 — SHOULD FIX

## 5. แยก Customer Status ออกจาก Debt/Account Status

### ปัญหาปัจจุบัน

`customers` table มี `status` field เดียว:

```sql
status VARCHAR(30) DEFAULT 'ACTIVE'  -- ACTIVE, INACTIVE, DISABLED
```

**ปัญหา:** สถานะ "ลูกค้า" (active/inactive) กับ สถานะ "หนี้" (current/overdue/paid) เป็นคนละ concept

### สิ่งที่ต้องแก้

**Customer Status** (สถานะความสัมพันธ์กับบริษัท):

```text
ACTIVE        — ยังเป็นลูกค้าอยู่
INACTIVE      — ไม่ได้ทำธุรกิจร่วมกันชั่วคราว
BLACKLISTED   — ยกเลิกความสัมพันธ์ทางธุรกิจ
```

**Debt Status** (สถานะหนี้แต่ละรายการ):

```text
ACTIVE        — ยังค้างชำระ
PARTIAL       — จ่ายบางส่วน
PAID          — จ่ายครบแล้ว
OVERDUE       — เลยกำหนดชำระ
DISPUTED      — มีข้อพิพาท
WRITTEN_OFF   — ตัดหนี้
```

**Account Summary Status** (ภาพรวมของลูกหนี้รายนี้):

```text
CURRENT       — ไม่มีหนี้ค้าง
DELINQUENT    — มีหนี้ค้าง (เฉพาะ overdue debts)
INACTIVE      — ไม่มีหนี้ active เลย
```

### Definition of Done

- [ ] `customers.status` ใช้แค่ ACTIVE/INACTIVE/BLACKLISTED
- [ ] `debts.status` ใช้ ACTIVE/PARTIAL/PAID/OVERDUE/DISPUTED/WRITTEN_OFF
- [ ] Dashboard แสดง customer account summary status ที่ derived จาก debts

---

## 6. Permission ต้องผูกกับ Membership ไม่ใช่ User โดยตรง

### ปัญหาปัจจุบัน

Schema ปัจจุบันผูก role กับ user โดยตรง:

```sql
CREATE TABLE users (
    ...
    role VARCHAR(50) NOT NULL,  -- SUPER_ADMIN, TENANT_ADMIN, TENANT_USER
    ...
);
```

**ปัญหา:** ถ้า user เป็น TENANT_ADMIN ใน Tenant A แต่ TENANT_USER ใน Tenant B ไม่สามารถ support ได้

### สิ่งที่ต้องแก้

Role ต้องอยู่ใน `tenant_memberships` (ตาม P0 #1):

```sql
CREATE TABLE tenant_memberships (
    ...
    role VARCHAR(50) NOT NULL,  -- TENANT_ADMIN, TENANT_USER
    ...
);
```

**users table ควรมีแค่ platform-level role:**

```sql
CREATE TABLE users (
    ...
    platform_role VARCHAR(50) DEFAULT 'USER',  -- USER, SUPER_ADMIN
    ...
);
```

### Definition of Done

- [ ] Role อยู่ใน `tenant_memberships` ไม่ใช่ `users`
- [ ] `users.platform_role` สำหรับ SUPER_ADMIN เท่านั้น
- [ ] Permission check ใช้ membership role ไม่ใช่ user role

---

## 7. รองรับ Customer Portal ใน Architecture แม้ยังไม่ต้องทำทั้งหมดใน MVP

### ปัญหาปัจจุบัน

Architecture ปัจจุบันไม่มี concept ของ "ลูกหนี้เข้ามาดูข้อมูลเอง"

### สิ่งที่ต้องแก้ — เตรียม Architecture ไว้

**Customer Portal คืออะไร:**

ลูกหนี้ของ Tenant สามารถ login เข้ามาดู:

- หนี้ที่ค้างอยู่ (Outstanding Balance)
- ประวัติการชำระ
- หลักฐานการชำระ (receipt)
- ติดต่อบริษัท (ถ้ามีข้อพิพาท)

**สิ่งที่ต้องเตรียมใน MVP:**

1. **เพิ่ม `customer_users` table** — ผู้ใช้งานฝั่งลูกหนี้:

```sql
CREATE TABLE customer_users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255),
    status VARCHAR(30) DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

2. **เพิ่ม `roles` concept** — ไม่ hardcode role เป็น string:

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    tenant_id UUID,              -- NULL = platform role
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL,  -- ["customers.read", "payments.create", ...]
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

3. **Separate auth flow** สำหรับ customer portal — ไม่ใช่ auth ชุดเดียวกับ platform user

### Definition of Done

- [ ] `customer_users` table สร้างแล้ว (schema only ไม่ต้อง implement flow)
- [ ] `roles` table สร้างแล้ว พร้อม default roles
- [ ] Auth flow สำหรับ customer portal ออกแบบแล้ว (ไม่ต้อง implement)
- [ ] API แยก prefix เช่น `/api/v1/customer-portal/...`

---

# Appendix A — แผนภาพ Architecture ใหม่

```text
                         USERS
                           │
                     ┌─────┴─────┐
                     │           │
                Platform      Customer
                  User          User
                     │           │
            ┌────────┴──┐   ┌───┴───────┐
            │ membership │   │ customer  │
            │   (role)   │   │  _users   │
            └─────┬──────┘   └─────┬─────┘
                  │                │
                  ▼                ▼
            ┌──────────┐    ┌──────────┐
            │  TENANTS │    │          │
            └────┬─────┘    │          │
                 │          │          │
      ┌──────────┼──────────┼────┐     │
      │          │          │    │     │
      ▼          ▼          ▼    ▼     │
  CUSTOMERS   DEBTS    OBLIGATIONS    │
      │          │          │         │
      │          ▼          │         │
      │     PAYMENTS ◄──────┘         │
      │          │                    │
      │          ▼                    │
      │   PAYMENT_ALLOCATIONS         │
      │          │                    │
      │          ▼                    │
      │     REVERSALS                 │
      │          │                    │
      └──────────┼────────────────────┘
                 │
                 ▼
          ┌──────────────┐
          │  AUDIT_LOGS  │
          └──────────────┘
```

---

# Appendix B — แผนภาพ Debt Lifecycle

```text
New Debt Created
    │
    ▼
ACTIVE ──────────────────────────────────────┐
    │                                         │
    ├── Payment Received ──► PARTIAL         │
    │   │                                    │
    │   ├── More Payment ──► PAID            │
    │   │                                    │
    │   └── Reversal ──────► ACTIVE (back)   │
    │                                         │
    ├── Overdue ──────────► OVERDUE          │
    │   │                                    │
    │   ├── Late Payment ──► PAID / PARTIAL  │
    │   │                                    │
    │   └── Write Off ────► WRITTEN_OFF      │
    │                                         │
    ├── Dispute ──────────► DISPUTED         │
    │   │                                    │
    │   ├── Resolved ─────► ACTIVE / PAID    │
    │   │                                    │
    │   └── Write Off ────► WRITTEN_OFF      │
    │                                         │
    └── Write Off ────────► WRITTEN_OFF ◄────┘
```

---

# Appendix C — Checklist ก่อนเริ่ม Sprint 5

- [ ] ทีมได้อ่านเอกสารนี้และ agree กับ P0 ทั้ง 4 ข้อ
- [ ] Database migration สำหรับ P0 #1 ( memberships ) สร้างแล้ว
- [ ] Permission Matrix ใหม่ได้รับการ approve แล้ว
- [ ] Schema สำหรับ debts / obligations / payment_allocations ได้รับการ review แล้ว
- [ ] Reversal flow ได้รับการออกแบบแล้ว
- [ ] Product Principle ("DCM ไม่ใช่ระบบไล่ล่าหนี้")  communicate กับทีมแล้ว

---

*สร้างเมื่อ: 3 September 2026*
*สำหรับทีมพัฒนา Daily Collection Management MVP*
*เอกสารนี้เป็น action item — ไม่ใช่ just a review*
