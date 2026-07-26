# Website backend (Express API)

## Endpoints

### GET /

Health check

**Response:** `200 OK`

### GET /guestbook

Retrieves all guestbook messages.

**Response:**

```js
let response = {
  count: number,
  entries: {
    id: number,
    name: string,
    content: string,
    reply_to: number | null,
    site: string | null,
    created_at: string,
  },
};
```

### POST /guestbook

Adds a new message to the guestbook

**Request Body:**

```js
let request_body = {
  name: string,
  content: string,
  reply_to: number, // optional
  site: string, // optional, MUST be a URL
};
```

**Response:** `200 OK`

**Error Responses:**

- `400 Bad Request` - Missing required fields or invalid data

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

- `user` (required) - Last.fm username
- Any additional params are forwarded to Last.fm (e.g. `limit`, `page`, `extended`)

**Examples:**

```
GET /lastfm/proxy/user.getRecentTracks?user=username&limit=10
GET /lastfm/proxy/user.getInfo?user=username
```

**Response:** `200 OK` (raw Last.fm API JSON response)

See [Last.fm API docs](https://www.last.fm/api) for response formats.

**Error Responses:**

- `400 Bad Request` - Missing `user` param or disallowed method
- `500 Internal Server Error` - Last.fm API request failed

### POST /ntfy

Sends a notification

**Request Body:**

```js
let request_body = { text: string };
```

**Response:** `200 OK`

**Error Responses:**

- `400 Bad Request` - Missing required field
- `500 Internal Server Error` - Failed to process notification

## Rate Limiting

Rate limiting is enabled in production (when `DEV_ENV` is not set):

- 100 requests per 5 minutes per IP
- Standard `RateLimit` headers are used

## Environment Variables

Required:

- `NTFY_BACKEND` - NTFY URL for backend notifications
- `NTFY_MOBILE` - NTFY URL for mobile notifications
- `LASTFM_KEY` - Last.fm API key

Optional:

- `DEV_ENV` - Set to disable rate limiting (development mode)

## Scheduled Tasks

- **Weekly Backup:** Every Sunday at 2:00 AM, the database is automatically backed up (backup is also created when the program is started)

## Development

Runs on port 3000 and accepts connections from all interfaces (`0.0.0.0`).
