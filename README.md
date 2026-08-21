# ReWear Clothing Exchange Marketplace

Stage 1 foundation for a MERN clothing-swap application. It supports registration, login, JWT-protected profile access, and creating/browsing clothing listings.

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

## Tests

Run `npm test --prefix server`. Tests use an in-memory MongoDB instance and do not require a local database.
