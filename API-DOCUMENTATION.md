# Job Aggregator Server - API Documentation

## Base URL
```
http://localhost:{PORT}/api
```
Default PORT: `3000`

---

## Authentication

### API Key System
API keys are optional but provide higher rate limits. Pass the key in the `x-api-key` header:

```
GET /api/jobs?page=1
x-api-key: sk_live_xxxxx
```

### Rate Limit Tiers

| Tier | Requests/Min | Key Required |
|------|-------------|--------------|
| `anonymous` | 30 | No |
| `free` | 300 | Yes |
| `paid` | 5000 | Yes |

### Response on Rate Limit (`HTTP 429`):
```json
{ "error": "Rate limit exceeded. Tier 'anonymous' is limited to 30 requests per minute." }
```

---

## Security Implementation
- **API keys hashed with SHA-256** before storage (like passwords)
- Raw keys only shown **once** at generation time
- Inactive keys are automatically rejected
- Rate limits tracked by key ID (not IP) for authenticated users

---

## Endpoints

### Health Check
#### `GET /health`
Check server status.

**Response `200`:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-11T12:00:00.000Z"
}
```

---

### Jobs

#### `GET /api/jobs` — List Jobs
List jobs with filtering, sorting, and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (min: 1) |
| `limit` | integer | `20` | Results per page (1-100) |
| `search` | string | -- | Search in `title`, `company`, `description` (case-insensitive) |
| `location` | string | -- | Filter by location |
| `salary_min` | integer | -- | Minimum salary filter |
| `salary_max` | integer | -- | Maximum salary filter |
| `jobType` | string | -- | Filter by job type (Full-time, Part-time, etc.) |
| `source` | string | -- | Filter by source: `myjobs` or `bdjobs` (exact match) |
| `sort` | string | `createdAt` | Field to sort by |
| `order` | string | `desc` | Sort order: `asc` or `desc` |

**Response `200`:**
```json
{
  "jobs": [
    {
      "_id": "6789abcdef0123456789abcd",
      "title": "Senior Software Engineer",
      "company": "Tech Company",
      "location": "Dhaka",
      "salary": "Negotiable",
      "salary_min": 80000,
      "salary_max": 120000,
      "jobType": "Full-time",
      "postedDate": "2026-05-01",
      "deadline": "2026-05-30",
      "description": "Job description...",
      "requirements": "Requirements...",
      "vacancy": "2",
      "experience": "3+ years",
      "remoteJob": false,
      "source": "myjobs",
      "jobUrl": "https://example.com/job/123",
      "hash": "abc123...",
      "createdAt": "2026-05-11T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

#### `GET /api/jobs/stats` — Job Statistics
Get aggregate counts by source.

**Response `200`:**
```json
{
  "totalJobs": 150,
  "myjobsCount": 80,
  "bdjobsCount": 70
}
```

---

#### `GET /api/jobs/search` — Search Jobs
Dedicated full-text search endpoint.

**Query Parameters:**

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `q` | string | -- | **Yes** | Search query (min 2 characters) |
| `limit` | integer | `20` | No | Max results (1-100) |

**Searches in:** `title`, `company`, `description`, `location`

**Response `200`:**
```json
{
  "jobs": [/* matching jobs */],
  "count": 5
}
```

---

#### `GET /api/jobs/:id` — Get Single Job
Get a job by MongoDB ObjectId.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | 24-character hex MongoDB ObjectId |

**Response `200`:**
```json
{
  "_id": "6789abcdef0123456789abcd",
  "title": "Senior Software Engineer",
  "company": "Tech Company",
  "location": "Dhaka",
  "salary": "Negotiable",
  "salary_min": 80000,
  "salary_max": 120000,
  "jobType": "Full-time",
  "postedDate": "2026-05-01",
  "deadline": "2026-05-30",
  "description": "Job description...",
  "requirements": "Requirements...",
  "vacancy": "2",
  "experience": "3+ years",
  "remoteJob": false,
  "source": "myjobs",
  "jobUrl": "https://example.com/job/123",
  "hash": "abc123...",
  "createdAt": "2026-05-11T12:00:00.000Z"
}
```

**Response `400` (invalid ID):**
```json
{ "error": "Invalid job ID format" }
```

**Response `404` (not found):**
```json
{ "error": "Job not found" }
```

---

### API Key Management

#### `POST /api/apikeys/generate` — Generate API Key
Create a new API key. **Save the returned key - it will not be shown again.**

**Request Body:**
```json
{
  "name": "Frontend App",
  "tier": "free"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | Name for the key (for your reference) |
| `tier` | string | No | `free` (default) or `paid` |

**Response `201`:**
```json
{
  "message": "API key generated successfully. Save this key - it will not be shown again.",
  "data": {
    "_id": "6789abcdef0123456789abcd",
    "name": "Frontend App",
    "tier": "free",
    "rateLimit": 300,
    "active": true,
    "key": "sk_live_a1b2c3d4e5f6...",
    "createdAt": "2026-05-11T12:00:00.000Z"
  }
}
```

---

#### `GET /api/apikeys` — List All API Keys
List all API keys (does not show key values).

**Response `200`:**
```json
{
  "count": 2,
  "keys": [
    {
      "_id": "6789abcdef0123456789abcd",
      "name": "Frontend App",
      "tier": "free",
      "rateLimit": 300,
      "active": true,
      "lastUsedAt": "2026-05-11T12:00:00.000Z",
      "createdAt": "2026-05-10T10:00:00.000Z"
    }
  ]
}
```

---

#### `PUT /api/apikeys/:id/activate` — Activate Key
Enable a previously deactivated key.

**Response `200`:**
```json
{
  "message": "API key activated",
  "data": {
    "_id": "6789abcdef0123456789abcd",
    "name": "Frontend App",
    "active": true
  }
}
```

---

#### `PUT /api/apikeys/:id/deactivate` — Deactivate Key
Disable a key (key validation will fail).

**Response `200`:**
```json
{
  "message": "API key deactivated",
  "data": {
    "_id": "6789abcdef0123456789abcd",
    "name": "Frontend App",
    "active": false
  }
}
```

---

#### `DELETE /api/apikeys/:id` — Delete Key
Permanently remove a key.

**Response `200`:**
```json
{
  "message": "API key deleted",
  "data": {
    "_id": "6789abcdef0123456789abcd",
    "name": "Frontend App"
  }
}
```

---

## Data Models

### Job

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | MongoDB document ID |
| `title` | String | **Yes** | Job title |
| `company` | String | No | Hiring company |
| `location` | String | No | Job location |
| `salary` | String | No | Raw salary text |
| `salary_min` | Number | No | Minimum salary (for filtering) |
| `salary_max` | Number | No | Maximum salary (for filtering) |
| `jobType` | String | No | Full-time, Part-time, Contract, etc. |
| `postedDate` | String | No | Date posted |
| `deadline` | String | No | Application deadline |
| `description` | String | No | Job description |
| `requirements` | String | No | Requirements/qualifications |
| `vacancy` | String | No | Number of vacancies |
| `experience` | String | No | Required experience |
| `remoteJob` | Boolean | No | Remote work allowed (default: `false`) |
| `source` | String | **Yes** | Data source: `myjobs` or `bdjobs` |
| `jobUrl` | String | **Yes** | Original job listing URL |
| `hash` | String | No | Deduplication hash |
| `createdAt` | Date | Auto | Record creation timestamp |

### ApiKey

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | MongoDB document ID |
| `name` | String | Reference name for the key |
| `apiKey` | String | **SHA-256 hashed** key (never stored raw) |
| `tier` | String | `anonymous`, `free`, or `paid` |
| `rateLimit` | Number | Requests per window |
| `rateLimitWindowMs` | Number | Window in milliseconds (default: 60000) |
| `active` | Boolean | Whether the key is enabled |
| `lastUsedAt` | Date | Last successful validation |
| `createdAt` | Date | Creation timestamp |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/job-aggregator` | MongoDB connection string |
| `SCRAPER_BASE_URL` | `http://localhost:3002` | External scraper service URL |

---

## API Summary Table

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/api/jobs` | List/filter/search jobs with pagination |
| `GET` | `/api/jobs/stats` | Job counts by source |
| `GET` | `/api/jobs/search` | Full-text search |
| `GET` | `/api/jobs/:id` | Get job by ID |
| `POST` | `/api/apikeys/generate` | Generate new API key |
| `GET` | `/api/apikeys` | List all keys |
| `PUT` | `/api/apikeys/:id/activate` | Activate key |
| `PUT` | `/api/apikeys/:id/deactivate` | Deactivate key |
| `DELETE` | `/api/apikeys/:id` | Delete key |
