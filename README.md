# ReWear Clothing Exchange Marketplace

Stage 2 core marketplace for a MERN clothing-swap application. It supports registration, login, JWT-protected profile access, listing management, server-side marketplace filters, and swap requests.

## Prerequisites

- Node.js 20+
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup

1. Copy `server/.env.example` to `server/.env` and provide `MONGODB_URI` and `JWT_SECRET`.
2. Run `npm install` in the repository root, `server`, and `client` directories.
3. Run `npm run dev` from the root.

The client runs on `http://localhost:5173`; the API runs on `http://localhost:5000`.

## API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me` (Bearer token)
- `GET /api/clothing`
- `POST /api/clothing` (Bearer token)
- `GET /api/clothing/mine` (Bearer token)
- `GET /api/clothing/:id`
- `PATCH /api/clothing/:id` (owner only)
- `DELETE /api/clothing/:id` (owner only)
- `GET /api/swaps` (Bearer token; accepts `direction` and `status` filters)
- `POST /api/swaps` (Bearer token)
- `PATCH /api/swaps/:id` (Bearer token; `accept`, `reject`, `cancel`, or `complete`)

`GET /api/clothing` performs filtering on the server. It accepts `search`, `type`, `size`, `condition`, `brand`, `location`, and `status` query parameters.

## Tests

Run `npm test --prefix server`. Tests use an in-memory MongoDB instance and do not require a local database.
