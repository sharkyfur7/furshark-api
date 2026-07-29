# Documentation

The whole thing runs on port 3000.

## Environment Variables

Required:

- `NTFY_BACKEND` - NTFY URL for backend notifications
- `NTFY_MOBILE` - NTFY URL for mobile notifications
- `LASTFM_KEY` - Last.fm API key
- `DB_PATH` - Path to the SQLite database file
- `BACKUP_DIR` - Directory for database backups
- `BACKUPS_KEPT` - Number of backups to retain

Optional:

- `DEV_ENV` - Set to disable rate limiting (development mode)
- `TUNNEL_TOKEN` - Used in Docker Compose for tunnel setup

## Scheduled Tasks

- **Weekly Backup:** Every Sunday at 2:00 AM, the database is automatically backed up (backup is also created when the program is started)

## Rate Limiting

Rate limiting is enabled in production (when `DEV_ENV` is not set):

- 100 requests per 5 minutes per IP
- Standard `RateLimit` headers are used

## Endpoints

### GET /

Health check

**Response:** `200 OK`

### GET /guestbook

Retrieves all guestbook messages.

**Response:**

```ts
interface GuestbookResponse {
  count: number;
  entries: GuestbookEntry[];
}

interface GuestbookEntry {
  id: number;
  name: string;
  content: string;
  replies: GuestbookEntry[];
  reply_count: number;
  site: string | null;
  created: string;
}
```

### POST /guestbook

Adds a new message to the guestbook.

**Request Body (JSON):**

| Field      | Type   | Required | Notes                          |
| ---------- | ------ | -------- | ------------------------------ |
| `name`     | string | yes      |                                |
| `content`  | string | yes      |                                |
| `reply_to` | number | no       | Must be a positive integer     |
| `site`     | string | no       | Must be a valid HTTP/HTTPS URL |

**Example:**

```json
{
  "name": "Jane Doe",
  "content": "Rat activities",
  "reply_to": 21,
  "site": "https://example.com"
}
```

**Response:** `200 OK`

**Error Responses:**

- `400 Bad Request` - Validation failed (missing required fields, invalid URL, etc.). Returns a Zod error tree.

### GET /lastfm

Health check for Last.fm API availability

**Response:** `200 OK`

**Error Responses:**

- `502 Bad Gateway` - Last.fm API appears to be down

### GET /lastfm/proxy/:method

Proxies requests to the Last.fm API. The API key and required headers are injected server-side. All query params are forwarded to Last.fm.

**Allowed methods:** `user.getRecentTracks`, `user.getInfo`, `user.getTopAlbums`, `user.getTopArtists`, `user.getTopTracks`

**Path Parameter:**

- `method` - Last.fm API method (must be one of the allowed methods above)

**Query Parameters:**

Parameters for the Last.fm API apply. All parameters are proxied to the API.

**Examples:**

```
GET /lastfm/proxy/user.getRecentTracks?user=username&limit=10
GET /lastfm/proxy/user.getInfo?user=username
```

**Response:** `200 OK` (raw Last.fm API JSON response)

See [Last.fm API docs](https://www.last.fm/api) for response formats.

**Error Responses:**

- `400 Bad Request` - Missing param or disallowed method
- `500 Internal Server Error` - Last.fm API request failed

### POST /ntfy

Sends a notification

**Request Body:**

```js
{
  text: string;
}
```

**Response:** `200 OK`

**Error Responses:**

- `400 Bad Request` - Missing required field
- `500 Internal Server Error` - Failed to process notification
