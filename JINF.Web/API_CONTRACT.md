# JINF API contract (what the frontend sends and expects)

This is the contract `src/api/client.ts` is written against. If an endpoint needs to look different,
change it here and in `client.ts`/`types.ts` together so the two stay in sync.

## General rules

- All paths start with `/api`. In development the Vite dev server forwards `/api/*` to `http://localhost:5132` (the `http` launch profile).
- JSON property names are **camelCase** (ASP.NET Core's default).
- Enums are sent as **strings** (`JsonStringEnumConverter`, already registered in `Program.cs`).
- Dates: `eventDate` is `yyyy-MM-dd` (`DateOnly`); timestamps such as `createdAt` are ISO 8601 UTC.
- Authenticated requests send `Authorization: Bearer <accessToken>`.
- **401** = missing/expired/invalid token. The frontend then clears the session and sends the user to the login page.
- **403** = logged in but not allowed (e.g. a normal user calling an admin endpoint).
- Error bodies the frontend can display: `ValidationProblemDetails` (`{ errors: { Field: ["…"] } }`), `ProblemDetails` (`{ title, detail }`), Identity errors (`[{ code, description }]`) or `MessageResponse` (`{ message }`). Don't put exception messages or stack traces in them.

## Enums

| Type | Values |
|---|---|
| `ReportType` | `"Lost"`, `"Found"` |
| `ItemStatus` | `"Open"`, `"Claimed"`, `"Returned"`, `"Archived"` |
| `ClaimStatus` | `"Pending"`, `"Approved"`, `"Rejected"` |
| Role | `"User"`, `"Admin"` (the frontend shows the Reception page only for `"Admin"`) |

## Shared shapes

```jsonc
// Category
{ "id": 5, "name": "Student card", "isSensitive": true }

// Location
{ "id": 2, "name": "Library" }

// ItemReport
{
  "id": 42,
  "reportType": "Found",
  "title": "Black Lenovo charger",
  "description": "65W USB-C charger…",
  "category": { "id": 1, "name": "Electronics", "isSensitive": false },
  "location": { "id": 4, "name": "Lab 1" },
  "eventDate": "2026-10-21",
  "status": "Open",
  "createdAt": "2026-10-21T10:12:00Z",
  "photoUrl": "/uploads/abc123.jpg",   // optional; omit or null when there is no photo
  "reporterId": "user-guid"
}
```

> Privacy (FR-15): for categories with `isSensitive: true`, the API should not return `photoUrl`, and should
> replace `description` for anyone except admins and the reporter. The frontend already hides them, but
> hiding in the browser alone is not enough.

```jsonc
// Claim
{
  "id": 7,
  "itemReportId": 42,
  "itemTitle": "Black Lenovo charger",
  "claimantName": "Sipho N.",
  "proofOfOwnership": "There's a strip of green tape near the plug end.",
  "status": "Pending",
  "createdAt": "2026-10-22T08:15:00Z",
  "decisionReason": null          // set when rejected
}

// User (from /api/auth/me)
{ "id": "user-guid", "fullName": "Test Student", "email": "student@example.com", "role": "User" }
```

## Endpoints

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | – | `{ fullName, email, password }` (password 15–128 chars) | any 2xx (body ignored) |
| POST | `/api/auth/login` | – | `{ email, password }` | `{ accessToken, tokenType, expiresIn }` (`LoginResponse`) |
| GET | `/api/auth/me` | user | – | `User` |
| GET | `/api/categories` | – | – | `Category[]` (active only) |
| GET | `/api/locations` | – | – | `Location[]` (active only) |
| GET | `/api/items` | – | query: `q`, `type`, `categoryId`, `locationId` (all optional) | `ItemReport[]`, newest first, excluding `Archived` |
| GET | `/api/items/{id}` | – | – | `ItemReport` or 404 |
| GET | `/api/items/mine` | user | – | `ItemReport[]` reported by the current user |
| POST | `/api/items` | user | `multipart/form-data`: `reportType`, `title`, `description`, `categoryId`, `locationId`, `eventDate`, optional `photo` (JPG/PNG/WEBP, ≤ 5 MB) | the created `ItemReport` (201) |
| POST | `/api/claims` | user | `{ itemReportId, proofOfOwnership }` | the created `Claim` (201) |
| GET | `/api/claims/mine` | user | – | `Claim[]` made by the current user |
| GET | `/api/claims` | admin | – | `Claim[]`, all claims, newest first |
| PUT | `/api/claims/{id}/approve` | admin | `{}` | 204 (item status becomes `Claimed`) |
| PUT | `/api/claims/{id}/reject` | admin | `{ reason }` | 204 |
| GET | `/api/admin/stats` | admin | – | `{ open, claimed, returned, pendingClaims }` (numbers) |

Browse and item details work without logging in (the Items page is public); everything else needs a token.
