# Student Hub — API Reference

Base URL (dev): `http://localhost:3000`
All paths versioned under `/api/v1`.

## Auth Model

Cookie-based sessions (Devise).
- Session cookie: `_student_hub_session` (HttpOnly)
- CSRF cookie: `XSRF-TOKEN` (JS-readable)
- Client sends `credentials: 'include'` on every request
- For POST/PATCH/PUT/DELETE, send `X-CSRF-Token` header with the `XSRF-TOKEN` cookie value

Error envelope (all errors):
`{ "error": { "code": "...", "message": "...", "details": {...} } }`

---

## Endpoint Index

### Authentication

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/register` | Create account + session |
| POST | `/auth/login` | Sign in |
| DELETE | `/auth/logout` | Sign out (requires CSRF) |
| GET | `/auth/me` | Current user + profile |

### Profiles

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/profiles?page=&per_page=` | List discoverable profiles |
| GET | `/profiles/:id` | View one profile |
| GET | `/me/profile` | Own profile |
| PATCH | `/me/profile` | Update own profile / name |
| PUT | `/me/interests` | Replace interests |
| PUT | `/me/skills` | Replace skills |
| POST | `/me/portfolio_links` | Add portfolio link |
| DELETE | `/me/portfolio_links/:id` | Delete own link |

### Projects

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/projects?page=&per_page=&category=&owner_id=&q=` | List / filter / search |
| GET | `/projects/:id` | View project |
| POST | `/projects` | Create project (owner = current user) |
| PATCH | `/projects/:id` | Update own project |
| DELETE | `/projects/:id` | Delete own project |

### Discovery

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/discovery?page=&per_page=` | Discover profiles (excludes acted-on) |
| POST | `/discovery/:user_id/pass` | Pass on a profile |
| POST | `/discovery/:user_id/connect` | Connect (may create match) |
| POST | `/discovery/:user_id/super_connect` | Super-connect |

### Matches

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/matches?page=&per_page=` | Current user's matches |
| GET | `/matches/:id` | View a match |
| DELETE | `/matches/:id` | Unmatch |

### Conversations & Messages

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/conversations?page=&per_page=` | List conversations |
| GET | `/conversations/:id` | View conversation + recent messages |
| GET | `/conversations/:id/messages?limit=&cursor=` | Paginated messages (cursor) |
| POST | `/conversations/:id/messages` | Send message |
| DELETE | `/conversations/:id/messages/:id` | Delete own message |

### Settings

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/me/settings` | Get all settings |
| PATCH | `/me/settings` | Update any subset |

---

## Status Codes

- `200` OK
- `201` Created
- `204` No Content
- `400` Bad Request (missing required params)
- `401` Unauthorized (not signed in)
- `404` Not Found (also used for non-owned resources — we don't leak existence via 403)
- `422` Unprocessable Content (validation errors)
- `429` Too Many Requests (rate limited, includes `Retry-After`)
- `500` Internal Server Error

---

## Conventions

- **IDs are UUIDs** (strings)
- **Timestamps are ISO 8601 UTC**
- **Lists use offset pagination** (`?page=&per_page=`, `meta` in response)
- **Messages use cursor pagination** (`?cursor=&limit=`, `next_cursor` + `has_more` in response)
- **API paths are versioned** (`/api/v1/...`)

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Login (IP) | 10 / 20s |
| Login (email) | 5 / 20s |
| Register (IP) | 5 / hour |
| Discovery (user) | 100 / min |
| Messages (user) | 60 / min |
| Global (IP) | 300 / 5 min |

---

**Detailed request/response shapes:** see the controllers and serializers in `app/` (or run the test suite — every shape is exercised in `spec/requests/`).
