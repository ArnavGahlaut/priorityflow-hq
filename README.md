# Priority Flow

Build a premium, production-quality web application called "PriorityQ" — an intelligent, real-time, priority-aware queue management platform.

IMPORTANT:

This is NOT a generic token generator and NOT a generic CRUD dashboard.

The core product is:

REQUEST

→ PRIORITY EVALUATION

→ QUEUE ROUTING

→ STAFF ASSIGNMENT

→ REAL-TIME QUEUE MANAGEMENT

→ SERVICE

→ ANALYTICS

The platform should solve the problem of treating every request equally when some requests are more urgent than others.

A user submits a request or describes an issue. The system evaluates configurable priority rules and flags the request as LOW, NORMAL, HIGH, or CRITICAL. The request is then routed to the appropriate queue. Staff can manage multiple queues, counters, and service providers in real time.

For healthcare-style demos, the system may flag concerning requests for urgent staff review, but it must NEVER claim to diagnose a medical condition. Priority classification is only a workflow/triage aid and final decisions remain with qualified staff.

==================================================

TECH / FRONTEND

==================================================

Use React and TypeScript.

Use Tailwind CSS.

Use Framer Motion for sophisticated animations and interactions.

Build reusable components and clean component architecture.

Use realistic demo data so the application looks complete immediately.

The frontend should be designed so a real Node/Express/MongoDB/Socket.IO backend can be connected later.

Do NOT create a fake backend architecture that pretends to be production-ready.

==================================================

VISUAL DIRECTION

==================================================

The website must look like a premium product that could appear in a high-end web design reel.

It should NOT look like:

- a college project

- a generic admin template

- a basic Bootstrap dashboard

- a generic AI-generated SaaS

- excessive glassmorphism

- excessive gradients

- giant rounded cards everywhere

- cartoon illustrations

- unnecessary 3D graphics

Visual inspiration should be the level of polish found in modern products such as Linear, Vercel, Stripe, and high-end operations software, without copying any specific design.

Use:

- sophisticated dark-first design

- strong typography

- excellent spacing

- subtle borders

- restrained shadows

- clean grids

- strong visual hierarchy

- information-dense operational screens

- semantic status colors

- premium micro-interactions

Priority colors:

CRITICAL → red

HIGH → orange

NORMAL → blue/neutral

LOW → muted

Use colors only when they communicate meaning.

==================================================

MOTION DESIGN

==================================================

Use Framer Motion extensively but intelligently.

The landing page should feel cinematic and highly polished.

Use:

- staggered text reveals

- fade + translate entrances

- scroll-triggered animations

- viewport-based animations

- animated counters

- smooth chart reveals

- queue item movement

- priority transitions

- notification animations

- modal transitions

- tab transitions

- hover interactions

- button press feedback

- layout animations

- AnimatePresence for state changes

- subtle parallax where appropriate

Animations must communicate system behavior.

Do NOT animate everything.

Avoid excessive bouncing and distracting motion.

The actual dashboard should prioritize speed and usability, while the landing page can be more cinematic.

==================================================

LANDING PAGE

==================================================

Create a premium storytelling landing page.

Hero headline:

"Queues shouldn't decide who waits."

Subheadline:

"Priority-aware queue management that routes urgent requests, coordinates staff, and keeps everyone updated in real time."

Primary CTA:

"Join a Queue"

Secondary CTA:

"Open Operations"

Hero visual:

Create a sophisticated live queue visualization.

Show:

CRITICAL

#201  NOW SERVING

HIGH

#107

#108

NORMAL

#114

#115

#116

Make the queue subtly animate.

As the user scrolls, tell the product story.

--------------------------------------------------

SECTION: THE PROBLEM

--------------------------------------------------

Show a traditional first-come-first-served queue.

Requests appear to stack up.

Waiting time increases.

Then transition the visual story into:

"Priority changes everything."

Use scroll-triggered animation.

--------------------------------------------------

SECTION: PRIORITY ENGINE

--------------------------------------------------

Make this a major visual centerpiece.

Show:

REQUEST

↓

PRIORITY ENGINE

↓

┌──────────┬──────────┬──────────┐

NORMAL     HIGH       CRITICAL

QUEUE      QUEUE      QUEUE

Animate requests being evaluated and routed into different queues.

Example requests:

Routine request → NORMAL

Concerning/urgent request → HIGH

Critical flag → CRITICAL

Use the wording "priority flag" or "staff review" rather than medical diagnosis.

--------------------------------------------------

SECTION: REAL-TIME OPERATIONS

--------------------------------------------------

Show an animated operations dashboard preview.

Display:

Waiting

34

High Priority

5

Currently Serving

4

Average Wait

11m 24s

Then show live queue updates.

A request moves from:

WAITING → CALLED → SERVING → COMPLETED

Staff status should change dynamically.

--------------------------------------------------

SECTION: REAL-TIME USER EXPERIENCE

--------------------------------------------------

Show a user screen:

TOKEN #107

Priority:

HIGH

Current Position:

#3

Estimated Wait:

12 min

LIVE ●

Then animate a staff operator calling another request.

The user's position changes:

#3 → #2

Estimated wait:

12 min → 8 min

Show a subtle "LIVE UPDATE" notification.

This demonstrates the value of real-time communication.

--------------------------------------------------

SECTION: ANALYTICS

--------------------------------------------------

Show premium operational analytics.

Metrics:

186 Served

34 Waiting

11m 24s Average Wait

92% Counter Utilization

Charts:

- Queue length over time

- Average waiting time

- Requests served per hour

- Priority distribution

- Counter utilization

- Average service duration

Charts should animate when entering the viewport.

Numbers should count up smoothly.

==================================================

APPLICATION STRUCTURE

==================================================

Create separate experiences for:

1. USER

2. STAFF

3. ADMIN

==================================================

USER PAGES

==================================================

Dashboard

Show:

Active Request

Token

Priority

Queue

Current Position

Estimated Wait

Live Status

Example:

YOUR REQUEST

Token #107

Priority:

HIGH

Queue:

Priority Assessment

Position:

#2

Estimated Wait:

8 min

Status:

● WAITING

Add a visual queue tracker.

--------------------------------------------------

NEW REQUEST

--------------------------------------------------

Create a polished multi-step form.

Step 1:

Select Service

Examples:

General Consultation

Priority Assessment

Support Desk

Document Verification

Step 2:

Describe Request

Step 3:

Additional Information

Step 4:

Review

After submission:

REQUEST RECEIVED

Token:

#107

Priority:

HIGH

Queue:

Priority Assessment

Estimated Wait:

8 minutes

Show:

"Priority flagged for staff review."

Do NOT claim to diagnose the user.

--------------------------------------------------

MY QUEUE

--------------------------------------------------

Show:

Token

Position

Priority

Queue

Estimated Wait

Status

Allow:

Leave Queue

View Details

--------------------------------------------------

HISTORY

--------------------------------------------------

Show previous requests.

Columns:

Request ID

Priority

Queue

Wait Time

Service Time

Status

Date

--------------------------------------------------

NOTIFICATIONS

--------------------------------------------------

Examples:

"Your request is now #2 in queue."

"Please proceed to Counter 3."

"Your estimated wait has changed to 6 minutes."

"Your priority request has been reviewed."

==================================================

STAFF OPERATIONS CENTER

==================================================

This should be the most powerful screen in the application.

Header:

"Operations Center"

Metrics:

Waiting

34

High Priority

5

Currently Serving

4

Average Wait

11m 24s

Then show LIVE QUEUES.

CRITICAL

#201 — Immediate staff review

#203 — Immediate staff review

HIGH PRIORITY

#107

#108

#112

#114

#118

NORMAL

#121

#122

#123

#124

Provide controls:

CALL NEXT

START SERVICE

COMPLETE

TRANSFER

PAUSE QUEUE

The CALL NEXT action should prioritize the highest configured priority according to queue rules.

--------------------------------------------------

TRIAGE / PRIORITY REVIEW

--------------------------------------------------

Create a dedicated staff review interface.

Example:

Request #107

Description:

"User submitted request..."

System Priority Suggestion:

HIGH

Reason:

"Request contains configured high-priority indicators."

Actions:

CONFIRM PRIORITY

CHANGE PRIORITY

SEND FOR REVIEW

Show disclaimer:

"Priority suggestions assist staff workflow and do not replace professional judgment."

--------------------------------------------------

COUNTERS / STAFF

--------------------------------------------------

Show service stations:

Counter 1

● AVAILABLE

Counter 2

● SERVING #104

Elapsed 06:21

Counter 3

● SERVING #105

Elapsed 03:42

Counter 4

● PAUSED

Controls:

Call Next

Pause

Transfer

Complete

==================================================

ADMIN

==================================================

Admin pages:

Users

Staff

Queue Configuration

Priority Rules

Analytics

Audit Logs

System Settings

--------------------------------------------------

PRIORITY RULES

--------------------------------------------------

Create an interface for configurable priority rules.

Example:

Condition:

"Emergency keyword detected"

Priority:

HIGH

Queue:

Priority Assessment

Another:

Condition:

"Routine request"

Priority:

NORMAL

Queue:

General

Rules should look configurable rather than hardcoded.

==================================================

AUDIT LOG

==================================================

Show:

Timestamp

User

Action

Request ID

Previous State

New State

Example:

14:32:08

Staff #24

Priority changed

Request #107

NORMAL → HIGH

==================================================

RESPONSIVE DESIGN

==================================================

Desktop-first for staff and admin.

Mobile-first for users.

Users must be able to:

- submit requests

- view token

- view queue position

- view estimated wait

- receive notifications

comfortably from mobile.

==================================================

DEMO DATA

==================================================

Populate the application with realistic data.

Include:

30+ waiting requests

Multiple queues:

General

Priority

Critical

Multiple staff members.

Multiple counters.

Different priority levels.

Realistic wait times.

Historical analytics.

Notifications.

Audit events.

The application must look alive and production-ready immediately.

==================================================

MICRO-INTERACTIONS

==================================================

Add polished interactions:

- live queue position updates

- subtle queue movement

- status transitions

- toast notifications

- skeleton loading

- hover states

- animated table updates

- smooth modal transitions

- animated counters

- priority badge transitions

- notification entrance/exit

Do not over-animate operational screens.

==================================================

MOST IMPORTANT PRODUCT IDEA

==================================================

The product is NOT:

"Generate a token and wait."

The product is:

"Understand request priority, route it to the correct queue, coordinate staff, and continuously update everyone in real time."

The central flow must be visually and functionally obvious:

REQUEST

↓

PRIORITY EVALUATION

↓

QUEUE ROUTING

↓

STAFF ASSIGNMENT

↓

REAL-TIME MANAGEMENT

↓

SERVICE

↓

ANALYTICS

Make this the identity of the product.

==================================================

FINAL QUALITY BAR

==================================================

The result should feel like a real startup product.

It should look impressive within the first 5 seconds.

It should have the visual polish of a premium web design showcase.

The landing page should be cinematic and animated.

The application dashboard should be fast, clean, dense, and highly usable.

Prioritize visual hierarchy, typography, spacing, interaction quality, and meaningful motion.

Do not create unnecessary features just to increase the feature count.

Build the experience around the core concept of intelligent priority-aware queue management.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/84562f54-9e26-4282-be4e-a0d62c947944).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
