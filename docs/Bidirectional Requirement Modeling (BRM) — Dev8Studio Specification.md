# Bidirectional Requirement Modeling (BRM)

**Developed by:** Dev8Studio
**Version:** 0.1 Draft
**Date:** 3 September 2026
**Status:** Concept / Foundational Specification

> **Working principle:** Requirement should remain understandable, visible, editable, and synchronized throughout the journey from user intent to software implementation.

---

## 1. Purpose

Bidirectional Requirement Modeling (BRM) is a Dev8Studio approach for designing software in which textual requirements and visual system models are two synchronized representations of the same underlying Requirement Model.

BRM is intended to reduce the gap between:

- what a user wants to achieve,
- what a business owner means,
- what a product designer models,
- what a developer implements, and
- what the resulting software actually does.

BRM does not require the user to understand programming languages, frameworks, databases, APIs, or infrastructure before expressing a software need.

The primary objective is to make software requirements **visible, interactive, explainable, and reversible** before and during implementation.

---

## 2. Working Definition

> **Bidirectional Requirement Modeling (BRM)** is a software requirement modeling approach in which textual requirements and visual system models remain continuously synchronized as representations of a shared underlying model, allowing meaningful changes made through either representation to update, explain, and propagate to the other representation.

In simple terms:

> **Change the words → the picture changes.**
>
> **Change the picture → the requirement changes.**
>
> **Both describe the same system.**

---

## 3. Core Idea

Traditional requirement workflows commonly move in one direction:

```text
User Need
   ↓
Requirement
   ↓
Design
   ↓
Technical Specification
   ↓
Code
   ↓
Software
```

After a decision is made, the earlier representation may become documentation rather than a living part of the system model.

BRM proposes a continuously connected model:

```text
                 ┌──────────────────────┐
                 │  Shared Requirement  │
                 │        Model         │
                 └──────────┬───────────┘
                            ↕
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      🧭 Requirement View           🧩 Graphic View
      Text / Wizard                 Nodes / Flow / Logic
             │                             │
             └──────────────┬──────────────┘
                            ↕
                       AI / Human
                      Interpretation
                            ↓
                     Technical Model
                            ↓
                      Implementation
```

The Wizard and Graphic Coding interface are therefore not two separate sources of truth. They are two views of the same Requirement Model.

---

## 4. Design Principles

### 4.1 User Value First

The process begins with the user's real problem, goal, workflow, and desired outcome rather than with a technology choice.

### 4.2 One Model, Multiple Representations

The Wizard and Graphic Coding views must represent one shared model rather than maintain independent copies of requirements.

### 4.3 Bidirectional Editing

A meaningful change made in either view must be capable of updating the shared model and reflecting the resulting change in the other view.

### 4.4 Continuous Visibility

While the user answers Wizard questions, the corresponding system behavior should become visible through the Graphic view whenever enough information exists to represent it.

### 4.5 Explainable Changes

When a change originates from the Graphic view, the Requirement view should explain what requirement or decision changed. When a change originates from the Wizard, the Graphic view should make the resulting behavioral change visible.

### 4.6 Technology-Agnostic Modeling

Requirements and business logic should be modeled independently from implementation technology wherever practical. Technology selection occurs after the intended behavior is sufficiently understood.

### 4.7 Human Ownership

AI may interpret, suggest, generate, or transform requirements, but the human remains the owner of the intended behavior and the authority for accepting meaningful changes.

### 4.8 Progressive Detail

Users should be able to work at an appropriate level of abstraction. A business user may see business workflow while a technical user can inspect system, data, and implementation models.

### 4.9 Traceability

A requirement should remain traceable from user intent through visual model, technical decision, implementation, and test where practical.

### 4.10 Reversibility

Changes should be versioned so that users can understand what changed, why it changed, and return to a previous valid state.

---

## 5. The BRM Workspace

The proposed Dev8Studio BRM workspace contains two primary synchronized surfaces.

```text
┌──────────────────────────────┬──────────────────────────────┐
│ 🧭 REQUIREMENT WIZARD        │ 🧩 GRAPHIC CODING            │
│                              │                              │
│ Question                     │ Nodes                        │
│ Answer                       │ Connections                  │
│ Option                       │ Conditions                   │
│ Rule                         │ Workflow                     │
│ Explanation                  │ Data relationships            │
│                              │                              │
│            ↕ SYNCHRONIZED SHARED MODEL ↕                    │
└──────────────────────────────┴──────────────────────────────┘
```

### 5.1 Requirement Wizard

The Wizard is the user-facing conversational/structured representation of the system requirement.

It should progressively discover:

- User and stakeholder goals
- Problems and pain points
- Actors / roles
- Devices and environments
- Workflows
- Business rules
- Data needs
- Permissions
- Exceptions
- Notifications
- Integrations
- Constraints
- Priority
- Acceptance criteria

The Wizard should not force the user to answer technical questions that are unnecessary for defining the desired behavior.

### 5.2 Graphic Coding

Graphic Coding is the visual representation of system intent and behavior.

Depending on abstraction level, nodes may represent:

- Actor
- Screen
- Action
- Decision
- Workflow step
- Data entity
- Event
- Condition
- Permission
- Notification
- Integration
- Service
- State
- Output

Graphic Coding is not intended to be a literal visual replacement for source code. It is a visual modeling language that describes what the software should do and, at deeper levels, how the system can implement it.

---

## 6. Bidirectional Synchronization

### 6.1 Wizard → Graphic

Example:

Wizard:

> Customer can pay by cash or bank transfer.

Graphic model:

```text
                 Payment
                    │
             ┌──────┴──────┐
             ▼             ▼
           Cash         Transfer
```

If the Wizard adds credit card:

```text
                 Payment
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
      Cash       Transfer      Card
```

### 6.2 Graphic → Wizard

If a user adds `Verify Transfer` to the Graphic flow:

```text
Payment
   ↓
Verify Transfer
   ↓
Update Balance
```

The Wizard should communicate the corresponding requirement change, for example:

> **Payment workflow updated:** Bank transfers must be verified before the account balance is updated.

The user should be able to accept, reject, or inspect the change.

---

## 7. Shared Requirement Model

The central Requirement Model is the conceptual source of truth.

A simplified model may contain:

```text
RequirementModel
├── Intent
├── Actors
├── Goals
├── Workflows
├── Screens
├── Actions
├── Conditions
├── Data
├── Permissions
├── Notifications
├── Integrations
├── Constraints
├── Decisions
├── AcceptanceCriteria
└── Versions
```

The exact storage schema is an implementation concern and should evolve independently from the conceptual BRM model.

---

## 8. Change Propagation

Every meaningful modification should produce a change event against the shared model.

```text
User Action
    ↓
Change Event
    ↓
Requirement Model Update
    ↓
Impact Analysis
    ├── Wizard update
    ├── Graphic update
    ├── UX impact
    ├── Data impact
    ├── Permission impact
    └── Technical impact
```

A change should not silently modify unrelated requirements.

Where a change creates ambiguity or conflicts, BRM should stop automatic propagation and request human confirmation.

---

## 9. Explainability Layer

BRM should make system changes understandable to non-technical users.

Example:

```text
Graphic change:

[Payment] → [Verify Payment] → [Update Balance]
```

BRM explanation:

> Added a payment verification step before updating the balance.
>
> Affected areas:
> - Payment workflow
> - Account balance update
> - Payment verification requirement
>
> New decision required:
> - Who is allowed to verify payments?

This turns a visual edit into an understandable requirement conversation.

---

## 10. Abstraction Levels

BRM should support progressive disclosure rather than exposing all technical complexity at once.

### Level 1 — User / Business

```text
Customer → Order → Payment → Receipt
```

### Level 2 — Workflow / Product

```text
Order
├── Pending
├── Confirmed
├── Paid
└── Cancelled
```

### Level 3 — System

```text
Order Service
      ↓
Payment Service
      ↓
Database
```

### Level 4 — Technology

```text
Next.js
Supabase
PostgreSQL
API / Edge Function
```

A single underlying model should connect these levels where appropriate.

---

## 11. Technology Selection

BRM deliberately separates **intent** from **implementation technology**.

The user may define:

> When a payment is confirmed, update the account balance and issue a receipt.

The system may later determine that the appropriate implementation could involve:

- Web framework
- Mobile framework
- Database
- Authentication provider
- Backend service
- API architecture
- Notification service
- Hosting platform

Technology selection should be driven by requirements, constraints, cost, maintainability, security, performance, and project context.

The same conceptual Requirement Model should ideally be implementable using more than one technology stack.

---

## 12. Relationship to Vibe Coding

BRM is complementary to Vibe Coding rather than a replacement for it.

```text
Vibe Coding
Human Intent → AI → Code
```

BRM proposes:

```text
Human Intent
     ↓
Requirement
     ↕
Graphic Model
     ↕
Business Logic
     ↓
Technical Model
     ↓
Vibe Coding / Implementation
     ↓
Software
```

Vibe Coding accelerates implementation.

BRM improves the quality, clarity, traceability, and user ownership of what is being implemented.

---

## 13. Relationship to No-Code / Low-Code

No-Code and Low-Code platforms generally provide predefined abstractions and implementation environments.

BRM is intended to model the desired behavior before committing to a particular implementation technology.

```text
No-Code / Low-Code
Problem
 ↓
Platform
 ↓
Available Components
 ↓
Application
```

BRM:

```text
Problem
 ↓
User Value
 ↓
Requirement
 ↕
Graphic Model
 ↓
Technology Mapping
 ↓
Implementation
```

BRM therefore aims to reduce dependency between requirement modeling and the eventual technology stack.

---

## 14. Product Playground Integration

The Dev8Studio Product Playground can act as the experiential front door to BRM.

```text
Product Playground
        ↓
Choose Product
        ↓
Choose Role
        ↓
Choose Device
        ↓
Choose Scenario
        ↓
Interact with Demo
        ↓
Click / Change / Explain
        ↓
BRM Requirement Model
        ↓
Estimate / Quote
        ↓
Implementation
```

A user should be able to click a real interface element and express:

> “I want this button to show the customer's complete payment history.”

The system can attach context automatically:

```text
Product
Role
Device
Screen
Component
Current behavior
Requested behavior
```

The request then becomes part of the BRM model.

---

## 15. AI's Role

AI is an interpreter, assistant, generator, and reviewer within BRM.

AI may:

- Ask clarifying questions
- Summarize user intent
- Convert natural language into structured requirements
- Suggest missing requirements
- Generate or modify visual nodes
- Explain visual changes in natural language
- Detect contradictions
- Identify dependencies
- Suggest technology mappings
- Generate technical specifications
- Generate code
- Generate tests

AI should not silently redefine business intent.

For meaningful changes, the system should preserve human approval and traceability.

---

## 16. Conflict Resolution

Bidirectional editing creates the possibility of conflicting changes.

Example:

- Wizard says payments require manual verification.
- Graphic model removes the verification node.

BRM should detect the conflict:

```text
⚠ Requirement Conflict

Wizard requirement:
Payment must be verified before balance update.

Graphic model:
Payment directly updates balance.

Choose:
[Keep Requirement]
[Keep Graphic Change]
[Review Difference]
```

The system must not silently choose one interpretation when the business meaning is ambiguous.

---

## 17. Versioning and Traceability

Each meaningful model state should be versionable.

Example:

```text
BRM v0.1
  ↓
Payment supports Cash
  ↓
BRM v0.2
  ↓
Added Bank Transfer
  ↓
BRM v0.3
  ↓
Added Verification
```

Each change should ideally record:

- What changed
- Who changed it
- When it changed
- Why it changed
- Source of change (Wizard / Graphic / AI / Developer)
- Affected requirements
- Affected model elements
- Approval state

---

## 18. Acceptance Criteria

A BRM implementation should eventually be considered successful when:

1. A user can express a requirement without knowing programming syntax.
2. The resulting requirement can be represented visually.
3. The visual model can be edited directly.
4. Changes in the Wizard are reflected in the Graphic model.
5. Meaningful Graphic changes are reflected in the Wizard.
6. Both views represent one underlying model.
7. Changes can be explained in human-readable language.
8. Ambiguities and conflicts are surfaced rather than silently resolved.
9. Requirements remain traceable through implementation.
10. Technology can be selected after the intended behavior is sufficiently understood.
11. The model can be versioned and reverted.
12. AI assists the process without becoming the owner of business intent.

---

## 19. Initial Dev8Studio Prototype Scope

The first prototype should deliberately be small.

### MVP-0

```text
Wizard
  ↕
Requirement Model
  ↕
Graphic Nodes
```

Support only:

- Actor
- Action
- Screen
- Decision
- Data
- Connection

And only a small set of synchronization behaviors:

- Add
- Remove
- Rename
- Connect
- Disconnect
- Change option
- Explain change
- Undo / redo

Do not begin with a full programming language replacement.

The first objective is to prove the fundamental claim:

> **A requirement can be edited through both natural-language/structured interaction and visual modeling while remaining one synchronized model.**

---

## 20. Long-Term Vision

If validated, BRM may become a foundational methodology for Dev8Studio's software development workflow and potentially an open conceptual framework for the wider software industry.

The long-term vision is:

```text
User
 ↓
Problem
 ↓
Value
 ↓
Requirement Wizard
 ↕
Graphic Coding
 ↕
AI Interpretation
 ↓
Technical Model
 ↓
Code Generation / Vibe Coding
 ↓
Testing
 ↓
Software
 ↓
Real User Feedback
 ↓
Requirement Model evolves
```

The model does not end when code is generated. Real-world use can feed new evidence back into the Requirement Model.

This creates a continuous software development loop:

> **Understand → Model → Build → Use → Learn → Refine**

---

## 21. Dev8Studio Philosophy

BRM is intended to embody a broader Dev8Studio principle:

> **Do not ask users to think like programmers in order to create software. Build a system that can understand how users think and work, then use technology as the implementation tool.**

The commercial philosophy remains:

> **Create value → avoid unnecessary harm → respect data → keep users in control → earn revenue from the value created.**

For Dev8Studio, software should be created because it solves a real problem, not merely because technology makes something possible.

---

## 22. Terminology

| Term | Meaning |
|---|---|
| BRM | Bidirectional Requirement Modeling |
| Requirement Model | Shared underlying representation of software intent and behavior |
| Requirement View | Human-readable representation of the Requirement Model |
| Wizard | Guided interface for discovering and editing requirements |
| Graphic Coding | Visual representation and manipulation of system behavior |
| Technology Mapping | Selection of implementation technologies based on requirements |
| Change Event | Recorded modification to the Requirement Model |
| Impact Analysis | Identification of elements affected by a change |
| Traceability | Ability to follow a requirement through design and implementation |
| Product Playground | Interactive environment for experiencing and modifying product concepts |

---

## 23. Open Questions for Future Versions

The following questions are intentionally unresolved in v0.1:

1. What is the formal schema of the Requirement Model?
2. What is the minimum universal Graphic Node vocabulary?
3. How should natural-language changes map to existing nodes?
4. How should ambiguous changes be resolved?
5. How should multiple users collaborate simultaneously?
6. How should permissions apply to the Requirement Model itself?
7. How should BRM map to existing standards such as UML, BPMN, user stories, and system specifications?
8. How should generated code remain traceable back to model elements?
9. How should implementation changes made directly in code propagate back into the model?
10. Can the model become portable across technology stacks?
11. What should be standardized and what should remain implementation-specific?
12. Should BRM eventually be published as an open specification?

---

## 24. Founding Statement

This document records the initial Dev8Studio formulation of **Bidirectional Requirement Modeling (BRM)** as a working concept and software-development approach.

The objective is not to claim novelty merely by naming an idea. The objective is to build, test, refine, document, and publish a useful methodology whose value can be demonstrated through real software development.

> **The name should follow the value.**
>
> **The specification should follow the working prototype.**
>
> **The industry should decide the lasting significance through adoption and evidence.**

---

**Next intended artifact:** `BRM — Conceptual Model & Synchronization Specification v0.2`

**Recommended next step:** define the canonical Requirement Model and the minimum Graphic Node/edge vocabulary before implementation begins.
