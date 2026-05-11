<div align="center">

# Job Aggregator Server

A RESTful API server for aggregating job listings from multiple sources.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

</div>

---

## Features

- **Job Aggregation**: Collects jobs from multiple sources (myjobs, bdjobs)
- **Advanced Filtering**: Search, filter by location, salary range, job type, source
- **Pagination**: Efficient data fetching with page/limit controls
- **API Key System**: Tiered rate limiting with optional authentication
- **Security**: Helmet security headers, CORS enabled, SHA-256 hashed keys

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 5.x |
| Database | MongoDB + Mongoose |
| Security | Helmet, CORS |
| Rate Limiting | express-rate-limit |
| Config | dotenv |

---

## Rate Limit Tiers

| Tier | Requests/Min | API Key Required |
|------|-------------|------------------|
| Anonymous | 30 | No |
| Free | 300 | Yes |
| Paid | 5000 | Yes |

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/job-aggregator` | MongoDB connection |
| `SCRAPER_BASE_URL` | `http://localhost:3002` | External scraper URL |

---

## Quick Start

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will be running at: `http://localhost:3000`

---

## API Reference

### Base URL
```
http://localhost:3000/api
```

### Authentication

API keys are optional but recommended for higher rate limits.

**Header:**
```
x-api-key: YOUR_API_KEY
```

**Generate a Key:**
```bash
curl -X POST http://localhost:3000/api/apikeys/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"My App","tier":"free"}'
```

---

## Endpoints

### Health Check

#### `GET /health`

**Response `200`:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-11T12:00:00.000Z"
}
```

---

### Jobs

#### `GET /api/jobs` - List Jobs

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Results per page (1-100) |
| `search` | string | -- | Search in title, company, description |
| `location` | string | -- | Filter by location |
| `salary_min` | integer | -- | Minimum salary |
| `salary_max` | integer | -- | Maximum salary |
| `jobType` | string | -- | Filter by job type |
| `source` | string | -- | Filter by source: `myjobs`, `bdjobs` |
| `sort` | string | `createdAt` | Sort field |
| `order` | string | `desc` | Sort order: `asc`, `desc` |

**Example:**
```
GET /api/jobs?search=developer&location=dhaka&salary_min=50000&page=1&limit=10
```

**Response `200`:**
```json
{
  "jobs": [
    {
      "_id": "6789abcdef0123456789abcd",
      "title": "Senior Software Engineer",
      "company": "Tech Company Ltd",
      "location": "Dhaka",
      "salary": "80000 - 120000 BDT",
      "salary_min": 80000,
      "salary_max": 120000,
      "jobType": "Full-time",
      "postedDate": "2026-05-01",
      "deadline": "2026-05-30",
      "description": "We are looking for an experienced...",
      "requirements": "3+ years experience in...",
      "vacancy": "2",
      "experience": "3+ years",
      "remoteJob": false,
      "source": "myjobs",
      "jobUrl": "https://example.com/job/123",
      "hash": "a1b2c3d4e5f6",
      "createdAt": "2026-05-11T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

#### `GET /api/jobs/stats` - Job Statistics

**Response `200`:**
```json
{
  "totalJobs": 150,
  "myjobsCount": 80,
  "bdjobsCount": 70
}
```

---

#### `GET /api/jobs/search` - Full-text Search

**Query Parameters:**

| Parameter | Type | Default | Required |
|-----------|------|---------|----------|
| `q` | string | -- | **Yes** |
| `limit` | integer | `20` | No |

**Searches in:** `title`, `company`, `description`, `location`

**Response `200`:**
```json
{
  "jobs": [/* matching job objects */],
  "count": 5
}
```

**Response `400`:**
```json
{
  "error": "Search query must be at least 2 characters"
}
```

---

#### `GET /api/jobs/:id` - Get Single Job

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | 24-char MongoDB ObjectId |

**Response `200`:**
```json
{
  "_id": "6789abcdef0123456789abcd",
  "title": "Senior Software Engineer",
  "company": "Tech Company Ltd",
  "location": "Dhaka",
  "salary": "80000 - 120000 BDT",
  "salary_min": 80000,
  "salary_max": 120000,
  "jobType": "Full-time",
  "postedDate": "2026-05-01",
  "deadline": "2026-05-30",
  "description": "We are looking for an experienced...",
  "requirements": "3+ years experience in...",
  "vacancy": "2",
  "experience": "3+ years",
  "remoteJob": false,
  "source": "myjobs",
  "jobUrl": "https://example.com/job/123",
  "hash": "a1b2c3d4e5f6",
  "createdAt": "2026-05-11T12:00:00.000Z"
}
```

**Response `400`:**
```json
{
  "error": "Invalid job ID format"
}
```

**Response `404`:**
```json
{
  "error": "Job not found"
}
```

---

### API Key Management

#### `POST /api/apikeys/generate` - Generate Key

**Request Body:**
```json
{
  "name": "Frontend Application",
  "tier": "free"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | Reference name |
| `tier` | string | No | `free` (default) or `paid` |

**Response `201`:**
```json
{
  "message": "API key generated successfully. Save this key - it will not be shown again.",
  "data": {
    "_id": "6789abcdef0123456789abcd",
    "name": "Frontend Application",
    "tier": "free",
    "rateLimit": 300,
    "active": true,
    "key": "<api_key>",
    "createdAt": "2026-05-11T12:00:00.000Z"
  }
}
```

---

#### `GET /api/apikeys` - List All Keys

**Response `200`:**
```json
{
  "count": 2,
  "keys": [
    {
      "_id": "6789abcdef0123456789abcd",
      "name": "Frontend Application",
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

#### `PUT /api/apikeys/:id/activate` - Activate Key

**Response `200`:**
```json
{
  "message": "API key activated",
  "data": {
    "_id": "6789abcdef0123456789abcd",
    "name": "Frontend Application",
    "active": true
  }
}
```

---

#### `PUT /api/apikeys/:id/deactivate` - Deactivate Key

**Response `200`:**
```json
{
  "message": "API key deactivated",
  "data": {
    "_id": "6789abcdef0123456789abcd",
    "name": "Frontend Application",
    "active": false
  }
}
```

---

#### `DELETE /api/apikeys/:id` - Delete Key

**Response `200`:**
```json
{
  "message": "API key deleted",
  "data": {
    "_id": "6789abcdef0123456789abcd",
    "name": "Frontend Application"
  }
}
```

---

## Data Models

### Job Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | **Yes** | Job title |
| `company` | String | No | Hiring company |
| `location` | String | No | Job location |
| `salary` | String | No | Raw salary text |
| `salary_min` | Number | No | Min salary for filtering |
| `salary_max` | Number | No | Max salary for filtering |
| `jobType` | String | No | Full-time, Part-time, etc. |
| `postedDate` | String | No | Date posted |
| `deadline` | String | No | Application deadline |
| `description` | String | No | Job description |
| `requirements` | String | No | Requirements/qualifications |
| `vacancy` | String | No | Number of vacancies |
| `experience` | String | No | Required experience |
| `remoteJob` | Boolean | No | Remote allowed (default: false) |
| `source` | String | **Yes** | `myjobs` or `bdjobs` |
| `jobUrl` | String | **Yes** | Original listing URL |
| `hash` | String | No | Deduplication hash |
| `createdAt` | Date | Auto | Creation timestamp |

---

## Project Structure

```
server/
├── src/
│   ├── middleware/
│   │   ├── auth.js          # API key validation middleware
│   │   └── rateLimit.js     # Tiered rate limiting
│   ├── models/
│   │   ├── ApiKey.js        # API key model (SHA-256 hashed)
│   │   └── Job.js           # Job listing model
│   └── routes/
│       ├── apikeys.js       # API key management routes
│       └── jobs.js          # Job listing routes
├── index.js                 # Express app entry point
├── package.json
├── .env.example
├── API-DOCUMENTATION.md
└── README.md
```

---

## License

ISC

---

<div align="center">

**Built with Node.js & Express**

</div>
