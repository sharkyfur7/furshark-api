# Furshark API (Express API)

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

### GET /lastfm/recent

Retrieves recent tracks for a Last.fm user

**Query Parameters:**

- `user` (required) - Last.fm username
- `limit` (optional) - Number of tracks to return (default: 50, minimum: 1)

**Example:**

```
GET /lastfm/recent?user=username&limit=10
```

**Response:** `200 OK`

For response contents, see [last.fm/api getRecentTracks method](https://www.last.fm/api/show/user.getRecentTracks) or the type `RecentTracks` from `src/types.ts`

**Error Responses:**

- `400 Bad Request` - Missing required parameter
- `500 Internal Server Error` - API request failed

### GET /lastfm/info

Retrieves user information about a Last.fm user

**Query Parameters:**

- `user` (required) - Last.fm username

**Example:**

```
GET /lastfm/info?user=username
```

**Response:** `200 OK`

For response contents, see [last.fm/api getInfo method](https://www.last.fm/api/show/user.getInfo) or the type `UserInfo` from `src/types.ts`

**Error Responses:**

- `400 Bad Request` - Missing required parameter
- `500 Internal Server Error` - API request failed

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

- `NTFY_FURSHARK_API` - NTFY URL for API notifications
- `NTFY_MOBILE` - NTFY URL for mobile notifications
- `LASTFM_KEY` - Last.fm API key

Optional:

- `DEV_ENV` - Set to disable rate limiting (development mode)

## Scheduled Tasks

- **Weekly Backup:** Every Sunday at 2:00 AM, the database is automatically backed up (backup is also created when the program is started)

## Development

Runs on port 3000 and accepts connections from all interfaces (`0.0.0.0`).
