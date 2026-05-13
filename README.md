# Classic Rock API & Admin Dashboard

A full-stack music catalog platform for managing and exploring classic rock data, including albums, artists, genres, and tracks.

This project consists of:

- A RESTful ASP.NET Core API
- A React + Vite administrative dashboard
- SQL Server persistence using Entity Framework Core
- Auth0 authentication and authorization
- Azure-hosted deployments
- GitHub Actions CI/CD pipelines

The project was built as a long-term portfolio and learning platform focused on:

- API design
- relational database modeling
- authentication/authorization
- deployment pipelines
- frontend/backend architecture
- scalable CRUD workflows
- production-oriented engineering practices

---

# Features

## API Features

- CRUD operations for:
  - Albums
  - Artists
  - Genres
  - Tracks

- Relationship management:
  - Albums - Artists
  - Albums - Genres
  - Albums - Tracks
  - Artist roles on albums
  - Primary genre designation

- Filtering and query endpoints
- Validation and normalization
- Rate limiting
- Structured API responses
- Minimal API architecture
- Public and authenticated endpoint separation

---

## Admin Dashboard Features

- Album management UI
- Artist management UI
- Genre management UI
- Track management UI
- Relationship editing
- Authenticated & authorized admin actions
- Responsive modern UI
- React Query data caching & sync
- Route-based page architecture

---

# Tech Stack

## Backend

- C#
- ASP.NET Core Minimal API
- Entity Framework Core
- Azure App Services & SQL Database
- Auth0 JWT Authentication

---

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Query
- React Router
- shadcn/ui

---

## Infrastructure & Tooling

- Azure App Services & SQL Database
- GitHub Actions
- Swagger / OpenAPI
- GitHub
- VS Code

---

# Browsing Albums

The Classic Rock API provides a flexible album browsing endpoint that supports:

- filtering
- searching
- sorting
- pagination

This endpoint is intended for public-facing music exploration and frontend consumption.

---

# Endpoint

```http
GET /api/v1/albums/browse
```

---

# Query Parameters

| Parameter     | Type   | Description                                  |
| ------------- | ------ | -------------------------------------------- |
| `artist`      | string | Filter albums by artist name                 |
| `genre`       | string | Filter albums by genre name                  |
| `releaseYear` | int    | Filter by exact release year                 |
| `decade`      | int    | Filter by decade (example: `1970`)           |
| `search`      | string | Search album titles, artists, and genres     |
| `sort`        | string | Sort results                                 |
| `page`        | int    | Page number (default: `1`)                   |
| `pageSize`    | int    | Results per page (default: `20`, max: `100`) |

---

# Supported Sort Values

| Sort Value         | Description              |
| ------------------ | ------------------------ |
| `title`            | Title ascending          |
| `title_desc`       | Title descending         |
| `releaseyear`      | Release year ascending   |
| `releaseyear_desc` | Release year descending  |
| `score`            | Curated score ascending  |
| `score_desc`       | Curated score descending |

---

# Example Requests

## Browse All Albums

```http
GET /api/v1/albums/browse
```

---

## Filter by Artist

```http
GET /api/v1/albums/browse?artist=Pink Floyd
```

---

## Filter by Genre

```http
GET /api/v1/albums/browse?genre=Progressive Rock
```

---

## Filter by Decade

```http
GET /api/v1/albums/browse?decade=1970
```

---

## Search Albums

```http
GET /api/v1/albums/browse?search=dark
```

---

## Sort by Release Year Descending

```http
GET /api/v1/albums/browse?sort=releaseyear_desc
```

---

## Pagination Example

```http
GET /api/v1/albums/browse?page=2&pageSize=10
```

---

## Combined Query Example

```http
GET /api/v1/albums/browse?genre=Progressive&decade=1970&sort=score_desc&page=1&pageSize=10
```

---

# Example Response

```json
{
  "items": [
    {
      "id": "d4c8c0e4-4f52-4ec0-b8fd-4d6f70d5d84f",
      "title": "Wish You Were Here",
      "releaseYear": 1975,
      "curatedScore": 9.8,
      "artists": ["Pink Floyd"],
      "genres": ["Progressive Rock", "Psychedelic Rock"]
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

---

# Notes

- Filtering is case-insensitive.
- Search queries match:
  - album titles
  - artist names
  - genre names
- Pagination metadata is included with every response.
- Results are returned in a lightweight format intended for browsing and listing pages.

---

# Design Goals

The browsing endpoint was designed to:

- provide frontend-friendly querying
- support scalable filtering and pagination
- avoid over-fetching unnecessary data
- separate browsing concerns from detailed album retrieval
- serve as a foundation for future public music exploration features
