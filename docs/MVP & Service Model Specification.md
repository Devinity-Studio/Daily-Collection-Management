# Daily Collection Management

## MVP & Service Model Specification

**Version:** 1.1
**Date:** 3 September 2026
**สถานะ:** Draft สำหรับพัฒนา MVP
**Updated:** อัปเดตตาม Architecture Review v1.0

---

> **⚠️ Architecture Review Applied**
>
> เอกสารนี้ได้รับการอัปเดตตาม Architecture Review — Align DCM with Product Principles v1.0
> อ่านรายละเอียดที่ `docs/Architecture Review — Align DCM with Product Principles.md`
>
> **Product Principle:** DCM คือระบบบริหารข้อมูลภาระหนี้และการรับชำระ ไม่ใช่ระบบ "ไล่ล่าลูกหนี้"
>
> DCM ช่วยบริษัท **บริหารข้อมูลภาระหนี้และการรับชำระให้ถูกต้อง ตรวจสอบได้ และจัดการง่ายขึ้น**
> ไม่ใช่ระบบที่ช่วย "ติดตาม/ทวงหนี้" แต่เป็นระบบที่ทำให้ข้อมูลถูกต้องและโปร่งใส

---

## 1. ภาพรวมระบบ

Daily Collection Management คือระบบสำหรับบริหารจัดการข้อมูลภาระหนี้และการรับชำระเงินของธุรกิจหรือหน่วยงานที่มีการรับชำระเงินจากลูกค้าจำนวนมาก

> **⚠️ สำคัญ:** DCM ไม่ใช่ระบบที่ช่วยบริษัท "ไล่ล่าลูกหนี้" DCM คือระบบที่ช่วยบริษัท **บริหารข้อมูลให้ถูกต้อง ตรวจสอบได้ และจัดการง่ายขึ้น**

ระบบถูกออกแบบให้สามารถให้บริการแก่ลูกค้าหลายรายในรูปแบบ **รายเดือน (Monthly Subscription)** โดยผู้ให้บริการระบบเป็นผู้ดูแลระบบกลาง และลูกค้าแต่ละรายจะมีข้อมูลและการใช้งานแยกออกจากกัน

แนวคิดหลักคือ

> **ลูกค้าจ่ายค่าบริการรายเดือน → ระบบตรวจสอบสถานะการชำระเงิน → เปิดสิทธิ์การใช้งาน → ใช้งานระบบต่อได้จนกว่าจะครบกำหนด**

---

# 2. รูปแบบการให้บริการ

ระบบจะให้บริการในลักษณะ **SaaS (Software as a Service)**

ตัวอย่างค่าบริการ:

| รายการ           | รายละเอียด                          |
| ---------------- | ----------------------------------- |
| ค่าบริการ        | 5,000 บาท / เดือน / ราย             |
| รอบการคิดเงิน    | รายเดือน                            |
| ช่องทางชำระเงิน  | โอนเงิน / QR Code                   |
| การยืนยันการชำระ | ผู้ดูแลระบบตรวจสอบหรือยืนยันการชำระ |
| หลังชำระเงิน     | ระบบต่ออายุสิทธิ์การใช้งาน          |
| หากไม่ชำระ       | ระบบระงับหรือจำกัดการใช้งาน         |
| จำนวนลูกค้า      | รองรับลูกค้าหลายราย                 |

### ตัวอย่าง

ลูกค้า A สมัครใช้ระบบวันที่ 10 กันยายน

* ค่าบริการ: 5,000 บาท
* ระยะเวลาใช้งาน: 10 ก.ย. – 9 ต.ค.
* เมื่อลูกค้าชำระค่าบริการรอบถัดไป ระบบต่ออายุเป็น

  * 10 ต.ค. – 9 พ.ย.
* หากไม่ชำระ ระบบจะเปลี่ยนสถานะเป็นหมดอายุ

---

# 3. แนวคิด Multi-Tenant

ระบบต้องรองรับลูกค้าหลายรายในระบบเดียวกัน

ตัวอย่าง:

```text
System
│
├── Customer A
│   ├── Users
│   ├── Collection Data
│   ├── Customers
│   └── Reports
│
├── Customer B
│   ├── Users
│   ├── Collection Data
│   ├── Customers
│   └── Reports
│
└── Customer C
    ├── Users
    ├── Collection Data
    ├── Customers
    └── Reports
```

ข้อมูลของลูกค้าแต่ละรายต้องถูกแยกออกจากกันอย่างชัดเจน

ผู้ใช้ของ Customer A จะต้องไม่สามารถเข้าถึงข้อมูลของ Customer B ได้

---

# 4. ผู้ใช้งานระบบ

ระบบ MVP แบ่งผู้ใช้งานหลักออกเป็น 2 ระดับ

## 4.1 System Admin

เป็นผู้ดูแลระบบกลาง

หน้าที่หลัก:

* เพิ่ม/แก้ไขลูกค้าที่สมัครใช้บริการ
* ตรวจสอบสถานะ Subscription
* ตรวจสอบการชำระเงิน
* ต่ออายุ Subscription
* ระงับ/เปิดใช้งานระบบ
* ดูข้อมูลลูกค้าทั้งหมด
* ดูรายได้และสถานะการสมัครใช้งาน
* จัดการแพ็กเกจ/ค่าบริการ

---

## 4.2 Customer User

เป็นผู้ใช้งานของลูกค้าที่เช่าระบบ

สามารถ:

* Login
* จัดการข้อมูลลูกค้าของตนเอง
* บันทึกยอดเก็บเงิน
* ตรวจสอบยอดประจำวัน
* ดูรายงาน
* ดูประวัติการเก็บเงิน
* ดูสถานะการใช้งาน Subscription

---

# 5. Subscription Management

หัวใจสำคัญของ Business Model คือ Subscription

ข้อมูล Subscription ควรประกอบด้วย:

```text
Subscription
├── Customer
├── Plan
├── Price
├── Start Date
├── Expiry Date
├── Status
└── Payment History
```

### สถานะที่แนะนำ

```text
ACTIVE
PENDING_PAYMENT
EXPIRED
SUSPENDED
CANCELLED
```

---

# 6. การทำงานของ Subscription

## กรณีสมัครใหม่

```text
ลูกค้าสมัคร
    ↓
สร้าง Customer Account
    ↓
สร้าง Invoice
    ↓
ลูกค้าชำระเงิน
    ↓
Admin ตรวจสอบ
    ↓
ยืนยันการชำระเงิน
    ↓
Subscription = ACTIVE
    ↓
ระบบเปิดให้ใช้งาน
```

---

## กรณีต่ออายุ

```text
ใกล้ถึงวันหมดอายุ
        ↓
ระบบแจ้งเตือน
        ↓
สร้างรายการชำระเงินรอบใหม่
        ↓
ลูกค้าชำระ 5,000 บาท
        ↓
ยืนยันการชำระ
        ↓
ต่ออายุ Subscription
        ↓
ใช้งานต่อได้
```

---

## กรณีไม่ชำระเงิน

```text
Subscription หมดอายุ
        ↓
ตรวจสอบสถานะ
        ↓
EXPIRED
        ↓
จำกัดการใช้งาน
        ↓
แสดงหน้าชำระค่าบริการ
```

อาจกำหนดให้ลูกค้ายังสามารถ Login ได้ แต่ไม่สามารถใช้งานฟังก์ชันหลัก จนกว่าจะชำระเงิน

ตัวอย่าง:

```text
┌─────────────────────────────────────┐
│ Subscription หมดอายุ               │
│                                     │
│ กรุณาชำระค่าบริการ 5,000 บาท       │
│ เพื่อเปิดใช้งานระบบต่อ             │
│                                     │
│ [ แสดง QR Code ]                    │
│                                     │
│ [ แจ้งชำระเงิน ]                    │
└─────────────────────────────────────┘
```

---

# 7. Payment

MVP สามารถเริ่มต้นด้วยการรับชำระเงินแบบ Manual ก่อน เพื่อลดความซับซ้อนในการพัฒนา

## ช่องทางการชำระ

### 1. Bank Transfer

ลูกค้าโอนเงินเข้าบัญชีของผู้ให้บริการ

### 2. QR Code

ลูกค้าสแกน QR Code เพื่อชำระเงิน

---

# 8. ขั้นตอนการชำระเงิน MVP

```text
ลูกค้า
  ↓
เปิดหน้า Subscription
  ↓
เห็นยอดที่ต้องชำระ
  ↓
แสดง QR Code / ข้อมูลบัญชี
  ↓
ลูกค้าชำระเงิน
  ↓
แจ้งชำระเงิน
  ↓
Admin ตรวจสอบ
  ↓
Admin กดยืนยัน
  ↓
ระบบต่ออายุ Subscription
```

---

# 9. Payment Record

ควรเก็บประวัติการชำระเงินทุกครั้ง

ตัวอย่างข้อมูล:

```text
Payment
├── ID
├── Customer ID
├── Subscription ID
├── Amount
├── Payment Date
├── Payment Method
├── Reference
├── Status
├── Confirmed By
└── Confirmed At
```

สถานะ:

```text
PENDING
CONFIRMED
REJECTED
CANCELLED
```

---

# 10. Dashboard ของ System Admin

หน้า Dashboard ควรแสดงข้อมูลสำคัญ เช่น

```text
========================================
        SYSTEM ADMIN DASHBOARD
========================================

ลูกค้าทั้งหมด             25 ราย

Active                    21 ราย
ใกล้หมดอายุ                3 ราย
หมดอายุ                    1 ราย

ยอดรายได้เดือนนี้
฿125,000

รอการตรวจสอบการชำระ
3 รายการ

========================================
```

---

# 11. Customer Management

Admin สามารถจัดการลูกค้าที่เช่าระบบ

ข้อมูลหลัก:

* ชื่อลูกค้า/บริษัท
* ผู้ติดต่อ
* เบอร์โทรศัพท์
* Email
* Username
* สถานะ
* วันที่เริ่มใช้บริการ
* วันหมดอายุ
* แพ็กเกจ
* ประวัติการชำระเงิน

---

# 12. Customer Dashboard

เมื่อลูกค้า Login เข้ามา ควรเห็นข้อมูลสำคัญทันที

```text
========================================
             DASHBOARD
========================================

สถานะระบบ
🟢 ACTIVE

วันหมดอายุ
30 September 2026

เหลือเวลา
28 วัน

ค่าบริการรอบถัดไป
฿5,000

----------------------------------------

ยอดเก็บวันนี้
฿35,500

ยอดเก็บเดือนนี้
฿450,000

จำนวนรายการวันนี้
42 รายการ

========================================
```

---

# 13. ระบบ Daily Collection

ส่วนนี้เป็น Core Business ของระบบ

ผู้ใช้งานสามารถบันทึกข้อมูลการเก็บเงินรายวัน เช่น

```text
วันที่
ผู้เก็บเงิน
ลูกค้า
จำนวนเงิน
ช่องทางการชำระ
หมายเหตุ
```

ตัวอย่าง:

| เวลา  | ลูกค้า       | จำนวน | วิธีชำระ | ผู้เก็บ |
| ----- | ------------ | ----: | -------- | ------- |
| 09:10 | Customer 001 |   500 | เงินสด   | สมชาย   |
| 10:20 | Customer 002 | 1,000 | โอน      | สมชาย   |
| 11:30 | Customer 003 |   750 | QR       | วิชัย   |

---

# 14. Daily Summary

ระบบสามารถสรุปยอดรายวัน

ตัวอย่าง:

```text
วันที่ 2 กันยายน 2026

จำนวนรายการ       125 รายการ
เงินสด             ฿35,000
โอนเงิน            ฿42,500
QR Code            ฿18,500
----------------------------
รวม                 ฿96,000
```

---

# 15. Monthly Summary

ระบบสามารถสรุปยอดตามเดือน

ตัวอย่าง:

```text
กันยายน 2026

ยอดรวมทั้งหมด          ฿1,250,000

เงินสด                  ฿450,000
โอนเงิน                 ฿550,000
QR Code                 ฿250,000

จำนวนรายการ             2,350
```

---

# 16. Business Model

รายได้หลักของผู้ให้บริการระบบมาจากค่าบริการ Subscription

ตัวอย่าง:

| ลูกค้า  | ค่าบริการ/เดือน |
| ------- | --------------: |
| 1 ราย   |          ฿5,000 |
| 10 ราย  |         ฿50,000 |
| 50 ราย  |        ฿250,000 |
| 100 ราย |        ฿500,000 |

ดังนั้นระบบควรถูกออกแบบตั้งแต่ MVP ให้สามารถรองรับการเพิ่มจำนวนลูกค้าได้โดยไม่ต้องสร้างระบบใหม่สำหรับลูกค้าแต่ละราย

---

# 17. MVP Scope

เพื่อให้สามารถพัฒนาและนำระบบไปใช้งานจริงได้เร็ว แนะนำแบ่ง MVP เป็นส่วนดังนี้

## Phase 1 — Core System

### Authentication

* Login
* Logout
* Password
* Role

### Customer/Tenant

* สร้างลูกค้า
* แก้ไขลูกค้า
* เปิด/ปิดบัญชี
* แยกข้อมูลแต่ละลูกค้า

### Subscription

* แพ็กเกจรายเดือน
* วันเริ่มต้น
* วันหมดอายุ
* สถานะ
* ต่ออายุ

### Payment

* QR Code
* Bank Transfer
* แจ้งชำระ
* Admin ยืนยัน
* Payment History

### Daily Collection

* เพิ่มรายการเก็บเงิน
* แก้ไขรายการ
* ดูรายการ
* สรุปยอดรายวัน

### Report

* รายงานรายวัน
* รายงานรายเดือน
* Export CSV/Excel ในอนาคต

---

# 18. สิ่งที่ยังไม่จำเป็นใน MVP

เพื่อให้สามารถ Launch ได้เร็ว ไม่จำเป็นต้องทำทุกอย่างตั้งแต่แรก

ฟังก์ชันที่สามารถทำภายหลัง:

* Automatic Payment Verification
* Payment Gateway
* Auto Debit
* Mobile Application
* LINE Notification
* SMS
* Advanced Analytics
* AI Forecasting
* Accounting Integration
* Multi-currency
* Complex Permission System

---

# 19. Architecture Concept

โครงสร้างระบบเบื้องต้น:

```text
                    Internet
                       │
                       ▼
                 ┌───────────┐
                 │   Web App │
                 └─────┬─────┘
                       │
                       ▼
                 ┌───────────┐
                 │    API    │
                 └─────┬─────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     Authentication  Billing    Collection
          │            │            │
          └────────────┼────────────┘
                       ▼
                  ┌─────────┐
                  │ Database│
                  └─────────┘
```

---

# 20. Database Concept

ตารางหลักที่ควรมีใน MVP:

```text
users
tenants
subscriptions
plans
payments
customers
collections
collection_items
audit_logs
```

ความสัมพันธ์โดยประมาณ:

```text
Tenant
 │
 ├── Users
 │
 ├── Subscription
 │      │
 │      └── Payments
 │
 ├── Customers
 │
 └── Collections
```

---

# 21. Security

เนื่องจากเป็นระบบที่จัดเก็บข้อมูลทางการเงิน ควรให้ความสำคัญกับ Security ตั้งแต่ MVP

อย่างน้อยควรมี:

* Password Hashing
* Authentication
* Authorization
* Role-based access
* Tenant isolation
* HTTPS
* Database Backup
* Audit Log
* Session Management
* Input Validation

โดยเฉพาะ **Tenant Isolation** ถือเป็นเรื่องสำคัญมาก

ทุก Query ที่เกี่ยวข้องกับข้อมูลลูกค้าควรผูกกับ `tenant_id`

ตัวอย่าง:

```text
SELECT *
FROM collections
WHERE tenant_id = current_user.tenant_id;
```

เพื่อป้องกันไม่ให้ข้อมูลของลูกค้ารายหนึ่งรั่วไหลไปยังอีกราย

---

# 22. Audit Log

ระบบควรบันทึกกิจกรรมสำคัญ เช่น

```text
User
Action
Entity
Entity ID
Old Value
New Value
Timestamp
IP Address
```

ตัวอย่าง:

```text
Admin
CONFIRM_PAYMENT
Payment #1025
฿5,000
2026-09-02 14:35
```

สิ่งนี้จะช่วยตรวจสอบย้อนหลังเมื่อเกิดปัญหาเกี่ยวกับยอดเงินหรือ Subscription

---

# 23. Subscription Enforcement

ระบบต้องมี Middleware/Guard สำหรับตรวจสอบสิทธิ์การใช้งาน

แนวคิด:

```text
Request
   ↓
Authentication
   ↓
Identify Tenant
   ↓
Check Subscription
   ↓
ACTIVE ?
 ┌─┴───────┐
YES       NO
 │         │
 ▼         ▼
Allow    Block
```

ตัวอย่าง:

```text
if subscription.status == ACTIVE:
    allow_request()

else:
    return SUBSCRIPTION_REQUIRED
```

---

# 24. Notification

ระบบควรแจ้งเตือนก่อน Subscription หมดอายุ

ตัวอย่าง:

```text
7 วันก่อนหมดอายุ
        ↓
แจ้งเตือน

3 วันก่อนหมดอายุ
        ↓
แจ้งเตือน

1 วันก่อนหมดอายุ
        ↓
แจ้งเตือน

หมดอายุ
        ↓
ระงับการใช้งาน
```

ใน MVP อาจเริ่มจาก Notification ภายในระบบก่อน

และเพิ่ม LINE / Email / SMS ใน Phase ถัดไป

---

# 25. แนวทางการคิดวันใช้งาน

ควรยึดตาม **รอบการใช้งานจริงของลูกค้า** ไม่ใช่ยึดเพียงวันที่ 1 ถึงวันที่สุดท้ายของเดือน

ตัวอย่าง:

```text
เริ่มใช้งาน
10 Sep 2026

ครบ 1 เดือน
10 Oct 2026

ครบ 2 เดือน
10 Nov 2026
```

ข้อดีคือสามารถรองรับลูกค้าที่สมัครเข้ามาคนละวันได้

---

# 26. กรณีต่ออายุก่อนหมดอายุ

ควรกำหนด Rule ให้ชัดเจน

ตัวอย่าง:

Subscription เดิม:

```text
10 Sep → 9 Oct
```

ลูกค้าชำระวันที่ 5 Oct

ไม่ควรเริ่มรอบใหม่วันที่ 5 Oct

แต่ควรต่อจากวันหมดอายุเดิม:

```text
10 Sep → 9 Oct
            ↓
       + 1 เดือน
            ↓
10 Oct → 9 Nov
```

เพื่อป้องกันวันใช้งานสูญหาย

---

# 27. กรณีชำระเงินล่าช้า

ตัวอย่าง:

```text
รอบเดิม:
10 Sep → 9 Oct

ไม่ได้ชำระ

ระบบหมดอายุ:
10 Oct

ชำระวันที่:
15 Oct
```

เมื่อ Admin ยืนยันการชำระ ระบบสามารถเลือก Policy ได้ เช่น

### Policy A — เริ่มรอบใหม่วันที่ชำระ

```text
15 Oct → 14 Nov
```

### Policy B — ต่อจากวันหมดอายุ

```text
10 Oct → 9 Nov
```

สำหรับ MVP แนะนำให้กำหนด Policy เดียวให้ชัดเจนก่อน เพื่อไม่ให้เกิดความสับสนในการคำนวณ

---

# 28. Future Payment Automation

หลังจาก MVP ทำงานได้แล้ว สามารถพัฒนาการชำระเงินอัตโนมัติได้

```text
Customer
   ↓
Payment Gateway
   ↓
Payment Success
   ↓
Webhook
   ↓
System
   ↓
Confirm Payment
   ↓
Extend Subscription
```

จะช่วยลดภาระ Admin ในการตรวจสอบยอดโอน

---

# 29. KPI ของระบบ

ตัวชี้วัดที่ควรติดตาม:

### Business

* จำนวนลูกค้าที่ Active
* จำนวนลูกค้าใหม่
* Monthly Recurring Revenue (MRR)
* Churn Rate
* Renewal Rate
* รายได้ต่อเดือน

### System

* จำนวนรายการเก็บเงิน
* ยอดเงินรวม
* จำนวนผู้ใช้งาน
* API Response Time
* Error Rate

---

# 30. MVP Success Criteria

MVP ถือว่าประสบความสำเร็จเมื่อสามารถทำ Flow หลักได้ครบ:

```text
สมัครลูกค้า
     ↓
สร้างบัญชี
     ↓
สร้าง Subscription
     ↓
แสดงค่าบริการ
     ↓
ลูกค้าชำระเงิน
     ↓
Admin ยืนยัน
     ↓
ระบบเปิดใช้งาน
     ↓
ลูกค้าใช้งานระบบ
     ↓
บันทึกยอดเก็บเงิน
     ↓
สรุปยอดรายวัน
     ↓
สรุปยอดรายเดือน
     ↓
ถึงวันหมดอายุ
     ↓
แจ้งเตือน
     ↓
ชำระเงิน
     ↓
ต่ออายุ
```

หาก Flow นี้ทำงานได้ครบ ระบบก็สามารถเริ่มนำไปทดลองกับลูกค้าจริงได้

---

# 31. แนวทางพัฒนาต่อ

หลังจาก MVP สามารถแบ่งการพัฒนาเป็น:

## Phase 1

**MVP**

* Web Application
* Multi-Tenant
* User Login
* Subscription
* Payment Manual
* Daily Collection
* Dashboard
* Basic Report

## Phase 2

**Automation**

* Payment Gateway
* Auto Verification
* LINE Notification
* Email Notification
* Automatic Invoice
* Automatic Renewal

## Phase 3

**Scale**

* Mobile App
* Advanced Reporting
* Analytics
* API
* Accounting Integration
* Multiple Plans
* Multiple Branches
* Advanced Permission

---

# 32. สรุป Business Concept

ระบบนี้ไม่ควรถูกมองเป็นเพียงโปรแกรมสำหรับบันทึกยอดเก็บเงิน แต่ควรออกแบบเป็น **Platform สำหรับให้บริการลูกค้าหลายรายแบบ Subscription**

โมเดลหลักคือ:

```text
                 SERVICE PROVIDER
                       │
                       ▼
              ┌─────────────────┐
              │   DCM Platform  │
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Tenant A      Tenant B      Tenant C
          │            │            │
       ฿5,000        ฿5,000        ฿5,000
       /month        /month        /month
```

ดังนั้น **Subscription Management + Multi-Tenant Architecture** ควรถูกวางเป็นส่วนหนึ่งของ Core Architecture ตั้งแต่เริ่มต้น ไม่ควรนำมาเพิ่มภายหลัง

---

# 33. ข้อสรุปสำหรับการเริ่ม MVP

สิ่งที่ควรให้ความสำคัญเป็นลำดับแรก:

1. **Multi-Tenant**
2. **Authentication / User Management**
3. **Subscription Management**
4. **Payment & Payment Confirmation**
5. **Subscription Lock / Unlock**
6. **Daily Collection**
7. **Dashboard**
8. **Daily / Monthly Summary**
9. **Audit Log**
10. **Security & Backup**

เมื่อ 10 ส่วนนี้ทำงานร่วมกันได้ ระบบจะมีพื้นฐานเพียงพอสำหรับการนำไปให้ลูกค้ารายแรกทดลองใช้งานจริง

---

## End Goal

เป้าหมายของระบบคือการเปลี่ยนจาก

> **Software ที่ติดตั้งให้ลูกค้าแต่ละราย**

ไปเป็น

> **บริการออนไลน์ที่ลูกค้าสมัครและจ่ายค่าบริการรายเดือนเพื่อใช้งาน**

ซึ่งจะทำให้สามารถเพิ่มลูกค้าได้เรื่อย ๆ โดยใช้ Platform เดียวกัน และสร้างรายได้แบบ **Recurring Revenue** จาก Subscription รายเดือน
