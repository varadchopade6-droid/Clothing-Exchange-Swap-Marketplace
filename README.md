# ReWear

ReWear is a full-stack clothing exchange marketplace. Members list clothing, discover nearby items, propose swaps, negotiate in private conversations, and track an exchange through completion. The project also includes the Stage 3 commerce extension for approved entrepreneurs: products, services, orders, service requests, reviews, complaints, and administration.

## Problem and key features

ReWear helps extend a garment's useful life by making peer-to-peer exchanges easier to discover and manage.

- JWT authentication, member profiles, entrepreneur approval, and server-side role checks
- Clothing listings with image URLs, ownership controls, filtering, value estimates, and matching suggestions
- Swap requests with controlled lifecycle: pending, accepted, agreed, in progress, rejected, cancelled, completed
- Participant-only chat, disputes, moderation, and real-data admin analytics
- Optional product/service workflows, transaction history, availability, earnings, reviews, and complaints
- Responsive React interface with loading, empty, error, and keyboard-focus states

## Stack and architecture

- Client: React, React Router, Vite
- API: Node.js, Express, JWT, bcrypt
- Database: MongoDB with Mongoose
- Tests: Node test runner, Supertest, mongodb-memory-server

The React client calls a REST API under `/api`. Express controllers own validation and authorization; Mongoose models persist data; the browser never decides ownership or state transitions.

## Project structure

```text
client/                 React/Vite SPA
  src/pages/            marketplace, detail, dashboard, swaps, chat, admin
  src/services/api.js   authenticated API client
server/
  models/               MongoDB schemas
  controllers/          business logic and authorization checks
  routes/               REST routes
  middleware/           JWT, admin, and error handling
  test/api.test.js      integration coverage
docs/                   PRD and final requirements audit
```

## Local setup

Prerequisites: Node.js 20+ and MongoDB (local or Atlas).

1. Install dependencies:

   ```bash
   npm install
   npm install --prefix server
   npm install --prefix client
   ```

2. Copy `server/.env.example` to `server/.env` and set a real `JWT_SECRET`.
3. Start both applications:

   ```bash
   npm run dev
   ```

The client is available at `http://localhost:5173`; the API is available at `http://localhost:5000`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `5000`. |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Long, unique server secret. Never commit it. |
| `CLIENT_URL` | Yes in production | Comma-separated allowed client origins. |
| `VITE_API_URL` | Yes in production | Public API base URL ending in `/api`. |

No demo credentials are committed. Create an account locally; set an administrator role directly in the development database only when testing administration.

## API overview

| Area | Routes |
| --- | --- |
| Health/auth | `GET /api/health`, `POST /api/auth/register`, `POST /api/auth/login` |
| Profile/listings | `/api/users/me`, `/api/clothing`, `/api/clothing/mine`, `/api/clothing/:id/suggestions` |
| Exchanges/chat | `/api/swaps`, `/api/messages/conversations`, `/api/messages/:swapId`, `/api/disputes` |
| Commerce | `/api/products`, `/api/services`, `/api/orders`, `/api/service-requests`, `/api/reviews`, `/api/complaints` |
| Administration | `/api/admin/users`, `/api/admin/listings`, `/api/admin/swaps`, `/api/admin/disputes`, `/api/admin/analytics` |

Protected routes require `Authorization: Bearer <token>`. Server checks enforce ownership, participant access, administrator access, input validation, and valid status transitions.

## Testing and production build

```bash
npm test --prefix server
npm run build --prefix client
```

Tests run against an in-memory MongoDB and do not require a local database.

## Deployment

The repository includes `render.yaml` for the API and `client/vercel.json` for SPA routing. Create a MongoDB Atlas database, then:

1. Deploy `server/` to Render using the blueprint or a Node web service.
2. Set `MONGODB_URI`, a generated `JWT_SECRET`, and `CLIENT_URL` to the deployed Vercel URL.
3. Deploy `client/` to Vercel, set `VITE_API_URL=https://<api-host>/api`, and redeploy.
4. Smoke-test login, a listing, swap request, chat, and admin access.

## Limitations and future work

- Image storage accepts external image URLs; no upload/media service is configured.
- No payment, shipping, notifications, password-reset, email verification, or real-time chat service.
- Admin bootstrap and production account governance require operational procedures outside this repository.
- Add rate limiting, security headers, audit logs, and browser E2E tests before a public-scale launch.

See [the product requirements document](docs/PRD.md) and [the final requirements audit](docs/REQUIREMENTS_AUDIT.md) for the implemented scope and verification record.
