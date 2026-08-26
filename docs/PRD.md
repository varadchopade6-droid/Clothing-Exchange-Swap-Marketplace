# ReWear Product Requirements Document

## Overview

ReWear is a web marketplace for direct clothing exchanges. Members can publish a garment, find available pieces by category or city, make an item-for-item proposal, negotiate in a private swap conversation, and record the completed exchange.

## Problem statement and objectives

Wearable clothing is often left unused because resale can be time-consuming and conventional marketplaces focus on cash transactions. ReWear makes reuse easier through a straightforward swap flow. Its objectives are to reduce friction in finding exchange partners, give members a transparent rule-based value estimate, and keep swap coordination and moderation within one application.

## Users and scope

Members create and manage clothing listings, browse and filter available items, propose swaps, chat with the other participant, and track requests. Administrators review listings, disputes, users, exchanges, and database-derived activity metrics. Approved entrepreneur accounts can additionally use the Stage 3 product and service workflows.

In scope: authentication, profiles, listing CRUD, image URLs, availability, filters, rule-based valuation, local matching, swaps, participant-only messages, disputes, and administrator moderation/analytics.

Out of scope: payments, shipping, identity/condition verification, precise map locations, real-time sockets, email notifications, password reset, native mobile clients, and automated recommendations.

## Functional requirements

- Registration requires name, email, password, and city. Passwords are bcrypt-hashed and API access uses expiring JWTs.
- A listing has title, type, brand, size, condition, estimated swap value, city, optional image URLs, owner, and availability status. Only its owner can edit or remove it.
- The public marketplace supports text, category/type, size, brand, condition, and city filters. Removed and unavailable items are excluded from public browsing.
- The valuation endpoint deterministically combines a category base with brand and condition multipliers. The UI labels the result as an **Estimated Swap Value**, not a market price.
- A member can offer one available item for another member's available item. The recipient may accept or reject; the requester may cancel. Both participants can confirm an agreement, begin an exchange, and mark it complete. Acceptance reserves both listings and cancels competing pending requests for either item.
- Each swap has a participant-only conversation with persistent, ordered messages. Empty messages and non-participant access are rejected.
- City-level suggestions use stored listing data, availability, type, and estimated-value proximity. Exact addresses are neither collected nor displayed.
- Administrators are enforced server-side and can inspect users, listings, swaps, disputes, and real database metrics; they can remove listings and resolve disputes.

## Non-functional requirements

The application is a responsive React single-page app backed by a REST Express API and MongoDB. It validates user input, has server-side ownership and role checks, limits request JSON to 1 MB, allows only configured CORS origins, and avoids exposing password hashes or public contact details.

## Primary flows

Member flow: register/login → create listing → browse/filter → open item → choose own item and propose swap → chat → recipient accepts → both confirm → start/complete → review history.

Admin flow: sign in as an administrator → open dashboard → inspect actual analytics, listings, swaps, and disputes → remove inappropriate listings or update a dispute status.

## Modules and data

Pages include listings, item detail, authentication, dashboard/listing editor, profile, swap requests, chat, transactions, and admin. MongoDB collections include users, clothing, swaps, messages, disputes, and the Stage 3 commerce collections (products, services, orders, service requests, reviews, complaints, and categories).

## Technology and constraints

Client: React, React Router, Vite. API: Node.js, Express, JWT, bcrypt. Data: MongoDB/Mongoose. Tests: Node test runner, Supertest, mongodb-memory-server. The project intentionally uses external image URLs and REST polling rather than a media service or WebSockets.

## KPIs, assumptions, and future work

Useful internal KPIs are available listings, total members, swap requests, completed swaps, and completion conversion; these are calculated from database records. The app assumes members use city-level locations and arrange exchanges safely themselves. Future work may add trusted image storage, notifications, verification, sustainability tracking, community groups, a mobile client, and carefully designed recommendation features.
