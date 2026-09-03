# Daily Collection Management

# MVP Technical Specification

**Version:** 1.0
**Status:** MVP Development Specification
**Date:** 2 September 2026
**Project:** Daily Collection Management (DCM)

---

# 1. Technical Overview

## 1.1 วัตถุประสงค์

เอกสารฉบับนี้กำหนดรายละเอียดทางเทคนิคสำหรับการพัฒนา MVP ของระบบ Daily Collection Management (DCM)

ระบบถูกออกแบบเป็น:

* Web Application
* Multi-Tenant SaaS
* Subscription-based
* รองรับลูกค้าหลายองค์กร
* มีระบบจัดการสิทธิ์การใช้งานรายเดือน
* มีระบบบันทึก Daily Collection
* มี Dashboard และ Reports

---

# 2. High-Level Architecture

```text
                        ┌─────────────────────┐
                        │      Users          │
                        │ Admin / Customer    │
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │    Frontend Web     │
                        │ React / Next.js     │
                        └──────────┬──────────┘
                                   │ HTTPS
                                   ▼
                        ┌─────────────────────┐
                        │      REST API       │
                        │ Backend Application │
                        └──────────┬──────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
       Authentication         Subscription         Collection
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │      Database       │
                        │ PostgreSQL/MySQL    │
                        └─────────────────────┘
```

---

# 3. Recommended Technology Stack

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
```

## Backend

เลือกได้ 1 แนวทาง:

### Option A

```text
Node.js
NestJS
TypeScript
```

### Option B

```text
Node.js
Express.js
TypeScript
```

สำหรับระบบที่ต้องขยายในอนาคต แนะนำ:

> **NestJS + TypeScript**

---

## Database

```text
PostgreSQL
```

เหตุผล:

* รองรับ Relational Data
* Transaction แข็งแรง
* เหมาะกับระบบการเงิน
* รองรับ JSON
* Scale ได้ดี

---

## ORM

แนะนำ:

```text
Prisma ORM
```

---

## Authentication

```text
JWT
Refresh Token
bcrypt / argon2
```

---

## Infrastructure (MVP)

```text
Frontend
   │
   ├── Vercel
   │
Backend
   │
   ├── Docker
   ├── VPS / Cloud
   │
Database
   │
   └── PostgreSQL
```

---

# 4. System Roles

ระบบ MVP มี 3 Role

```text
SUPER_ADMIN
TENANT_ADMIN
TENANT_USER
```

---

## 4.1 SUPER_ADMIN

ผู้ดูแลระบบ SaaS

สิทธิ์:

* จัดการ Tenant
* จัดการ Subscription
* ตรวจสอบ Payment
* ยืนยัน Payment
* ดูข้อมูลภาพรวม
* Suspend Tenant
* Activate Tenant
* ดู System Dashboard

---

## 4.2 TENANT_ADMIN

ผู้ดูแลของลูกค้าแต่ละองค์กร

สิทธิ์:

* จัดการ User ภายในองค์กร
* จัดการลูกค้า
* ดู Collection
* เพิ่ม/แก้ไข Collection
* ดู Report
* ดู Subscription

---

## 4.3 TENANT_USER

ผู้ใช้งานทั่วไป

สิทธิ์:

* ดู Dashboard
* เพิ่ม Collection
* ดู Collection
* ดูข้อมูลตามสิทธิ์

---

# 5. Multi-Tenant Architecture

ระบบใช้ Shared Database + Tenant Isolation

ทุกข้อมูลของลูกค้าจะผูกกับ:

```text
tenant_id
```

ตัวอย่าง:

```text
Tenant A
tenant_id = 1

Tenant B
tenant_id = 2
```

ข้อมูล Collection:

```text
collections
-------------------

id
tenant_id
customer_id
amount
collection_date
```

ทุก Query ต้อง Filter:

```sql
WHERE tenant_id = current_user.tenant_id
```

---

# 6. Database Schema

## 6.1 ตาราง tenants

เก็บข้อมูลองค์กรที่สมัครใช้บริการ

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,

    contact_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),

    address TEXT,

    status VARCHAR(30) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Status

```text
ACTIVE
SUSPENDED
INACTIVE
```

---

# 6.2 ตาราง users

```sql
CREATE TABLE users (

    id UUID PRIMARY KEY,

    tenant_id UUID NULL,

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    role VARCHAR(50) NOT NULL,

    status VARCHAR(30) DEFAULT 'ACTIVE',

    last_login_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
);
```

### Role

```text
SUPER_ADMIN
TENANT_ADMIN
TENANT_USER
```

### Important Rule

```text
SUPER_ADMIN
tenant_id = NULL

TENANT USER
tenant_id != NULL
```

---

# 6.3 ตาราง plans

```sql
CREATE TABLE plans (

    id UUID PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    description TEXT,

    price DECIMAL(12,2) NOT NULL,

    billing_cycle VARCHAR(30) DEFAULT 'MONTHLY',

    status VARCHAR(30) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

ตัวอย่าง:

| Plan         |      ราคา |
| ------------ | --------: |
| Standard     | 5,000 บาท |
| Professional | 8,000 บาท |
| Enterprise   |    Custom |

MVP สามารถเริ่มต้นด้วย Plan เดียว:

```text
Standard
5,000 บาท / เดือน
```

---

# 6.4 ตาราง subscriptions

```sql
CREATE TABLE subscriptions (

    id UUID PRIMARY KEY,

    tenant_id UUID NOT NULL,

    plan_id UUID NOT NULL,

    start_date DATE NOT NULL,

    expiry_date DATE NOT NULL,

    status VARCHAR(30) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id)
        REFERENCES tenants(id),

    FOREIGN KEY (plan_id)
        REFERENCES plans(id)
);
```

### Status

```text
ACTIVE
PENDING_PAYMENT
EXPIRED
SUSPENDED
CANCELLED
```

---

# 6.5 ตาราง invoices

ใช้สำหรับเก็บรายการเรียกเก็บเงิน

```sql
CREATE TABLE invoices (

    id UUID PRIMARY KEY,

    tenant_id UUID NOT NULL,

    subscription_id UUID NOT NULL,

    invoice_number VARCHAR(100) UNIQUE NOT NULL,

    amount DECIMAL(12,2) NOT NULL,

    due_date DATE,

    status VARCHAR(30) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id)
        REFERENCES tenants(id),

    FOREIGN KEY (subscription_id)
        REFERENCES subscriptions(id)
);
```

### Invoice Status

```text
PENDING
PAID
OVERDUE
CANCELLED
```

---

# 6.6 ตาราง payments

```sql
CREATE TABLE payments (

    id UUID PRIMARY KEY,

    tenant_id UUID NOT NULL,

    invoice_id UUID NOT NULL,

    amount DECIMAL(12,2) NOT NULL,

    payment_method VARCHAR(50),

    payment_reference VARCHAR(255),

    payment_date TIMESTAMP,

    status VARCHAR(30) DEFAULT 'PENDING',

    confirmed_by UUID,

    confirmed_at TIMESTAMP,

    note TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id)
        REFERENCES tenants(id),

    FOREIGN KEY (invoice_id)
        REFERENCES invoices(id),

    FOREIGN KEY (confirmed_by)
        REFERENCES users(id)
);
```

### Payment Method

```text
BANK_TRANSFER
QR_CODE
CASH
OTHER
```

### Payment Status

```text
PENDING
CONFIRMED
REJECTED
```

---

# 6.7 ตาราง customers

ลูกค้าของ Tenant

> หมายเหตุ: Customer ในที่นี้คือ "ลูกค้าของผู้ใช้งานระบบ" ไม่ใช่ Tenant ที่เช่าระบบ

```sql
CREATE TABLE customers (

    id UUID PRIMARY KEY,

    tenant_id UUID NOT NULL,

    customer_code VARCHAR(100),

    name VARCHAR(255) NOT NULL,

    phone VARCHAR(50),

    email VARCHAR(255),

    address TEXT,

    status VARCHAR(30) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
);
```

---

# 6.8 ตาราง collections

เก็บหัวรายการ Collection

```sql
CREATE TABLE collections (

    id UUID PRIMARY KEY,

    tenant_id UUID NOT NULL,

    customer_id UUID NOT NULL,

    collection_date DATE NOT NULL,

    amount DECIMAL(12,2) NOT NULL,

    payment_method VARCHAR(50),

    reference_number VARCHAR(100),

    collector_id UUID,

    note TEXT,

    created_by UUID NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tenant_id)
        REFERENCES tenants(id),

    FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    FOREIGN KEY (collector_id)
        REFERENCES users(id),

    FOREIGN KEY (created_by)
        REFERENCES users(id)
);
```

---

# 6.9 ตาราง audit_logs

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

    ip_address VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

ตัวอย่าง Action:

```text
CREATE_COLLECTION
UPDATE_COLLECTION
DELETE_COLLECTION

CREATE_CUSTOMER
UPDATE_CUSTOMER

CONFIRM_PAYMENT

CREATE_TENANT
SUSPEND_TENANT
```

---

# 7. Database Relationship

```text
                    ┌──────────┐
                    │  PLANS   │
                    └────┬─────┘
                         │
                         ▼
TENANTS ─────────► SUBSCRIPTIONS
   │                    │
   │                    ▼
   │                 INVOICES
   │                    │
   │                    ▼
   │                 PAYMENTS
   │
   ├──────────────► USERS
   │
   ├──────────────► CUSTOMERS
   │                    │
   │                    ▼
   └──────────────► COLLECTIONS
```

---

# 8. Index Strategy

ควรสร้าง Index สำหรับข้อมูลที่ถูก Query บ่อย

```sql
CREATE INDEX idx_users_tenant
ON users(tenant_id);

CREATE INDEX idx_customers_tenant
ON customers(tenant_id);

CREATE INDEX idx_collections_tenant
ON collections(tenant_id);

CREATE INDEX idx_collections_date
ON collections(collection_date);

CREATE INDEX idx_collections_tenant_date
ON collections(tenant_id, collection_date);

CREATE INDEX idx_subscriptions_tenant
ON subscriptions(tenant_id);

CREATE INDEX idx_payments_status
ON payments(status);
```

---

# 9. API Architecture

Base URL:

```text
/api/v1
```

Response Format:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Unauthorized",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

---

# 10. Authentication API

## Login

```text
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "uuid",
      "name": "John",
      "role": "TENANT_ADMIN"
    }
  }
}
```

---

## Refresh Token

```text
POST /api/v1/auth/refresh
```

---

## Logout

```text
POST /api/v1/auth/logout
```

---

## Current User

```text
GET /api/v1/auth/me
```

---

# 11. Tenant API

## Create Tenant

```text
POST /api/v1/tenants
```

Role:

```text
SUPER_ADMIN
```

---

## Get Tenants

```text
GET /api/v1/tenants
```

Query:

```text
?page=1
&limit=20
&status=ACTIVE
&search=
```

---

## Get Tenant

```text
GET /api/v1/tenants/:id
```

---

## Update Tenant

```text
PATCH /api/v1/tenants/:id
```

---

## Suspend Tenant

```text
POST /api/v1/tenants/:id/suspend
```

---

## Activate Tenant

```text
POST /api/v1/tenants/:id/activate
```

---

# 12. User Management API

## Get Users

```text
GET /api/v1/users
```

Tenant User จะเห็นเฉพาะ User ใน Tenant ตัวเอง

---

## Create User

```text
POST /api/v1/users
```

Request:

```json
{
  "name": "Somchai",
  "email": "somchai@example.com",
  "password": "password",
  "role": "TENANT_USER"
}
```

---

## Update User

```text
PATCH /api/v1/users/:id
```

---

## Disable User

```text
POST /api/v1/users/:id/disable
```

---

# 13. Plan API

## Get Plans

```text
GET /api/v1/plans
```

## Create Plan

```text
POST /api/v1/plans
```

## Update Plan

```text
PATCH /api/v1/plans/:id
```

---

# 14. Subscription API

## Get Current Subscription

```text
GET /api/v1/subscriptions/current
```

Response:

```json
{
  "success": true,
  "data": {
    "plan": "Standard",
    "status": "ACTIVE",
    "startDate": "2026-09-01",
    "expiryDate": "2026-09-30",
    "daysRemaining": 28
  }
}
```

---

## Get Subscription History

```text
GET /api/v1/subscriptions
```

---

## Create Subscription

```text
POST /api/v1/subscriptions
```

Role:

```text
SUPER_ADMIN
```

---

## Renew Subscription

```text
POST /api/v1/subscriptions/:id/renew
```

---

# 15. Invoice API

## Get Invoices

```text
GET /api/v1/invoices
```

## Get Invoice

```text
GET /api/v1/invoices/:id
```

## Create Invoice

```text
POST /api/v1/invoices
```

## Cancel Invoice

```text
POST /api/v1/invoices/:id/cancel
```

---

# 16. Payment API

## Submit Payment

ลูกค้าแจ้งการชำระเงิน

```text
POST /api/v1/payments
```

Request:

```json
{
  "invoiceId": "uuid",
  "amount": 5000,
  "paymentMethod": "QR_CODE",
  "paymentReference": "ABC123"
}
```

---

## Get Pending Payments

```text
GET /api/v1/payments
```

Query:

```text
?status=PENDING
```

---

## Confirm Payment

```text
POST /api/v1/payments/:id/confirm
```

System Process:

```text
Confirm Payment
      ↓
Update Payment = CONFIRMED
      ↓
Update Invoice = PAID
      ↓
Extend Subscription
      ↓
Subscription = ACTIVE
      ↓
Create Audit Log
```

---

## Reject Payment

```text
POST /api/v1/payments/:id/reject
```

---

# 17. Customer API

## Get Customers

```text
GET /api/v1/customers
```

Query:

```text
?page=1
&limit=20
&search=
&status=ACTIVE
```

---

## Get Customer

```text
GET /api/v1/customers/:id
```

---

## Create Customer

```text
POST /api/v1/customers
```

Request:

```json
{
  "customerCode": "C001",
  "name": "Customer Name",
  "phone": "0800000000",
  "address": "Bangkok"
}
```

---

## Update Customer

```text
PATCH /api/v1/customers/:id
```

---

## Disable Customer

```text
POST /api/v1/customers/:id/disable
```

---

# 18. Collection API

## Get Collections

```text
GET /api/v1/collections
```

Query:

```text
?page=1
&limit=20
&dateFrom=2026-09-01
&dateTo=2026-09-30
&customerId=
&collectorId=
```

---

## Get Collection

```text
GET /api/v1/collections/:id
```

---

## Create Collection

```text
POST /api/v1/collections
```

Request:

```json
{
  "customerId": "uuid",
  "collectionDate": "2026-09-02",
  "amount": 1500,
  "paymentMethod": "CASH",
  "collectorId": "uuid",
  "referenceNumber": "",
  "note": ""
}
```

---

## Update Collection

```text
PATCH /api/v1/collections/:id
```

---

## Delete Collection

```text
DELETE /api/v1/collections/:id
```

> แนะนำให้ใช้ Soft Delete ในระบบ Production

---

# 19. Dashboard API

## Tenant Dashboard

```text
GET /api/v1/dashboard
```

Response:

```json
{
  "success": true,
  "data": {
    "today": {
      "totalAmount": 35000,
      "totalTransactions": 42
    },
    "month": {
      "totalAmount": 450000,
      "totalTransactions": 520
    },
    "subscription": {
      "status": "ACTIVE",
      "daysRemaining": 25
    }
  }
}
```

---

# 20. Admin Dashboard API

```text
GET /api/v1/admin/dashboard
```

Response:

```json
{
  "success": true,
  "data": {
    "totalTenants": 25,
    "activeTenants": 21,
    "expiredTenants": 2,
    "pendingPayments": 3,
    "monthlyRevenue": 125000
  }
}
```

---

# 21. Report API

## Daily Report

```text
GET /api/v1/reports/daily
```

Query:

```text
?date=2026-09-02
```

---

## Monthly Report

```text
GET /api/v1/reports/monthly
```

Query:

```text
?year=2026
&month=9
```

---

# 22. API Permission Matrix

| API               | SUPER_ADMIN | TENANT_ADMIN | TENANT_USER |
| ----------------- | ----------- | ------------ | ----------- |
| System Dashboard  | Yes         | No           | No          |
| Tenant Management | Yes         | No           | No          |
| Subscription      | Yes         | View         | View        |
| Payment Confirm   | Yes         | No           | No          |
| User Management   | Yes         | Yes          | Limited     |
| Customer          | Yes         | Yes          | View/Create |
| Collection        | Yes         | Yes          | Yes         |
| Reports           | Yes         | Yes          | View        |
| Audit Logs        | Yes         | Limited      | No          |

---

# 23. User Flow

## 23.1 Login Flow

```text
User
 │
 ▼
Login Page
 │
 ▼
Enter Email + Password
 │
 ▼
Authentication
 │
 ├── Invalid → Error
 │
 ▼
Get User Role
 │
 ▼
Check Tenant
 │
 ▼
Check Subscription
 │
 ├── EXPIRED → Payment Page
 │
 └── ACTIVE
        │
        ▼
    Dashboard
```

---

# 24. Subscription Enforcement Flow

```text
Request
   │
   ▼
Authentication
   │
   ▼
Get User
   │
   ▼
Is SUPER_ADMIN?
   │
   ├── YES → Allow
   │
   NO
   │
   ▼
Get Tenant
   │
   ▼
Check Tenant Status
   │
   ├── SUSPENDED → Block
   │
   ▼
Check Subscription
   │
   ├── ACTIVE → Allow
   │
   └── EXPIRED → Redirect Payment
```

---

# 25. Payment Flow

```text
Tenant
  │
  ▼
View Invoice
  │
  ▼
Show Payment Amount
  │
  ▼
Show QR Code
  │
  ▼
Customer Pays
  │
  ▼
Submit Payment Reference
  │
  ▼
Payment = PENDING
  │
  ▼
SUPER_ADMIN Review
  │
  ├── Reject
  │
  └── Confirm
        │
        ▼
Invoice = PAID
        │
        ▼
Subscription Renew
        │
        ▼
Subscription = ACTIVE
```

---

# 26. Daily Collection Flow

```text
User
 │
 ▼
Dashboard
 │
 ▼
New Collection
 │
 ▼
Select Customer
 │
 ▼
Enter Amount
 │
 ▼
Select Payment Method
 │
 ▼
Save
 │
 ▼
Validation
 │
 ▼
Database Transaction
 │
 ├── Create Collection
 │
 └── Create Audit Log
 │
 ▼
Success
 │
 ▼
Update Dashboard Summary
```

---

# 27. UI / Screen Specification

## 27.1 Public Screens

### Login

Route:

```text
/login
```

Components:

* Logo
* Email Input
* Password Input
* Login Button
* Forgot Password (Future)

---

# 28. Super Admin Screens

## Admin Dashboard

Route:

```text
/admin/dashboard
```

Components:

```text
┌───────────────────────────────────────┐
│ Total Tenants      25                 │
│ Active             21                 │
│ Expired             2                 │
│ Pending Payments    3                 │
│ Revenue       ฿125,000                │
└───────────────────────────────────────┘
```

Widgets:

* Total Tenants
* Active Tenants
* Expired Tenants
* Pending Payments
* Monthly Revenue
* Recent Payments
* Expiring Subscriptions

---

## Tenant Management

Route:

```text
/admin/tenants
```

Features:

* Search
* Filter Status
* Create Tenant
* Edit Tenant
* Suspend
* Activate
* View Subscription

Columns:

| Tenant | Contact | Plan | Expiry | Status |
| ------ | ------- | ---- | ------ | ------ |

---

## Tenant Detail

Route:

```text
/admin/tenants/:id
```

Tabs:

```text
Overview
Users
Subscription
Invoices
Payments
Audit Logs
```

---

## Payment Management

Route:

```text
/admin/payments
```

Features:

* Pending Payment List
* Confirm
* Reject
* Payment Detail

---

## Subscription Management

Route:

```text
/admin/subscriptions
```

Features:

* Active Subscription
* Expiring Soon
* Expired
* Manual Renewal

---

# 29. Tenant Screens

## Tenant Dashboard

Route:

```text
/dashboard
```

Components:

```text
┌─────────────────────────────┐
│ Today's Collection          │
│ ฿35,000                     │
│ 42 Transactions             │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Monthly Collection          │
│ ฿450,000                    │
│ 520 Transactions            │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Subscription                │
│ ACTIVE                      │
│ Expires in 25 days          │
└─────────────────────────────┘
```

---

## Customer List

Route:

```text
/customers
```

Features:

* Search
* Add Customer
* Edit Customer
* Disable Customer
* Pagination

---

## Customer Detail

Route:

```text
/customers/:id
```

Information:

* Customer Information
* Collection History
* Total Collection

---

## Collection List

Route:

```text
/collections
```

Features:

* Date Filter
* Customer Filter
* Collector Filter
* Payment Method Filter
* Pagination
* Export (Phase 2)

Columns:

| Date | Customer | Amount | Method | Collector |
| ---- | -------- | -----: | ------ | --------- |

---

## Create Collection

Route:

```text
/collections/new
```

Fields:

```text
Collection Date
Customer
Amount
Payment Method
Collector
Reference Number
Note
```

Buttons:

```text
Save
Cancel
```

---

## Collection Detail

Route:

```text
/collections/:id
```

Actions:

* View
* Edit
* Delete

---

# 30. Reports Screens

## Daily Report

Route:

```text
/reports/daily
```

Data:

* Total Amount
* Total Transactions
* Payment Method Breakdown
* Collector Breakdown

---

## Monthly Report

Route:

```text
/reports/monthly
```

Data:

* Monthly Total
* Daily Trend
* Payment Method Summary
* Top Customers

---

# 31. Subscription Screens

## Current Subscription

Route:

```text
/subscription
```

Display:

```text
Current Plan

Standard

Status

ACTIVE

Start Date

1 September 2026

Expiry Date

30 September 2026

Amount

฿5,000 / month
```

---

## Payment Screen

Route:

```text
/billing/payment
```

Components:

* Invoice Number
* Amount
* Bank Account
* QR Code
* Payment Reference
* Submit Payment

---

# 32. Navigation Structure

## Super Admin

```text
Dashboard
│
├── Tenants
├── Subscriptions
├── Payments
├── Plans
├── Users
└── Settings
```

---

## Tenant

```text
Dashboard
│
├── Customers
│
├── Collections
│
├── Reports
│   ├── Daily
│   └── Monthly
│
├── Users
│
└── Subscription
```

---

# 33. Subscription Cron Jobs

ระบบควรมี Scheduled Job

## Daily Subscription Check

ทำงานทุกวัน:

```text
00:05
```

Process:

```text
Find Active Subscription
       │
       ▼
Expiry Date < Today?
       │
       ├── YES
       │     │
       │     ▼
       │  EXPIRED
       │
       NO
```

---

## Expiry Notification Job

ตรวจสอบ:

```text
7 days before
3 days before
1 day before
```

MVP:

```text
In-App Notification
```

Phase 2:

```text
Email
LINE
SMS
```

---

# 34. Transaction Handling

การ Confirm Payment ต้องทำภายใน Database Transaction

```text
BEGIN TRANSACTION

1. Update Payment = CONFIRMED

2. Update Invoice = PAID

3. Update Subscription

4. Create Audit Log

COMMIT
```

หากขั้นตอนใดผิดพลาด:

```text
ROLLBACK
```

---

# 35. Subscription Renewal Logic

Pseudo Code:

```typescript
function renewSubscription(subscription, months = 1) {

    const today = new Date();

    if (subscription.expiryDate >= today) {

        newStartDate = subscription.expiryDate + 1 day;

    } else {

        newStartDate = today;

    }

    newExpiryDate =
        addMonths(newStartDate, months) - 1 day;

    return {
        startDate: newStartDate,
        expiryDate: newExpiryDate,
        status: 'ACTIVE'
    };
}
```

---

# 36. Security Requirements

## Authentication

* JWT Access Token
* Refresh Token
* Password Hashing
* Token Expiration

---

## Password

Minimum:

```text
8 characters
Uppercase
Lowercase
Number
```

---

## API Security

* Rate Limiting
* CORS
* Helmet
* Input Validation
* SQL Injection Protection
* Request Logging

---

## Authorization

ทุก API ต้องตรวจสอบ:

```text
User
Role
Tenant
Subscription
```

---

# 37. Tenant Data Isolation

ห้ามรับ `tenant_id` จาก Client โดยตรงสำหรับ Tenant User

### Incorrect

```json
{
    "tenantId": "tenant-B",
    "customerId": "123"
}
```

### Correct

```text
tenant_id
↓
Extract From JWT
```

ตัวอย่าง:

```typescript
const tenantId = request.user.tenantId;
```

เพื่อป้องกันผู้ใช้แก้ไข Request แล้วเข้าถึงข้อมูล Tenant อื่น

---

# 38. Error Codes

```text
UNAUTHORIZED
FORBIDDEN
TENANT_SUSPENDED
SUBSCRIPTION_EXPIRED

USER_NOT_FOUND
TENANT_NOT_FOUND
CUSTOMER_NOT_FOUND

INVALID_PAYMENT
PAYMENT_ALREADY_CONFIRMED

VALIDATION_ERROR
INTERNAL_SERVER_ERROR
```

---

# 39. Logging

ควรแยก Log:

```text
Application Log
Error Log
Security Log
Audit Log
```

ตัวอย่าง:

```text
[INFO]
User login

[ERROR]
Payment confirmation failed

[SECURITY]
Unauthorized access attempt

[AUDIT]
Collection updated
```

---

# 40. MVP Sprint Plan

แนะนำ Sprint ละ 2 สัปดาห์

---

# Sprint 0 — Project Setup

## ระยะเวลา

```text
3 - 5 วัน
```

## Tasks

### Backend

* Setup Repository
* Setup NestJS
* Setup PostgreSQL
* Setup Prisma
* Environment Config
* Docker

### Frontend

* Setup Next.js
* Setup Tailwind
* Base Layout
* Authentication Layout

### DevOps

* Development Environment
* CI/CD Basic
* Database Migration

## Deliverable

```text
Project Skeleton พร้อมเริ่มพัฒนา
```

---

# Sprint 1 — Authentication & Multi-Tenant

## Backend

* User Table
* Tenant Table
* Authentication
* JWT
* Refresh Token
* Role Guard
* Tenant Guard

## Frontend

* Login Page
* Dashboard Layout
* Role Navigation
* Protected Routes

## Deliverable

```text
สามารถ Login และแยก Tenant ได้
```

---

# Sprint 2 — Tenant & User Management

## Backend

* Tenant CRUD
* User CRUD
* Role Management

## Frontend

### Admin

* Tenant List
* Tenant Detail
* Create Tenant

### Tenant

* User List
* Create User

## Deliverable

```text
SUPER_ADMIN สามารถสร้าง Tenant ใหม่
Tenant Admin สามารถสร้าง User
```

---

# Sprint 3 — Subscription & Billing

## Backend

* Plan
* Subscription
* Invoice
* Subscription Check Middleware
* Expiry Job

## Frontend

* Subscription Screen
* Admin Subscription Management
* Invoice List

## Deliverable

```text
ระบบสามารถควบคุมสิทธิ์การใช้งานตาม Subscription
```

---

# Sprint 4 — Payment

## Backend

* Payment Record
* Submit Payment
* Confirm Payment
* Reject Payment
* Renewal Logic
* Audit Log

## Frontend

### Tenant

* Payment Page
* QR Code
* Payment Submission

### Admin

* Pending Payment
* Confirm Payment

## Deliverable

```text
สามารถชำระเงินและต่ออายุ Subscription ได้
```

---

# Sprint 5 — Customer Management

## Backend

* Customer CRUD
* Search
* Pagination

## Frontend

* Customer List
* Customer Detail
* Create Customer
* Edit Customer

## Deliverable

```text
Tenant สามารถจัดการลูกค้าของตัวเองได้
```

---

# Sprint 6 — Daily Collection

## Backend

* Collection CRUD
* Validation
* Tenant Isolation
* Audit Log

## Frontend

* Collection List
* Create Collection
* Edit Collection
* Delete Collection

## Deliverable

```text
สามารถบันทึกยอด Collection รายวันได้
```

---

# Sprint 7 — Dashboard & Reports

## Backend

* Dashboard API
* Daily Report
* Monthly Report
* Aggregation Query

## Frontend

* Dashboard
* Daily Report
* Monthly Report

## Deliverable

```text
ผู้ใช้สามารถดูยอดสรุปและรายงานได้
```

---

# Sprint 8 — Testing & Production

## Testing

* Unit Test
* API Test
* Integration Test
* Permission Test
* Tenant Isolation Test

## Security

* Security Review
* Rate Limit
* Validation
* JWT Review

## Deployment

* Production Environment
* Database Backup
* Monitoring
* Error Tracking

## Deliverable

```text
MVP Ready for Production Pilot
```

---

# 41. Development Timeline

ตัวอย่าง:

| Sprint   | Feature        | ระยะเวลา  |
| -------- | -------------- | --------- |
| Sprint 0 | Setup          | 1 สัปดาห์ |
| Sprint 1 | Authentication | 2 สัปดาห์ |
| Sprint 2 | Tenant/User    | 2 สัปดาห์ |
| Sprint 3 | Subscription   | 2 สัปดาห์ |
| Sprint 4 | Payment        | 2 สัปดาห์ |
| Sprint 5 | Customer       | 2 สัปดาห์ |
| Sprint 6 | Collection     | 2 สัปดาห์ |
| Sprint 7 | Reports        | 2 สัปดาห์ |
| Sprint 8 | Testing/Deploy | 2 สัปดาห์ |

### รวมระยะเวลาโดยประมาณ

```text
15 - 17 สัปดาห์
```

---

# 42. MVP Definition of Done

ระบบถือว่า MVP พร้อมทดลองใช้งานเมื่อสามารถทำงานได้ครบ:

## Authentication

* [ ] Login
* [ ] Logout
* [ ] Role-based Access

## Multi-Tenant

* [ ] Tenant Isolation
* [ ] Tenant Management
* [ ] User Management

## Subscription

* [ ] Create Subscription
* [ ] Subscription Status
* [ ] Expiry Check
* [ ] Block Expired Tenant

## Billing

* [ ] Invoice
* [ ] Payment Submission
* [ ] Payment Confirmation
* [ ] Subscription Renewal

## Collection

* [ ] Customer Management
* [ ] Create Collection
* [ ] Edit Collection
* [ ] View Collection
* [ ] Daily Summary

## Reports

* [ ] Dashboard
* [ ] Daily Report
* [ ] Monthly Report

## System

* [ ] Audit Log
* [ ] Error Handling
* [ ] Database Backup
* [ ] Production Deployment

---

# 43. Recommended Project Structure

## Backend

```text
src/

├── auth/
├── users/
├── tenants/
├── plans/
├── subscriptions/
├── invoices/
├── payments/
├── customers/
├── collections/
├── reports/
├── dashboard/
├── audit/
│
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   └── interceptors/
│
├── config/
│
└── main.ts
```

---

## Frontend

```text
app/

├── login/
│
├── admin/
│   ├── dashboard/
│   ├── tenants/
│   ├── subscriptions/
│   └── payments/
│
├── dashboard/
│
├── customers/
│
├── collections/
│
├── reports/
│   ├── daily/
│   └── monthly/
│
└── subscription/
```

---

# 44. Recommended API Module Structure

ตัวอย่าง NestJS:

```text
collections/

├── collections.module.ts
├── collections.controller.ts
├── collections.service.ts
│
├── dto/
│   ├── create-collection.dto.ts
│   └── update-collection.dto.ts
│
└── entities/
    └── collection.entity.ts
```

---

# 45. Critical Business Rules

## Rule 1 — Tenant Isolation

```text
Tenant A
ห้ามเห็นข้อมูล Tenant B
```

---

## Rule 2 — Expired Subscription

```text
Subscription = EXPIRED

↓

Block Business Operations
```

อนุญาตเฉพาะ:

* Login
* View Subscription
* View Invoice
* Submit Payment

---

## Rule 3 — Payment Confirmation

เฉพาะ:

```text
SUPER_ADMIN
```

สามารถ:

```text
CONFIRM PAYMENT
```

---

## Rule 4 — Collection Ownership

Collection ทุก Record ต้องมี:

```text
tenant_id
```

---

## Rule 5 — Audit

ทุก Transaction สำคัญต้องมี Audit Log

โดยเฉพาะ:

```text
Payment
Subscription
Collection
Tenant Status
```

---

# 46. Production Readiness Checklist

## Infrastructure

* [ ] HTTPS
* [ ] Environment Variables
* [ ] Database Backup
* [ ] Docker
* [ ] Monitoring

## Security

* [ ] Password Hashing
* [ ] JWT Expiration
* [ ] Rate Limit
* [ ] Input Validation
* [ ] Role Guard
* [ ] Tenant Guard

## Database

* [ ] Index
* [ ] Migration
* [ ] Backup
* [ ] Restore Test

## Application

* [ ] Error Handling
* [ ] Logging
* [ ] Audit Log
* [ ] Health Check

---

# 47. Final MVP Architecture

```text
                         USERS
                           │
                           ▼
                    ┌──────────────┐
                    │   Next.js    │
                    │   Frontend   │
                    └──────┬───────┘
                           │
                         HTTPS
                           │
                           ▼
                    ┌──────────────┐
                    │    NestJS    │
                    │     API      │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
     AUTH MODULE       BILLING            COLLECTION
        │                  │                  │
        │             SUBSCRIPTION        CUSTOMERS
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ PostgreSQL   │
                    │   Database   │
                    └──────────────┘
```

---

# 48. Architecture Principle

ระบบควรยึดหลัก:

```text
Security First
Tenant Isolation First
Auditability
Simple MVP
Modular Architecture
Scalable Design
```

---

# 49. Final Development Priority

ลำดับความสำคัญสูงสุด:

```text
Priority 1
Authentication
Multi-Tenant

Priority 2
Subscription
Billing

Priority 3
Customer Management
Collection

Priority 4
Dashboard
Reports

Priority 5
Automation
Integration
Advanced Features
```

---

# 50. Conclusion

MVP นี้ถูกออกแบบให้เป็นจุดเริ่มต้นของระบบ SaaS ที่สามารถขยายได้ในอนาคต

Core ที่สำคัญที่สุดมี 3 ส่วน:

```text
1. Multi-Tenant

2. Subscription & Billing

3. Daily Collection Management
```

หากทั้ง 3 ส่วนนี้ถูกออกแบบอย่างถูกต้องตั้งแต่เริ่มต้น ระบบจะสามารถขยายจาก:

```text
ลูกค้า 1 ราย
```

ไปสู่:

```text
10 ราย
100 ราย
1,000 ราย
```

โดยไม่จำเป็นต้องเปลี่ยน Architecture หลัก

---

# Next Recommended Documents

หลังจากเอกสารนี้ แนะนำให้จัดทำเอกสารต่อไปนี้:

1. `Database_ERD.md`
2. `API_Specification_OpenAPI.yaml`
3. `UI_UX_Screen_Specification.md`
4. `Business_Rules.md`
5. `User_Acceptance_Test.md`
6. `Deployment_Architecture.md`
7. `Sprint_Backlog.md`
8. `README.md`

เอกสารชุดนี้จะทำให้โครงการมี Blueprint ครบตั้งแต่

```text
Business
   ↓
Requirement
   ↓
Technical Architecture
   ↓
Database
   ↓
API
   ↓
UI/UX
   ↓
Development Sprint
   ↓
Testing
   ↓
Production
```
