# Job Aggregator Server - API Documentation

## Base URL
```
http://localhost:{PORT}/api
```
Default PORT: `3000`

---

## Rate Limiting
- All `/api/*` endpoints are rate-limited
- **Limit**: 100 requests per 15 minutes
- **Response on limit**: `HTTP 429`
```json
{ "error": "Too many requests, please try again later." }
```

---

## Authentication
**No authentication required.** All endpoints are publicly accessible.

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

**Response `500`:**
```json
{ "error": "error message" }
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

**Response `400` (query too short):**
```json
{ "error": "Search query must be at least 2 characters" }
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

## Data Model: Job

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

**Note:** All endpoints are read-only (GET only). No POST/PUT/DELETE endpoints.
