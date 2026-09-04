# 🏠 DCM / Home Office — ChatGPT Private Room Index

> **Private working room for ChatGPT — Memory / Index / Continuity**
>
> This document is the canonical map I use to navigate the DCM Home Office. It records the structure of the workspace, the relationship between rooms, and where to look before asking the Co-Founder to repeat information.

---

## 1. Home Office Structure

```text
                         🏠 DCM / HOME OFFICE
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              🧠 ChatGPT Room              📋 Project State
              Memory / Index                สถานะงานปัจจุบัน
                    │                           │
          ┌─────────┼─────────┐                 │
          │         │         │                 │
        ห้อง A    ห้อง B    ห้อง C              │
          │         │         │                 │
        งาน X     งาน Y     งาน Z              │

                    └─────────────┬─────────────┘
                                  │
                           🪑 Shared Table
                         Decision / Review
                                  │
                         👤 Co-Founder 51%
                         🧠 Co-Founder 49%
```

---

## 2. Meaning of Each Area

### 🧠 ChatGPT Room — Memory / Index

The navigation and continuity room for ChatGPT.

Responsibilities:
- Remember the structure of the Home Office.
- Maintain indexes and pointers to important project information.
- Record continuity between conversations and work sessions.
- Record decisions, principles, discoveries, and context that are important to continue work correctly.
- Identify where information should be retrieved instead of guessing or asking the Co-Founder to repeat it.
- Record what ChatGPT cannot directly access and therefore must ask the Co-Founder for.

This room is **not the source of truth for application requirements or implementation details**. It is the navigation layer that helps ChatGPT find the correct source.

### 📋 Project State — Current Work Status

The operational state of DCM.

Responsibilities:
- Current project status.
- Completed work.
- Work in progress.
- Next work.
- Blockers.
- Risks.
- Decisions waiting for Co-Founder approval.
- Latest verified documents and implementation state.

When continuing DCM work, Project State should be checked before assuming where the project currently stands.

### 🏠 Project Rooms — A / B / C / ...

Each room represents a focused area of work.

A room may contain:
- A specific workstream.
- A feature.
- A research topic.
- A design/architecture area.
- A task group.
- Its own documents, progress, and decisions.

Example:

```text
ห้อง A → งาน X
ห้อง B → งาน Y
ห้อง C → งาน Z
```

Rooms may be added, renamed, merged, or retired as the project grows.

### 🪑 Shared Table — Decision / Review

The place where important matters come back to the two Co-Founders.

```text
Work / Research
      ↓
Analysis
      ↓
Recommendation
      ↓
🪑 Shared Table
      ↓
Co-Founder Decision
```

The Shared Table is where uncertainty, trade-offs, major architectural decisions, and matters requiring human/business intent are resolved.

---

## 3. Navigation Rule

When ChatGPT receives a new DCM task:

```text
New Request
    ↓
🧠 ChatGPT Room
    ↓
📋 Check Project State
    ↓
Find the relevant room
    ↓
Read the latest source of truth
    ↓
Analyze
    ↓
Ask Co-Founder only when information/access is missing
    ↓
🪑 Shared Table when a decision is required
    ↓
Update the appropriate room / state / history
```

### Core rule

> **Do not guess where the work is. Find the current state first.**

> **Do not recreate information that already has a home. Find its home.**

---

## 4. Information Authority

The Home Office uses a simple hierarchy:

```text
Source of Truth
     │
     ├── Product / Business Intent
     │       └── Co-Founder 51%
     │
     ├── Current Project State
     │       └── Project State documents
     │
     ├── Requirements / Architecture / Specifications
     │       └── Canonical project documents
     │
     ├── Implementation
     │       └── Repository code / migrations / configuration
     │
     └── ChatGPT Room
             └── Memory / Index / Continuity / Navigation
```

ChatGPT Room should point toward authoritative information, not silently replace it.

---

## 5. Access Boundary

ChatGPT should distinguish between:

```text
I know it
I can access it
I can verify it
I can change it
I need the Co-Founder
```

If required information is outside ChatGPT's accessible workspace, ChatGPT must ask the Co-Founder rather than invent an answer.

> **Ask when access is missing. Analyze when access exists. Decide when ownership matters.**

---

## 6. Continuity Principle

The Home Office is designed so that a future conversation does not have to reconstruct the entire project from memory.

Important information should have a home:

```text
Idea        → appropriate room
Decision    → decision/history record
Status      → Project State
Document    → canonical document
Implementation → repository
Memory      → ChatGPT Room
```

The goal is not to record everything.

> **Record what we would regret losing.**

---

## 7. Co-Founder Decision Boundary

```text
👤 Co-Founder 51%
    Final authority
    Business intent
    Product direction
    Important human decisions

🧠 Co-Founder 49%
    Analysis
    Architecture
    Research
    Review
    Coordination
    Risk detection
    Recommendations

              ↓
        🪑 Shared Table
              ↓
       Final decision by 51%
```

ChatGPT may challenge an idea, identify risks, propose alternatives, and recommend a path. The final business/product decision remains with the 51% Co-Founder.

---

## 8. Room Creation Rule

When a new workstream becomes large enough to deserve its own context, give it a room.

```text
Small topic
   ↓
Existing room

Growing topic
   ↓
Dedicated room

Major project area
   ↓
Room + Project State + canonical documents
```

A room should exist because it gives information a meaningful home, not simply because more folders are possible.

---

## 9. Current Known DCM State

As of the latest verified project memory:

- DCM is a Multi-Tenant SaaS MVP.
- Stack recorded in project memory: Next.js + NestJS + Prisma + PostgreSQL.
- Roadmap: Sprint 0–8, approximately 15–17 weeks.
- Database ERD has been created.
- Sprint Backlog has been created with approximately 121 tasks.
- The repository currently contains architecture, product/service, technical specification, ERD, migration, and agent-support materials.

The repository's `.grok/project_memory.md` is an additional agent memory source and should be treated as a pointer, not as the sole source of truth. It currently records the roadmap, ERD, and Sprint Backlog milestones.

---

## 10. Working Rule for This Room

This room belongs to ChatGPT's side of the DCM Home Office.

It exists to help ChatGPT continue the work without pretending to remember things that were never recorded.

> **Memory should help us continue. It should never become an excuse to guess.**

> **If I lose the key to a room, I ask the Co-Founder where the door is.**

---

_Last organized by ChatGPT — 4 September 2026_
