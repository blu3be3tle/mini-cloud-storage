# Mini Cloud Storage System

A backend service simulating cloud file storage with per-user quotas, concurrency-safe operations, soft deletes, and content-based deduplication — built to demonstrate solid backend engineering practices.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **Concurrency-safe uploads** — using database transactions + row-level locking
- **Per-user storage quota** — 500 MB hard limit, enforced atomically
- **Deduplication** — same-content files (via SHA-256 hash) share physical storage
- **Soft deletes** — deleted files free up quota immediately
- **Unique filenames per user** — prevents accidental overwrites
- **Optimized schema** — proper indexes for fast lookups
- **Postman collection** — included for quick API testing

## 🏗 Architecture

```
                ┌──────────────────────┐
                │   API Client         │
                │ (Postman / curl / …) │
                └──────────┬───────────┘
                           │
                    ┌──────┴──────┐
                    │  Express API │
                    └──────┬──────┘
                           │
                 ┌─────────┴─────────┐
                 │   Service Layer    │  ← business logic, validation
                 └─────────┬─────────┘
                           │
                  ┌────────┴────────┐
                  │  PostgreSQL     │
                  │  └─────────────┘│
                  │   users         │
                  │   files         │  ← deduplicated content
                  │   user_files    │  ← ownership & metadata
                  └─────────────────┘
```

**Core Upload Flow (simplified)**

1. Begin transaction
2. `SELECT … FOR UPDATE` on user → lock & read current usage
3. Check quota headroom
4. Compute file hash → check for existing file record
5. Insert / reference → commit

This pattern prevents over-allocation even under high concurrency.

## 🗂 Project Structure

```
mini-cloud-storage/
├── src/
│   ├── controllers/       ← route handlers
│   │   └── fileController.js
│   ├── services/          ← core business logic
│   │   └── fileService.js
│   ├── routes/            ← Express route definitions
│   │   └── fileRoutes.js
│   ├── db/                ← connection pool & helpers
│   │   └── pool.js
│   ├── utils/             ← constants, helpers
│   │   └── constants.js
│   └── app.js             ← Express app setup
├── sql/
│   └── schema.sql         ← database schema + indexes
├── postman_collection.json
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/<your-username>/mini-cloud-storage.git
cd mini-cloud-storage

# 2. Install
npm install

# 3. Database setup
# Create DB (one time)
createdb cloud_storage   # or via pgAdmin / psql

# Apply schema
psql -d cloud_storage -f sql/schema.sql

# 4. Configure
cp .env.example .env
# Then edit .env with your PostgreSQL credentials

# 5. Start (with auto-reload)
npm run dev
```

Server runs on `http://localhost:3000` by default.

## 📡 API Endpoints

| Method   | Endpoint                         | Description            | Body / Params                    |
| -------- | -------------------------------- | ---------------------- | -------------------------------- |
| `POST`   | `/users/:userId/files`           | Upload file            | `{ file_name, size, file_hash }` |
| `DELETE` | `/users/:userId/files/:fileId`   | Soft-delete file       | —                                |
| `GET`    | `/users/:userId/files`           | List active files      | —                                |
| `GET`    | `/users/:userId/storage-summary` | Get usage & quota info | —                                |

**Request examples** (JSON body)

```json
// Upload
{
  "file_name": "profile-v2.png",
  "size": 1428765,
  "file_hash": "sha256:2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
}
```

Note: `file_hash` is treated as an opaque string. Prefixes like `sha256:` are optional and not enforced.

All endpoints expect `userId` as URL param (for simplicity in this demo).

## 🧪 Testing

1. Import `postman_collection.json` into Postman
2. Update environment variables (base URL, user IDs…)
3. Run requests or the full collection runner

> **Tip**: Because of unique filename + hash constraints, repeated runs with static data may fail. Use dynamic values (UUIDs, timestamps) or reset DB state. Use dynamic filenames (e.g. timestamps) in Postman to avoid conflicts across runs.

## ❗ Error Handling

Example responses:

**Storage limit exceeded**

```json
{ "error": "Storage limit exceeded" }
```

**Duplicate file name**

```json
{ "error": "File with same name already exists" }
```

**File not found**

```json
{ "error": "File not found" }
```

## 🗝 Key Design Choices

- **Two-table approach** (`files` + `user_files`) → enables safe deduplication
- **Application-level quota check inside transaction** → simplest correct solution without triggers
- **Soft deletes** → `deleted_at` timestamp → quota calculation ignores deleted entries
- **Upload timestamp tracking** → `uploaded_at` column records when a file was uploaded
- **Unique filenames per user** → enforced at application level to prevent conflicts
- **No physical file storage** → this demo focuses on metadata & concurrency (easy to extend to disk/S3)

## 🚀 Scaling & Production Notes

For 100k+ users consider:

- Cache computed storage usage (Redis)
- Move blobs to object storage (S3 / MinIO / GCS)
- Rate limiting + request validation (Joi / Zod)
- Structured logging (Pino)
- Observability (Prometheus metrics, OpenTelemetry)
- Horizontal scaling (multiple API instances + load balancer)

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-thing`)
3. Commit your changes (`git commit -m 'Add amazing thing'`)
4. Push to the branch (`git push origin feature/amazing-thing`)
5. Open a Pull Request

## 📄 License

MIT © 2026 Abu Ratin Shoeb

Built with focus on correctness, concurrency safety, and clean architecture.

Made in Dhaka, Bangladesh 🇧🇩
