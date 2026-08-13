# PriorityQ — Priority-Aware Queue Management System

**Live Demo:** https://priorityflow-hq.vercel.app

PriorityQ is a full-stack, priority-aware queue management platform designed to route requests based on urgency rather than simple first-come-first-served ordering.

The core workflow is:

**Request → Priority Evaluation → Queue Routing → Staff Assignment → Real-Time Management → Service → Analytics**

## ✨ Features

- Role-based authentication and authorization
- User, Staff/Operator, and Admin dashboards
- Priority-aware request routing
- Configurable priority rules
- Staff priority review and override
- Real-time queue management
- Queue and counter management
- Request transfer between queues
- OTP verification via SMS and email
- Live queue position and estimated wait time
- Notifications
- Admin analytics
- Audit logging
- Historical request tracking
- Responsive user experience
- Premium dark-first UI with Framer Motion animations

## 🧠 Priority Engine

PriorityQ evaluates incoming requests against configurable rules and assigns a workflow priority:

| Priority | Meaning |
|---|---|
| 🔴 CRITICAL | Immediate staff review |
| 🟠 HIGH | Urgent workflow handling |
| 🔵 NORMAL | Standard processing |
| ⚪ LOW | Lower urgency |

Priority suggestions are intended as workflow assistance. They do not replace professional judgment or diagnose medical conditions.

## 👥 Roles

### USER

Users can:

- Submit requests
- Verify contact information
- View their token
- Track queue position
- View estimated wait time
- Receive notifications
- View request history
- Leave a queue

### OPERATOR / TRIAGE LEAD

Staff can:

- View live queues
- Call the next request
- Start service
- Complete requests
- Transfer requests
- Review priority suggestions
- Change priority
- Manage counters
- Pause queues

### ADMIN

Admins can:

- Manage users
- Manage staff
- Configure queues
- Configure priority rules
- View analytics
- View audit logs
- Manage system configuration

## 🏗️ Architecture

```text
React + TanStack Start
        │
        │ REST API + JWT
        ▼
Node.js + Express
        │
        ├── Authentication
        ├── Queue Management
        ├── Priority Engine
        ├── OTP
        ├── Admin APIs
        └── Audit Logging
        │
        ▼
    MongoDB Atlas

```
